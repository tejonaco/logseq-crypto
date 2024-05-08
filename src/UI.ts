import '@logseq/libs'
import { ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as storage from './storage'

async function encryptIconTemplate (): Promise<string | undefined> {
  const page = await logseq.Editor.getCurrentPage()
  if (page === undefined) {
    return
  }
  const encryptData = await storage.get(page?.name as string)
  if (encryptData === undefined) {
    return '<button>🔒</button>'
  } else {
    return '<button>🔓</button>'
  }
}

export async function encryptIcon (slot: string): Promise<ILSPluginUser> {
  return logseq.provideUI({
    key: 'crypto-icon',
    slot,
    template: await encryptIconTemplate()
  })
}
