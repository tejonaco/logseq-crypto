import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import * as icons from './icons'
import * as storage from './storage'
import { TransformableEvent } from '..'
import { holdButtonListener, waitForElm } from './utils'
import { encryptPage, decrypt } from './actions'

const doc = parent.document
let SLOT = '' // header slot

// CALLBACKS
logseq.provideModel({
  showEncryptMenu (event: TransformableEvent) {
    showMenu('encrypt')
  },

  showDecryptMenu (event: TransformableEvent) {
    showMenu('decrypt')
  },

  changeVisibility (event: TransformableEvent) {
    const hidden = event.value === 'true'

    render.visibilityButton(!hidden)
    render.passwordField(!hidden)
  },

  cancel () {
    showCryptoIcon(SLOT)
  }
})
// END_CALLBACKS

// RENDERS
export const render = {
  structure (slot: string): void {
    logseq.provideUI({
      key: 'crypto-menu',
      slot,
      template: `
      <div style="display:flex; align-items: center;">
        <div id=lc-visibility-placeholder></div>
        <div id=lc-password-placeholder></div>
        <div id=lc-button-placeholder></div>
        <button id=lc-button-close title="Close menu" data-on-click=cancel >${icons.close}</button>
      </div>
      `
    })
  },

  visibilityButton (passwordHidden = true): void {
    logseq.provideUI({
      key: 'visibility-icon', // key avoid stack on re-renders
      slot: 'lc-visibility-placeholder',
      template: `
      <button id=lc-visibility data-on-click=changeVisibility value=${passwordHidden.toString()}>${passwordHidden ? icons.watch : icons.hide}</button>
      `
    })
  },

  passwordField (passwordHidden = true): void {
    const type = passwordHidden ? 'password' : 'text'

    const field = doc.querySelector('#lc-password') as HTMLInputElement
    if (field == null) {
      // if element not exist add it to dom
      logseq.provideUI({
        key: 'password-field',
        slot: 'lc-password-placeholder',
        template: `
        <input id=lc-password
              type=${type}
              placeholder=PASSWORD
              />
        `
      })

      // then wait for it to appear and focus
      waitForElm('#lc-password').then((elm) => {
        const newField = elm as HTMLInputElement
        newField.focus()
      }).catch(console.error)
    } else {
      // only edit properties
      field.type = type
      field.selectionStart = field.value.length
      field.focus()
    }
  },

  encryptButton (): void {
    logseq.provideUI({
      key: 'action-button',
      slot: 'lc-button-placeholder',
      template: `
      <button id="lc-button-encrypt"
        title='Hold to encrypt page'>
          ${icons.lock}
      </button>
      `
    })
    holdButtonListener('#lc-button-encrypt', encryptPage).catch(console.error)
  },

  decryptButton (): void {
    logseq.provideUI({
      key: 'action-button',
      slot: 'lc-button-placeholder',
      template: `
      <button id="lc-button-decrypt"
        title='Push to decrypt page'
        >
          ${icons.unlock}
      </button>
      `
    })

    waitForElm('#lc-button-decrypt').then(button => {
      const handleDecrypt = (): void => {
        decrypt().catch(console.error)
      }
      button.addEventListener('click', handleDecrypt)
    }).catch(console.error)
  }
}
// END_RENDERS

function showMenu (action: 'encrypt' | 'decrypt'): void {
  // put base structure on slot
  render.structure(SLOT)
  render.visibilityButton()
  render.passwordField()

  if (action === 'encrypt') {
    render.encryptButton()
  } else {
    render.decryptButton()

    waitForElm('#lc-password').then(passwordField => {
      (passwordField as HTMLInputElement).addEventListener('keyup', e => {
        if (e.key === 'Enter') {
          decrypt().catch(console.error)
        }
      })
    }).catch(console.error)
  }
}

async function encryptIconTemplate (slot: string): Promise<string> {
  const page = await logseq.Editor.getCurrentPage() as PageEntity
  const encryptData = await storage.isPageEncrypted(page)
  if (encryptData) {
    return `<button title="Open cypto menu" data-on-click=showDecryptMenu>${icons.unlock}</button>`
  } else {
    return `<button title="Open cypto menu" data-on-click=showEncryptMenu>${icons.lock}</button>`
  }
}

export function showCryptoIcon (slot: string): void {
  SLOT = slot
  encryptIconTemplate(slot).then(cryptoIcon => {
    logseq.provideUI({
      key: 'crypto-menu',
      slot,
      template: cryptoIcon
    })
  }).catch(console.error)
}
