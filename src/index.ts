import '@logseq/libs'
import * as ui from './UI'
import * as storage from './storage'

async function main (): Promise<void> {
  // slash

  logseq.App.onPageHeadActionsSlotted(e => ui.encryptIcon(e.slot) as unknown)
}

// bootstrap
logseq.ready(main).catch(console.error)
