import { simplifyBlockTree, waitForElm } from './utils'
import * as crypto from './crypto'
import * as storage from './storage'
import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import { render } from './UI'

async function clearPage (page: PageEntity): Promise<void> {
  const blocks = await logseq.Editor.getPageBlocksTree(page.uuid)

  for (const block of blocks) {
    await logseq.Editor.removeBlock(block.uuid)
  }
}

export async function encryptPage (): Promise<void> {
  const passwordInput = await waitForElm('#lc-password') as HTMLInputElement

  const page = await logseq.Editor.getCurrentPage() as PageEntity
  if (page === null) return

  const hash = crypto.secureHash(passwordInput.value)
  const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree()
  const { iv, content: encryptedContent } = crypto.encrypt(JSON.stringify(simplifyBlockTree(pageBlocks)), passwordInput.value)

  await storage.save(page,
    {
      hash,
      iv,
      data: encryptedContent
    }
  )
  await clearPage(page)
  await logseq.UI.showMsg('Content encrypted and saved on ' + storage.filePath(page), 'success', { timeout: 2000 })
  passwordInput.value = ''
  render.decryptButton()
}

export async function decrypt (): Promise<void> {
  const passwordInput = await waitForElm('#lc-password') as HTMLInputElement
  const page = await logseq.Editor.getCurrentPage() as PageEntity

  const saved = await storage.get(page)
  if (saved == null) {
    await logseq.UI.showMsg('There was a problem retrieving encrypted data', 'error')
    return
  }

  const hash = crypto.secureHash(passwordInput.value)
  if (saved.hash !== hash) {
    await logseq.UI.showMsg('Password is incorrect', 'error', { timeout: 2000 })
    return
  }
  const decrpytedData = crypto.decrypt({ iv: saved.iv, content: saved.data }, passwordInput.value)

  const tempBlock = await logseq.Editor.appendBlockInPage(page.uuid, 'Decrypting page') // workaround for https://github.com/logseq/logseq/issues/10871

  if (tempBlock == null) {
    // This will probably never occur
    console.error('Something went wrong inserting block in page')
    return
  }

  await logseq.Editor.insertBatchBlock(tempBlock.uuid, JSON.parse(decrpytedData), {
    keepUUID: true,
    before: false,
    sibling: true
  })

  await logseq.Editor.removeBlock(tempBlock.uuid)
  await storage.remove(page)
  await logseq.UI.showMsg('Content decrypted', 'success')
  passwordInput.value = ''
  render.encryptButton()
}
