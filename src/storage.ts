import '@logseq/libs'
import { CryptoData } from '..'
import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import pkg from '../package.json'

const s = logseq.Assets.makeSandboxStorage()

export function filePath (page: PageEntity): string {
  return `./asssets/storages/${pkg.name}/${page.name}.json`
}

export async function get (page: PageEntity): Promise<CryptoData | undefined> {
  try {
    const data = await s.getItem(page.name + '.json').then()
    if (data !== undefined) {
      return JSON.parse(data)
    }
  } catch {
    return undefined
  }
}

export async function save (page: PageEntity, data: CryptoData): Promise<void> {
  await s.setItem(page.name + '.json', JSON.stringify(data))
}

export async function remove (page: PageEntity): Promise<void> {
  await s.removeItem(page.name + '.json')
}
