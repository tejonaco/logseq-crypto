import '@logseq/libs'
import * as ui from './UI'
import * as storage from './storage'

export const UNENCRYPTED_IV = '<unencrypted>'
export const RENDER_NAME = 'crypto-menu'

export function renderTemplate (iv: string = UNENCRYPTED_IV): string {
  return `{{renderer ${RENDER_NAME},${iv}}}`
}

async function main (): Promise<void> {
  // slash
  logseq.Editor.registerSlashCommand(
    'Crypto Menu', async () => {
      const page = await logseq.Editor.getCurrentPage()

      await storage.save(page?.name as string,
        {
          encrypted: false,
          hash: 'aa',
          iv: 'aa',
          data: 'ab'
        }
      )
    })
}

// bootstrap
logseq.ready(main).catch(console.error)
