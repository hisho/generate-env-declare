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
      console.log(`π Generated ${file}`)
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
      console.log(`${ENV_LOCAL}γ«"${key}"γ${ENV_LOCAL}γ«ε­ε¨γγΎγγγ\n${ENV_LOCAL}γ«"${key}"γθΏ½θ¨γγ¦γγ γγγ`)
    })
    write(JSON.stringify(envLocal, null, 2))
  } else if (diffByEnvLocal.length > 0) {
    diffByEnvLocal.forEach((key) => {
      console.log(`${ENV_EXAMPLE}γ«η‘γ"${key}"γ${ENV_LOCAL}γ«ε­ε¨γγΎγγ\n${ENV_LOCAL}γγ"${key}"γει€γγ¦γγ γγγ`)
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

  console.log('Building...')
  build()
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
  }
}
