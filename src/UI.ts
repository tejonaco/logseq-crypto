import '@logseq/libs'
import { BlockEntity, ILSPluginUser, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { RENDER_NAME, renderTemplate, UNENCRYPTED_IV } from './index'
import * as crypto from './crypto'
import { appendBlocksFromTree, simplifyBlockTree } from './utils'

export const template = {
  text: '',
  slotId: '',
  iv: '',
  hidePassword: true
}

// CALLBACKS
logseq.provideModel({
  async encrypt () {
    // get input
    const input = parent.document.getElementById('encrypt-password') as HTMLInputElement
    // get page blocks
    const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree()
    // extract renderer
    const pageBlocksWithoutMenu = pageBlocks.filter((block) => block.content.match('{{renderer ' + RENDER_NAME + '.+}}') == null)
    // blocks tree to string and encrypt
    const textPageBlocks = JSON.stringify(simplifyBlockTree(pageBlocksWithoutMenu))
    const { iv, content: encryptedPageContent } = crypto.encrypt(textPageBlocks, input.value)
    // insert menu and the encrypted page data
    const currentPage = await logseq.Editor.getCurrentPage() as PageEntity
    await logseq.Editor.appendBlockInPage(currentPage.uuid, renderTemplate(iv))
    await logseq.Editor.appendBlockInPage(currentPage.uuid, encryptedPageContent)
    // remove previous unencryted blocks
    pageBlocks.map(async (block) => {
      await logseq.Editor.removeBlock(block.uuid)
    })
    input.value = ''
  },
  async decrypt () {
    // get input
    const input = parent.document.getElementById('encrypt-password') as HTMLInputElement
    const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree()
    const pageBlocksWithoutMenu = pageBlocks.filter((block) => block.content.match('{{renderer ' + RENDER_NAME + '.+}}') == null)
    const currentPage = await logseq.Editor.getCurrentPage() as PageEntity

    const encryptedBlock: BlockEntity = pageBlocksWithoutMenu[0]
    const decrpytedContent = crypto.decrypt({ iv: template.iv, content: encryptedBlock.content }, input.value)
    if (decrpytedContent !== undefined) {
      await logseq.Editor.appendBlockInPage(currentPage.uuid, renderTemplate())
      await appendBlocksFromTree(JSON.parse(decrpytedContent), currentPage)
      // remove previous unencryted blocks
      pageBlocks.map(async (block) => {
        await logseq.Editor.removeBlock(block.uuid)
      })
    }

    input.value = ''
  },
  changeVisibility () {
    template.hidePassword = !template.hidePassword
    updateTemplate(null, null)
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

const decryptButton = (): string => {
  return `
    <button
        id=decrypt-button
        data-on-click="decrypt"
    >
        DECRYPT
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

export function updateTemplate (slotId: string | null, iv: string | null): void {
  const input = parent.document.getElementById('encrypt-password') as HTMLInputElement
  if (slotId != null) {
    template.slotId = slotId
  }
  if (iv != null) {
    template.iv = iv
  }

  template.text = `
        ${inputField(template.hidePassword, input?.value)}
        ${visibilityButton()}
        ${(iv === UNENCRYPTED_IV || iv === null) ? encryptButton() : decryptButton()}
        `

  encryptMenu() // reload
}

// MENU
const encryptMenu = (): ILSPluginUser => logseq.provideUI({
  key: 'crypto-menu',
  slot: template.slotId,
  template: template.text
})
