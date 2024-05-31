import '@logseq/libs'
import { CryptoData } from '..'
import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import pkg from '../package.json'

const s = logseq.Assets.makeSandboxStorage()

export async function isPageEncrypted (page: PageEntity): Promise<boolean> {
  return await s.hasItem(page.name + '.json')
}

export function filePath (page: PageEntity): string {
  return `./asssets/storages/${pkg.name}/${page.name}.json`
}

export async function get (page: PageEntity): Promise<CryptoData | null> {
  const data = await s.getItem(page.name + '.json')

  if (data !== undefined) {
    return JSON.parse(data)
  }
  return null
}

export async function save (page: PageEntity, data: CryptoData): Promise<void> {
  await s.setItem(page.name + '.json', JSON.stringify(data))
}

export async function remove (page: PageEntity): Promise<void> {
  await s.removeItem(page.name + '.json')
}
