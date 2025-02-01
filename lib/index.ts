import { spawnSync } from "node:child_process"
import { load } from 'js-yaml'
import { readFileSync } from 'fs'
import Table from 'cli-table3'
import colors from '@colors/colors/safe'
import { program } from 'commander'
import { Config } from './types'
import fs from 'node:fs'
import path from "node:path"

const lhciCliPath = require.resolve('@lhci/cli/src/cli.js')

const execCommand = (command: string, args: Array<string>) => {
  const execArgs = [lhciCliPath, command, ...args]

  const { status = -1 } = spawnSync(process.argv[0], execArgs, {
    stdio: 'inherit',
  })

  return status || 0
}

const clearOutputFile = (directory: string) => {
  fs.readdir(directory, (error, files) => {
    if (error) {
      console.error('ディレクトリが読み込めませんでした。')
      return
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file)
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('Failed to delete the file.')
        } else {
          console.error(`Delete the file: ${filePath}`)
        }
      })
    })
  })
}

const collectAsMobile = (args: Array<string>) => {
  execCommand('collect', [...args])
}

const collectAsDesktop = (args: Array<string>) => {
  execCommand('collect', [...args, '--preset=desktop'])
}

const uploadMobileOutput = (config: Config) => {
  clearOutputFile(config.mobileOutputDir)
  execCommand('upload', ['--target=filesystem', `--outputDir=${config.mobileOutputDir}`])
}

const uploadDesktopOutput = (config: Config) => {
  clearOutputFile(config.desktopOutputDir)
  execCommand('upload', ['--target=filesystem', `--outputDir=${config.desktopOutputDir}`])
}


const collectAndUpload = (config: Config) => {
  const args = [`--numberOfRuns=${config.numberOfRuns}`]

  config.urls.forEach((url: any) => {
    args.push(`--url=${url}`)
  })
  
  // Mobile
  collectAsMobile(args)
  uploadMobileOutput(config)
 
  // Desktop
  collectAsDesktop(args)
  uploadDesktopOutput(config)
}

const buildTable = (manifest: any) => {
  const table = new Table({
    head: [
      colors.bold(colors.white('url')),
      colors.bold(colors.white('performance score')),
      colors.bold(colors.white('fcp score')),
      colors.bold(colors.white('lcp score')),
      colors.bold(colors.white('cls score'))
    ]
  })

  const results = manifest.map((manifest: any) => {
    const data = JSON.parse(readFileSync(manifest.jsonPath, 'utf8'))
    const total = Math.round(manifest.summary.performance * 100)
    const fcp = Math.round(data.audits['first-contentful-paint'].score * 100)
    const lcp = Math.round(data.audits['largest-contentful-paint'].score * 100)
    const cls = Math.round(data.audits['cumulative-layout-shift'].score * 100)

    return [manifest.url, total, fcp, lcp, cls]
  }).sort((a: any, b: any) => b[1] - a[1])

  table.push(...results)
  
  return table
}

const analyze = () => {
  const mobileManifest = JSON.parse(readFileSync('./mobile/manifest.json', 'utf8'))
  const desktopManifest = JSON.parse(readFileSync('./desktop/manifest.json', 'utf8'))
  
  console.log('[Mobile]')
  console.log(buildTable(mobileManifest).toString())

  console.log('[Desktop]')
  console.log(buildTable(desktopManifest).toString())
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

