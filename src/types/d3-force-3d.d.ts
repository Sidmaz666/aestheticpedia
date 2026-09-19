// Minimal types for d3-force-3d (the package ships none); same API as d3-force plus z.
declare module 'd3-force-3d' {
  export interface Node3D {
    index?: number
    x?: number
    y?: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
  }
  interface Force<N> {
    (alpha: number): void
    initialize?: (nodes: N[]) => void
  }
  interface Simulation<N> {
    force(name: string, force: unknown): Simulation<N>
    stop(): Simulation<N>
    tick(n?: number): Simulation<N>
    nodes(): N[]
    alphaDecay(v: number): Simulation<N>
  }
  export function forceSimulation<N extends Node3D>(nodes: N[], numDimensions?: number): Simulation<N>
  export function forceLink<N, L>(links: L[]): { id(f: (n: N) => string): any; distance(d: number): any; strength(s: number): any }
  export function forceManyBody(): { strength(s: number): any; distanceMax(d: number): any; theta(t: number): any }
  export function forceCenter(x?: number, y?: number, z?: number): Force<unknown>
  export type { Force }
}
