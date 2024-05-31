import '@logseq/libs'
import * as ui from './UI'
import { discoverEncryptedPages } from './storage'

async function loadCss (): Promise<void> {
  const cssFile = '../assets/index.css'
  const response = await fetch(cssFile)
  const style = await response.text()
  logseq.provideStyle(style)
}

async function main (): Promise<void> {
  logseq.App.onPageHeadActionsSlotted(e => ui.showCryptoIcon(e.slot))
  await loadCss()
}

// bootstrap
logseq.ready(main).catch(console.error)
