import { access, constants, readdir } from 'node:fs'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

const blogFolder = 'src/app/mdx/[slug]/'

export async function getMarkdowns () {
  try {
    const files = await promisify(readdir)(blogFolder)
    console.log(files)
    return files.filter((item:string) => /.md$/g.test(item))
  } catch (e) {
    //
  }
}

export async function getMarkdownsExist (file:string) {
  try {
    const path = resolve(blogFolder, `./${file}`)

    const isExist:unknown = await promisify(access)(path, constants.F_OK)

    if (isExist) {
      return false
    } else {
      return true
    }
  } catch (e) {
    // console.error(e)
  }
}
