export type BuildStage = 'banner' | 'renderChunk';

/** @internal */
export function isBuildStage(v: any): v is BuildStage {
  return v === 'banner' || v === 'renderChunk';
}
