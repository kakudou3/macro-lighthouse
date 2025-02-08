import { load } from 'js-yaml'
import { readFileSync } from 'fs'
import Table from 'cli-table3'
import colors from '@colors/colors/safe'
import { program } from 'commander'
import { Config, ManifestEntry } from './types'
import { deleteFiles, execCommand } from "./utils"

const lhciCliPath = require.resolve('@lhci/cli/src/cli.js')

const collectAndUpload = (config: Config) => {
  const args = [`--numberOfRuns=${config.numberOfRuns}`]

  config.urls.forEach((url: string) => {
    args.push(`--url=${url}`)
  })
  
  // Mobile
  execCommand(`${lhciCliPath} collect`, [...args])
  deleteFiles(config.mobileOutputDir)
  execCommand(`${lhciCliPath} upload`, ['--target=filesystem', `--outputDir=${config.mobileOutputDir}`])
 
  // Desktop
  execCommand(`${lhciCliPath} collect`, [...args, '--preset=desktop'])
  deleteFiles(config.desktopOutputDir)
  execCommand(`${lhciCliPath} upload`, ['--target=filesystem', `--outputDir=${config.desktopOutputDir}`])

}

const analyze = () => {
  const mobileManifest = JSON.parse(readFileSync('./mobile/manifest.json', 'utf8')) as Array<ManifestEntry>
  const desktopManifest = JSON.parse(readFileSync('./desktop/manifest.json', 'utf8')) as Array<ManifestEntry>
  
  console.log('[Mobile]')
  console.log(buildTable(mobileManifest).toString())

  console.log('[Desktop]')
  console.log(buildTable(desktopManifest).toString())
}


const buildTable = (manifest: Array<ManifestEntry>) => {
  const table = new Table({
    head: [
      colors.bold(colors.white('url')),
      colors.bold(colors.white('performance score')),
      colors.bold(colors.white('fcp score')),
      colors.bold(colors.white('lcp score')),
      colors.bold(colors.white('cls score'))
    ]
  })

  const results = manifest.map((manifest: ManifestEntry): Array<string | number> => {
    const data = JSON.parse(readFileSync(manifest.jsonPath, 'utf8'))
    const total = Math.round(manifest.summary.performance * 100)
    const fcp = Math.round(data.audits['first-contentful-paint'].score * 100)
    const lcp = Math.round(data.audits['largest-contentful-paint'].score * 100)
    const cls = Math.round(data.audits['cumulative-layout-shift'].score * 100)

    return [manifest.url, total, fcp, lcp, cls]
  }).sort((a, b) => (b[1] as number) - (a[1] as number))

  table.push(...results)
  
  return table
}

program
  .name('macro-lighthouse')
  .description('CLI to lighthouse')
  .version('0.1.0')

program
  .command('collect')
  .action(() => {
    const config = load(readFileSync('config.yaml', 'utf8')) as Config

    if (!config) {
      return
    }

    collectAndUpload(config)
  })

program
  .command('analyze')
  .action(() => {
    analyze() 
  })

program
  .command('collect-and-analyze')
  .action(() => {
    const config = load(readFileSync('config.yaml', 'utf8')) as Config

    if (!config) {
      return
    }

    collectAndUpload(config)
    analyze()
  })

program.parse()

