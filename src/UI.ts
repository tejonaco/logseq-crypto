import '@logseq/libs'
import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user'

// CALLBACKS
logseq.provideModel({
  encrypt () {
    // grab input
    const input = parent.document.getElementById('encrypt-password') as HTMLInputElement
    // trigger encrypt
    console.log(input.value)
    // reset input field
    input.value = ''
  }
})

// ELEMENTS
const inputField = (): string => {
  return `
    <input
        id='encrypt-password'
        type="text"
        placeholder="password"
    />
    `
}

const encryptButton = (): string => {
  return `
    <button
        id=encrypt-button
        data-on-click="encrypt"
    >
        ENCRYPT
    </button>
    `
}

// MENU
export const encryptMenu = (slotId: string): ILSPluginUser => logseq.provideUI({
  key: 'crypto-menu',
  slot: slotId,
  template: `
    ${inputField()}
    ${encryptButton()}
    `
})
