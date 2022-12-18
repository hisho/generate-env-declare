import chokidar from 'chokidar'
import dotenv from 'dotenv'
import fs from 'fs'
import {difference, omit} from 'lodash'
import minimist from 'minimist'
import path from 'path'

const ENV_EXAMPLE = '.env.example'
const ENV_LOCAL = '.env.local'
const envList = [ENV_LOCAL, ENV_EXAMPLE]

const readFileContent = (path: string) => {
  try {
    return fs.readFileSync(path, 'utf-8')
  } catch (e) {
    console.log(`${path} is not found.`)
    process.exit(1)
  }
}

const write = (content: string) => {
  const file = 'env.d.ts'

  fs.writeFile(
    file,
    `declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv ${content}
    }
  }
}`,
    () => {
      console.log(`🎉 Generated ${file}`)
    }
  )
}

const parseDotenv = (data: string) => dotenv.parse(Buffer.from(data))

const build = () => {
  const envExample = parseDotenv(readFileContent(ENV_EXAMPLE))
  const envExampleKeys = Object.keys(envExample)
  const envLocal = parseDotenv(readFileContent(ENV_LOCAL))
  const envLocalKeys = Object.keys(envLocal)
  const diffByEnvExample = difference(envExampleKeys, envLocalKeys)
  const diffByEnvLocal = difference(envLocalKeys, envExampleKeys)

  if (diffByEnvExample.length > 0) {
    diffByEnvExample.forEach((key) => {
      console.log(`${ENV_LOCAL}に"${key}"が${ENV_LOCAL}に存在しません。\n${ENV_LOCAL}に"${key}"を追記してください。`)
    })
    write(JSON.stringify(envLocal, null, 2))
  } else if (diffByEnvLocal.length > 0) {
    diffByEnvLocal.forEach((key) => {
      console.log(`${ENV_EXAMPLE}に無い"${key}"が${ENV_LOCAL}に存在します。\n${ENV_LOCAL}から"${key}"を削除してください。`)
    })
    write(JSON.stringify(omit(envLocal, diffByEnvLocal), null, 2))
  } else {
    write(JSON.stringify(envLocal, null, 2))
  }
}

type ArgvType = Readonly<Partial<{
  watch: string
}>>

export const main = (args: string[]) => {
  const argv = minimist<ArgvType>(args, {
    alias: { w: 'watch' },
    string: ['watch'],
  })

  if (argv.watch !== undefined) {
    chokidar
      .watch(
        envList.map((name) => path.join(process.cwd(), name)),
        {
          ignoreInitial: true,
        }
      )
      .on('all', (_, path) => {
        console.log('Watching...', path)
        build()
      })
  } else {
    console.log('Building...')
    build()
  }
}
