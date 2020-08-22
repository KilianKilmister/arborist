import npa  from 'npm-package-arg'
import fromPath  from './from-path.js'
import semver from 'semver'
import {relative}  from 'path'

import type Node from './node.js'

export default class PeerDepsMeta extends Map<string, Map<string, PeerOverride>> {
  constructor (node: Node) {

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

    // iterate over parent peerDepMeta
    for (const [dep, peers] of parentPeerDepsMeta) {
      // try to get the corresponding entry in your own package.peerDependenciesMeta
      const ownOverrides = peerDepsMeta[dep] || {}
      // create a store
      const overrideHash = new Map()
      // iterate over the peer overrides in the parent peerDepMeta
      for (const [peer, override] of peers) {
        switch (true) {
          // 1. if you have an override for that peer: use that
          case peer in ownOverrides:
            overrideHash.set(peer, formOverride(peer, ownOverrides[peer]))
            break
          // 2. if you have own deps that satisfies the original request: discard override
          case canOverrule(peer, override.origSpec, node):
            break
          // 3. if not 1. or 2.: inherit the override
          default:
            overrideHash.set(peer, override)
        }
      }

      // no need to save an empty hash
      if (overrideHash.size) this.set(dep, overrideHash)
    }

    //*______
    //* helpers
    function formOverride (origPackage: string, spec: string | { [dep: string]: string }) {
      const [overridePackage, overrideSpec] =
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
     */
    function canOverrule (name: string, spec?: string): boolean {
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
