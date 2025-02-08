export type Config = {
  numberOfRuns: number,
  urls: Array<string>,
  mobileOutputDir: string,
  desktopOutputDir: string,
}

export interface ManifestEntrySummary {
  performance: number; // all category scores on 0-1 scale
  accessibility: number;
  'best-practices': number;
  seo: number;
  pwa: number;
}

export interface ManifestEntry {
  url: string; // finalUrl of the run
  isRepresentativeRun: boolean; // whether it was the median run for the URL
  jsonPath: string;
  htmlPath: string;
  summary: ManifestEntrySummary;
}

