import '@logseq/libs'
import * as ui from './UI'

function main (): void {
  logseq.App.onPageHeadActionsSlotted(e => ui.showEncryptIcon(e.slot) as unknown)
}

// bootstrap
logseq.ready(main).catch(console.error)
