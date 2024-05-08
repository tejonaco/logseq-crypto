import '@logseq/libs'
import { IBatchBlock, ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as storage from './storage'
import { TransformableEvent } from '..'
import * as crypto from './crypto'
import { clearPage, simplifyBlockTree } from './utils'

let headerSlot = ''

logseq.provideModel({
  async cancel () {
    await showEncryptIcon(headerSlot)
  },
  async encrypt () {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    const page = await logseq.Editor.getCurrentPage() as PageEntity
    if (page === null) return

    const hash = crypto.secureHash(input.value)
    const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree()
    const { iv, content: encryptedContent } = crypto.encrypt(JSON.stringify(simplifyBlockTree(pageBlocks)), input.value)

    await storage.save(page,
      {
        hash,
        iv,
        data: encryptedContent
      }
    )
    await clearPage(page)
    await showEncryptIcon(headerSlot)
    await logseq.UI.showMsg('Content encrypted and saved on ' + storage.filePath(page), 'success', { timeout: 3000 })
  },
  async decrypt () {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    const page = await logseq.Editor.getCurrentPage() as PageEntity

    const saved = await storage.get(page)
    if (saved === undefined) return

    const hash = crypto.secureHash(input.value)
    if (saved.hash !== hash) {
      await logseq.UI.showMsg('Passwords don\'t match', 'error')
      return
    }
    const decrpytedData = crypto.decrypt({ iv: saved.iv, content: saved.data }, input.value)

    // const newBlock = logseq.Editor.appendBlockInPage(page, '')
    await logseq.Editor.insertBatchBlock(page.uuid, JSON.parse(decrpytedData))
    await storage.remove(page)

    await showEncryptIcon(headerSlot)
    await logseq.UI.showMsg('Content decrypted', 'success')
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
  },
  showDecryptMenu (event: TransformableEvent) {
    logseq.provideUI({
      key: 'crypto-menu',
      slot: headerSlot,
      template: `
      <input id=crypto-input-password type=text placeholder=Password />
      <button data-on-click=decrypt>🔓</button>
      <button data-on-click=cancel>❌</button>
      `
    })
  }

})

async function encryptIconTemplate (): Promise<string> {
  const page = await logseq.Editor.getCurrentPage() as PageEntity

  const encryptData = await storage.get(page)
  if (encryptData === undefined) {
    return '<button data-on-click=showEncryptMenu>🔒</button>' // event is automatically passed as argument
  } else {
    return '<button data-on-click=showDecryptMenu>🔓</button>'
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
