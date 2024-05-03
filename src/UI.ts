import '@logseq/libs'
import { UISlotIdentity } from '@logseq/libs/dist/LSPlugin.user'



export const encryptMenu = (slotId: string) => logseq.provideUI({
    key: 'crypto-menu',
    slot: slotId,
    template: `
    <p>Hello World</p>
    `
})