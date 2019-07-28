const { promisify } = require('util')
const realpath = require('./realpath.js')
const Node = require('./node.js')
const Link = require('./link.js')
const { resolve, join } = require('path')
const readdir = promisify(require('readdir-scoped-modules'))
const rpj = promisify(require('read-package-json'))

// this is the way it is to expose a timing issue which is difficult to
// test otherwise.  The creation of a Node may take slightly longer than
// the creation of a Link that targets it.  If the Node has _begun_ its
// creation phase (and put a Promise in the cache) then the Link will
// get a Promise as its cachedTarget instead of an actual Node object.
// This is not a problem, because it gets resolved prior to returning
// the tree or attempting to load children.  However, it IS remarkably
// difficult to get to happen in a test environment to verify reliably.
// Hence this kludge.
const newNode = (options) =>
  process.env._TEST_RPT_SLOW_LINK_TARGET_ === '1'
    ? new Promise(res => setTimeout(() =>
      res(new Node(options)), 10))
    : new Node(options)

const loadNode = ({ arborist, logical, physical, cache, rpcache, stcache, parent }) => {
  // cache temporarily holds a promise placeholder so we
  // don't try to create the same node multiple times.
  // this is very rare to encounter, given the aggressive
  // caching on realpath and lstat calls, but
  // it can happen in theory.
  const cached = cache.get(physical)
  // It's possible that a cached target is already loaded as a tree top,
  // but then gets its parent loaded later.
  if (cached)
    return Promise.resolve(cached).then(node => {
      node.parent = parent
      return node
    })

  const p = realpath(physical, rpcache, stcache, 0).then(real =>
    rpj(join(real, 'package.json'))
      .then(pkg => [pkg, null], er => [null, er])
      .then(([pkg, er]) =>
        physical === real ? newNode({
          arborist,
          pkg,
          logical,
          physical,
          er,
          cache,
          parent,
        })
        : new Link({
          arborist,
          pkg,
          logical,
          physical,
          realpath: real,
          er,
          cache,
          parent,
        })
      ),
    // if the realpath fails, don't bother with the rest
    er => new Node({ arborist, logical, physical, er, cache, parent }))

  cache.set(physical, p)
  return p
}

const loadChildren = (options) => {
  const { node, cache, rpcache, stcache } = options
  // if a Link target has started, but not completed, then
  // a Promise will be in the cache to indicate this.
  if (node.then) {
    return node.then(node =>
      loadChildren({ ...options, node }))
  }

  const nm = join(node.path || node.realpath, 'node_modules')
  return realpath(nm, rpcache, stcache, 0)
    .then(rm => readdir(rm).then(kids => [rm, kids]))
    .then(([rm, kids]) => Promise.all(
      kids.filter(kid => kid.charAt(0) !== '.')
      .map(kid => loadNode({
        parent: node,
        logical: join(nm, kid),
        physical: join(rm, kid),
        cache,
        rpcache,
        stcache,
      })))
    )
    .then(() => node.sortChildren())
    .catch(() => node)
}

const loadTree = (options) => {
  const { node, did, cache, rpcache, stcache } = options

  // impossible except in pathological ELOOP cases
  /* istanbul ignore next */
  if (did.has(node.realpath))
    return Promise.resolve(node)

  did.add(node.realpath)

  // load children on the target, not the link
  return loadChildren({
      node: node.target || node,
      cache,
      rpcache,
      stcache,
    })
    .then(node => Promise.all(
      node.children
        .filter(kid => !did.has(kid.realpath))
        .map(kid => loadTree({ ...options, node: kid }))
    ))
    .then(() => node.isTop ? node.loadDepinfo() : node)
}

const loadActual = (root, arborist) => {
  const cache = new Map()
  // we can assume that the cwd is real enough
  const cwd = process.cwd()
  const rpcache = new Map([[ cwd, cwd ]])
  const stcache = new Map()
  const p = realpath(root, rpcache, stcache, 0)
    .then(realRoot => loadNode({
      arborist,
      logical: root,
      physical: realRoot,
      cache,
      rpcache,
      stcache
    }))
    .then(node => loadTree({
      node,
      did: new Set(),
      cache,
      rpcache,
      stcache,
    }))

  return p
}

module.exports = loadActual