const npa = require('npm-package-arg')
const fromPath = require('./from-path.js')
const semver = require('semver')
const {relative} = require('path')

/** @extends {Map<string, Map<string, PeerOverride>>} */
class PeerDepsMeta extends Map {

  /**
   * @param node {Node}
   */
  constructor (node) {

    const {
      package: {
        dependencies: deps = {},
        devDependencies: devDeps = {},
        peerDependenciesMeta: peerDepsMeta = {},
      },
      parent,
    } = node
    const parentPeerDepsMeta = Object(parent).peerDependenciesMeta || []

    super()
    for (const [dep, peers] of Object.entries(peerDepsMeta)) {
      delete peers.optional
      this.set(dep, new Map(Object.entries(peers).map(([peer, spec]) => [peer, formOverride(peer, spec)]))) // _!
    }

    // iterate over parent peerDepMeta
    for (const [dep, peers] of parentPeerDepsMeta) {
      const overrides = this.get(dep) || new Map()
      // iterate over the peer overrides in the parent peerDepMeta
      for (const [peer, override] of peers) {
        if (overrides.has(peer) || canOverrule(peer, override.origSpec, node)) continue
        else overrides.set(peer, override)
      }

      // no need to save an empty hash
      if (overrides.size) this.set(dep, overrides)
    }

    //*______
    // helpers
    /**
     * @param origPackage {string}
     * @param spec {string | { [dep: string]: string }}
     * @returns {PeerOverride}
     */
    function formOverride (origPackage, spec) {
      let [overridePackage, overrideSpec] =
        typeof spec === 'string'
          ? [origPackage, spec]
          : Object.entries(spec)[0] // should only have one entry
      if (overrideSpec === 'local')
        overrideSpec = deps[overridePackage] || devDeps[overridePackage]
      return {
        overridePackage,
        overrideSpec
      }
    }

    /**
     * * NOTE: stripped down copy of `./deps-valid.js`
     * @param {string} name
     * @param {string} [spec]
     * @returns {boolean} boolean
     */
    function canOverrule (name, spec) {
      if (!spec) return false
      try {
        const requested = npa.resolve(name, spec, fromPath(node))
        switch (requested.type) {
          case 'range':
            if (requested.fetchSpec === '*')
              return true
            // fallthrough
          case 'version':
            // if it's a version or a range other than '*', semver it
            return semver.satisfies(name.package.version, requested.fetchSpec, true)

          case 'directory':
            // directory must be a link to the specified folder
            return !!name.isLink &&
              relative(name.realpath, requested.fetchSpec) === ''

          case 'alias':
            // check that the alias target is valid
            return canOverrule(name, requested.subSpec)
          default:
            return false
        }
      } catch {
        return false
      }
    }
  }
}

module.exports = PeerDepsMeta


//* _______________________
//* jsdoc Types
/**
 * @typedef {import('./peerDepOverrides').Node} Node
 *
 * @typedef {import('./peerDepOverrides').PeerOverride} PeerOverride
 *
 * @typedef {import('./edge').Edge} Edge
 */
