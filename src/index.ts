import '@logseq/libs'
import * as ui from './UI'

const UNENCRYPTED_IV = '<unencrypted>'
const RENDER_NAME = 'crypto-menu'

function renderTemplate (iv: string = ''): string {
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
      return
    }

    switch (iv) {
      case UNENCRYPTED_IV:
        return ui.encryptMenu(slot)
    }
  }
  )
}

// bootstrap
logseq.ready(main).catch(console.error)
