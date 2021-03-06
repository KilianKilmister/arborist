// An edge in the dependency graph
// Represents a dependency relationship of some kind

const npa = require('npm-package-arg')
const depValid = require('./dep-valid.js')
const _from = Symbol('_from')
const _to = Symbol('_to')
const _type = Symbol('_type')
const _spec = Symbol('_spec')
const _accept = Symbol('_accept')
const _name = Symbol('_name')
const _error = Symbol('_error')
const _loadError = Symbol('_loadError')
const _setFrom = Symbol('_setFrom')

const types = new Set([
  'prod',
  'dev',
  'optional',
  'peer',
  // REVIEW: peerOverride: changed from peerOptional
  'peerOverride',
  'workspace'
])

class Edge {
  constructor (options) {
    const { type, name, spec, accept, from } = options

    if (typeof spec !== 'string')
      throw new TypeError('must provide string spec')

    if (type === 'workspace' && npa(spec).type !== 'directory')
      throw new TypeError('workspace edges must be a symlink')

    this[_spec] = spec

    if (accept !== undefined) {
      if (typeof accept !== 'string')
        throw new TypeError('accept field must be a string if provided')
      this[_accept] = accept || '*'
    }

    if (typeof name !== 'string')
      throw new TypeError('must provide dependency name')
    this[_name] = name

    if (!types.has(type)) {
      throw new TypeError(
        `invalid type: ${type}\n` +
        `(valid types are: ${Edge.types.join(', ')})`)
    }
    this[_type] = type
    if (!from)
      throw new TypeError('must provide "from" node')
    this[_setFrom](from)
    this[_error] = this[_loadError]()
  }

  satisfiedBy (node) {
    return depValid(node, this.spec, this.accept, this.from)
  }

  //#region
  get workspace () {
    return this[_type] === 'workspace'
  }

  get prod () {
    return this[_type] === 'prod'
  }

  get dev () {
    return this[_type] === 'dev'
  }

  get optional () {
    // REVIEW: peerOverride: removed `peerOptional`check
    return this[_type] === 'optional'
  }

  get peer () {
    // REVIEW: peerOverride: changed from `peerOptional` to `peerOverride`
    return this[_type] === 'peer' || this[_type] === 'peerOverride'
  }

  // REVIEW: peerOverride: added `override` getter, could be used by ba "overrides"-RFC as well
  get override () { return this[_type] === 'peerOverride' /* || this[_type] === 'override' // <-- for "override"-RFC */}

  get type () {
    return this[_type]
  }

  get name () {
    return this[_name]
  }

  get spec () {
    return this[_spec]
  }

  get accept () {
    return this[_accept]
  }

  get valid () {
    return !this.error
  }

  get missing () {
    return this.error === 'MISSING'
  }

  get invalid () {
    return this.error === 'INVALID'
  }

  get peerLocal () {
    return this.error === 'PEER LOCAL'
  }

  get error () {
    this[_error] = this[_error] || this[_loadError]()
    return this[_error] === 'OK' ? null : this[_error]
  }
  //#endregion

  [_loadError] () {
    return !this[_to] ? (this.optional ? null : 'MISSING')
      : this.peer &&
          this.from === this.to.parent &&
          !this.from.isTop
        ? 'PEER LOCAL'
      : !depValid(this.to, this.spec, this.accept, this.from)
        ? 'INVALID'
      : 'OK'
  }

  reload (hard = false) {
    const newTo = this[_from].resolve(this.name)
    if (newTo !== this[_to]) {
      if (this[_to])
        this[_to].edgesIn.delete(this)
      this[_to] = newTo
      this[_error] = this[_loadError]()
      if (this[_to])
        this[_to].addEdgeIn(this)
    } else if (hard)
      this[_error] = this[_loadError]()
  }

  detach () {
    if (this[_to])
      this[_to].edgesIn.delete(this)
    this[_from].edgesOut.delete(this.name)
    this[_to] = null
    this[_error] = 'DETACHED'
    this[_from] = null
  }

  [_setFrom] (node) {
    this[_from] = node
    if (node.edgesOut.has(this.name))
      node.edgesOut.get(this.name).detach()
    node.addEdgeOut(this)
    this.reload()
  }

  get from () {
    return this[_from]
  }

  get to () {
    return this[_to]
  }
}

Edge.types = [...types]
Edge.errors = [
  'DETACHED',
  'MISSING',
  'PEER LOCAL',
  'INVALID',
]

module.exports = Edge
