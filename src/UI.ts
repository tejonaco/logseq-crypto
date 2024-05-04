import '@logseq/libs'
import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user'

export const template = {
  text: '',
  slotId: '',
  hidePassword: true
}

// CALLBACKS
logseq.provideModel({
  encrypt () {
    // grab input
    const input = parent.document.getElementById('encrypt-password') as HTMLInputElement
    // trigger encrypt
    console.log(input.value)
    // reset input field
    input.value = ''
  },
  changeVisibility () {
    template.hidePassword = !template.hidePassword
    updateTemplate()
  }
})

// ELEMENTS
const inputField = (hidePassword = true, value: string): string => {
  return `
    <input
        id='encrypt-password'
        type=${hidePassword ? 'password' : 'text'}
        placeholder="password"
        ${value > '' ? 'value=' + value : ''}
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

const visibilityButton = (): string => {
  return `
    <button
        id=password-visibility-button
        data-on-click="changeVisibility"
    >
        VISIBILITY
    </button>
    `
}

export function updateTemplate (): void {
  const input = parent.document.getElementById('encrypt-password') as HTMLInputElement

  template.text = `
        ${inputField(template.hidePassword, input?.value)}
        ${visibilityButton()}
        ${encryptButton()}
        `

  encryptMenu() // reload
}

// MENU
const encryptMenu = (): ILSPluginUser => logseq.provideUI({
  key: 'crypto-menu',
  slot: template.slotId,
  template: template.text
})