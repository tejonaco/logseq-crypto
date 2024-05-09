import '@logseq/libs'
import { ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as storage from './storage'
import { TransformableEvent } from '..'
import * as crypto from './crypto'
import { clearPage, simplifyBlockTree, waitForElm } from './utils'
import * as icons from './icons'

const uiData = {
  headerSlot: '',
  passwordHidden: true,
  actionMenu: 'encrypt' as 'encrypt' | 'decrypt'
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

const encryptButton = `
        <button ${buttonStyle} id="crypto-button-encrypt"
          title='Hold one second to encrypt page'>
          ${icons.lock}
        </button>`

const decryptButton = `
        <button ${buttonStyle} id="crypto-button-decrypt"
          data-on-click=decrypt
          title='Push to decrypt page'>
          ${icons.unlock}
        </button>`

async function showPasswordMenu (action: 'encrypt' | 'decrypt', passwordHidden = true, password: string | null = null): Promise<void> {
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
      ${(action == 'encrypt') ? encryptButton : decryptButton}
      <button title="Close menu" ${buttonStyle} data-on-click=cancel>${icons.close}</button>
    </div>
    `
  })
  const input = await waitForElm('#crypto-input-password') as HTMLInputElement
  input.focus()
  await encryptButtonListener()
}
//
/* End Helpers */

/* Callback Functions */
logseq.provideModel({
  async changePasswordVisibility () {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    await showPasswordMenu(uiData.actionMenu, !uiData.passwordHidden, input.value)
  },

  async cancel () {
    await showEncryptIcon(uiData.headerSlot)
  },

  async decrypt () {
    const input = parent.document.getElementById('crypto-input-password') as HTMLInputElement
    const page = await logseq.Editor.getCurrentPage() as PageEntity

    const saved = await storage.get(page)
    if (saved === undefined) return

    const hash = crypto.secureHash(input.value)
    if (saved.hash !== hash) {
      await logseq.UI.showMsg('Password is incorrect', 'error')
      return
    }
    const decrpytedData = crypto.decrypt({ iv: saved.iv, content: saved.data }, input.value)

    // const newBlock = logseq.Editor.appendBlockInPage(page, '')
    await logseq.Editor.insertBatchBlock(page.uuid, JSON.parse(decrpytedData))
    await storage.remove(page)

    await showEncryptIcon(uiData.headerSlot)
    await logseq.UI.showMsg('Content decrypted', 'success')
  },

  async showEncryptMenu (event: TransformableEvent) {
    await showPasswordMenu('encrypt')
  },

  async showDecryptMenu (event: TransformableEvent) {
    await showPasswordMenu('decrypt')
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

async function encryptPage (): Promise<void> {
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
}

async function encryptButtonListener (): Promise<void> {
  // trigger encryption only when keeping button pressed for a second
  const button = await waitForElm('#crypto-button-encrypt')
  let pressTimeout: number

  button.addEventListener('mousedown', e => {
    e.stopImmediatePropagation() // prevent repetition if event is registered multiple times
    pressTimeout = setTimeout(async () => {
      await encryptPage()
    }, 1000)
  })

  button.addEventListener('mouseup', e => {
    e.stopImmediatePropagation()
    clearTimeout(pressTimeout)
  })
}
