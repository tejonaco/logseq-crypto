import '@logseq/libs'
import { CryptoData } from '..'

const s = logseq.Assets.makeSandboxStorage()

export async function get (page: string): Promise<CryptoData | undefined> {
  try {
    const data = await s.getItem(page + '.json').then()
    if (data !== undefined) {
      return JSON.parse(data)
    }
  } catch {
    return undefined
  }
}

export async function save (page: string, data: CryptoData): Promise<void> {
  await s.setItem(page + '.json', JSON.stringify(data))
}
