import '@logseq/libs'
import { ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as storage from './storage'
import { TransformableEvent } from '..'
import * as crypto from './crypto'
import { clearPage, simplifyBlockTree } from './utils'

const uiData = {
  headerSlot: '',
  passwordHidden: true,
  actionMenu: 'encrypt' as 'encrypt' | 'decrypt'
}

const icons = {
  lock: '',
  unlock: '',
  watch: '',
  hide: '',
  close: ''
}

const buttonStyle = 'style="font-size: 1.3em; margin-left: 4px"'

/* Helpers */
const inputField = (passwordHidden: boolean, password: string | null): string => {
  return `<input id=crypto-input-password placeholder=Password
            type=${passwordHidden ? 'password' : 'text'}
            ${(password === null) ? 'value="" ' : 'value="' + password + '" '}
            style="height: 1.5em; border-radius: 6px; padding-left: 10px;
            font-family: system-ui font-size: 1.1em; padding;" />`
}

function showPasswordMenu (action: 'encrypt' | 'decrypt', passwordHidden = true, password: string | null = null): void {
  /*
  password: render with last password as input value
  */
  uiData.actionMenu = action
  uiData.passwordHidden = passwordHidden

  logseq.provideUI({
    key: 'crypto-menu',
    slot: uiData.headerSlot,
    template: `
    <div style="display:flex; align-items: center;">
      <button title="${passwordHidden ? 'Show' : 'Hide'} password" style="font-size: 1.3em; margin-right: 4px"'
        data-on-click=changePasswordVisibility>
        ${passwordHidden ? icons.watch : icons.hide}
      </button>
      ${inputField(passwordHidden, password)}
      <button ${buttonStyle} data-on-click=${action}
        title=${action === 'encrypt' ? 'Encrypt content' : 'Decrypt content'}>
        ${action === 'encrypt' ? icons.lock : icons.unlock}
      </button>
      <button title="Close menu" ${buttonStyle} data-on-click=cancel>${icons.close}</button>
    </div>
    `
  })
}

/* End Helpers */

/* Callback Functions */
logseq.provideModel({
  changePasswordVisibility () {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    showPasswordMenu(uiData.actionMenu, !uiData.passwordHidden, input.value)
  },

  async cancel () {
    await showEncryptIcon(uiData.headerSlot)
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
    await showEncryptIcon(uiData.headerSlot)
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

    await showEncryptIcon(uiData.headerSlot)
    await logseq.UI.showMsg('Content decrypted', 'success')
  },

  showEncryptMenu (event: TransformableEvent) {
    showPasswordMenu('encrypt')
  },

  showDecryptMenu (event: TransformableEvent) {
    showPasswordMenu('decrypt')
  }

})
/* End Callback Functions */

/* Template render */
async function encryptIconTemplate (): Promise<string> {
  const page = await logseq.Editor.getCurrentPage() as PageEntity

  const encryptData = await storage.get(page)
  if (encryptData === undefined) {
    return `<button ${buttonStyle} title="Open cypto menu" data-on-click=showEncryptMenu>${icons.lock}</button>` // event is automatically passed as argument
  } else {
    return `<button ${buttonStyle} title="Open cypto menu" data-on-click=showDecryptMenu>${icons.unlock}</button>`
  }
}

export async function showEncryptIcon (slot: string): Promise<ILSPluginUser> {
  uiData.headerSlot = slot
  return logseq.provideUI({
    key: 'crypto-menu',
    slot,
    template: await encryptIconTemplate()
  })
}
