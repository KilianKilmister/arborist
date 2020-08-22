import _Node from './node.js'
import PeerDepsMeta from './peerOverride.js'
import Edge from './edge.js'

export interface Node extends _Node {
  edgesOut: Map<string, Edge>
  parent: Node
  package: Package
  peerDependenciesMeta: PeerDepsMeta
}

export type DepHash {{ [dep: string]: string }}

export type Package {
  dependencies?: DepHash
  devDependencies?: DepHash
  peerDependenciesMeta?: { [dep: string]: { [peer: string]: string | DepHash } }
}

export interface PeerOverride {
  origSpec?: string
  overrideSpec: string
  overridePackage: string
}
