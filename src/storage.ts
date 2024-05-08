import '@logseq/libs'
import { CryptoData } from '..'

const s = logseq.Assets.makeSandboxStorage()

export async function get (pageId: number): Promise<CryptoData | undefined> {
  try {
    const data = await s.getItem(pageId.toString() + '.json').then()
    if (data !== undefined) {
      return JSON.parse(data)
    }
  } catch {
    return undefined
  }
}

export async function save (pageId: number, data: CryptoData): Promise<void> {
  await s.setItem(pageId.toString() + '.json', JSON.stringify(data))
}
