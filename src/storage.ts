import '@logseq/libs'
import { CryptoData } from '..'

const s = logseq.Assets.makeSandboxStorage()

// export async function loadData (): Promise<void> {
//   const dataString = await s.getItem(DATA_FILE).catch(e => console.log(e))
//   if (dataString !== undefined) {
//     dataDict = JSON.parse(dataString)
//     console.log('load')
//     console.log(dataDict)
//   } else {
//     dataDict = {}
//   }
// }

export async function get (page: string): Promise<CryptoData | undefined> {
  const data = await s.getItem(page + '.json').catch()
  if (data !== undefined) {
    return JSON.parse(data)
  }
}

export async function save (page: string, data: CryptoData): Promise<void> {
  await s.setItem(page + '.json', JSON.stringify(data))
}
