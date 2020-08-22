export default Edge

import Node from './node.js'

type EdgeType = (typeof Edge)['types'][number]

interface Options {
   type: EdgeType
   name: string
   spec: string
   accept: string
   from: Node
}

export declare class Edge {
  static types: readonly [
    'prod',
    'dev',
    'optional',
    'peer',
    'peerOverride',
    'workspace'
  ]
  constructor(options: Options): Edge
  satisfiedBy (node: Node): boolean
  get workspace (): boolean
  get prod (): boolean
  get dev (): boolean
  get optional (): boolean
  get peer (): boolean
  get override (): boolean
  get type (): EdgeType
  get name (): string
  get spec (): string
  get accept (): string
  get valid (): boolean
  get missing (): boolean
  get invalid (): boolean
  get peerLocal (): boolean
  get error (): 'MISSING' | 'INVALID' | 'PEER LOCAL' | 'DETACHED' | null
  reload (hard?: boolean): void
  detach (): void
  get from (): Node
  get to (): Node
}
