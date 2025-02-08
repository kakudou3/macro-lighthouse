import { spawnSync } from "node:child_process"
import fs from 'node:fs'
import path from "node:path"

export const execCommand = (command: string, args: Array<string>) => {
  const execArgs = [command, ...args]

  const { status = -1 } = spawnSync(process.argv[0], execArgs, {
    stdio: 'inherit',
  })

  return status || 0
}

export const deleteFiles = (directory: string) => {
  fs.readdir(directory, (error, files) => {
    if (error) {
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

