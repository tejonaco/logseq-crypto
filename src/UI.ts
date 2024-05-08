import '@logseq/libs'
import { ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as storage from './storage'
import { TransformableEvent } from '..'
import * as crypto from './crypto'
import { simplifyBlockTree } from './utils'

let headerSlot = ''

logseq.provideModel({
  async cancel () {
    await showEncryptIcon(headerSlot)
  },
  async encrypt (e) {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    const page = await logseq.Editor.getCurrentPage()
    if (page === null) return

    const hash = crypto.secureHash(input.value)
    const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree()
    const {iv, content:encryptedContent} = crypto.encrypt(JSON.stringify(simplifyBlockTree(pageBlocks)), input.value)

    await storage.save(page.id,
      {
        encrypted: true,
        hash,
        iv,
        data: encryptedContent
      }
    )
  },

  showEncryptMenu (event: TransformableEvent) {
    logseq.provideUI({
      key: 'crypto-menu',
      slot: headerSlot,
      template: `
      <input id=crypto-input-password type=text placeholder=Password />
      <button data-on-click=encrypt>🔒</button>
      <button data-on-click=cancel>❌</button>
      `
    })
  }
})

async function encryptIconTemplate (): Promise<string> {
  const page = await logseq.Editor.getCurrentPage()
  if (page === undefined) {
    return ''
  }
  const encryptData = await storage.get(page?.id)
  if (encryptData === undefined || !encryptData.encrypted) {
    return '<button data-on-click=showEncryptMenu>🔒</button>' // event is automatically passed as argument
  } else {
    return '<button>🔓</button>'
  }
}

export async function showEncryptIcon (slot: string): Promise<ILSPluginUser> {
  headerSlot = slot
  return logseq.provideUI({
    key: 'crypto-menu',
    slot,
    template: await encryptIconTemplate()
  })
}
