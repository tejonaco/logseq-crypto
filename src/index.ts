import '@logseq/libs'
import * as ui from './UI'

export const UNENCRYPTED_IV = '<unencrypted>'
export const RENDER_NAME = 'crypto-menu'

export function renderTemplate (iv: string = UNENCRYPTED_IV): string {
  return `{{renderer ${RENDER_NAME},${iv}}}`
}

async function main (): Promise<void> {
  // slash
  logseq.Editor.registerSlashCommand(
    'Crypto Menu', async () => {
      await logseq.Editor.insertAtEditingCursor(
        renderTemplate(UNENCRYPTED_IV)
      )
    }
  )

  // render
  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [template, iv] = payload.arguments
    if (template !== RENDER_NAME) {
      console.log('EXIT')
      return
    }

    return ui.updateTemplate(slot, iv)
  }
  )
}

// bootstrap
logseq.ready(main).catch(console.error)
