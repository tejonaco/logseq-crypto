import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

export interface AESContent {
  iv: string
  content: string
}

export interface CryptoData {
  hash: string
  iv: string
  data: string
}

export interface CryptoDataDict {
  [Key: string]: CryptoData
}

export interface TransformableEvent {
  type: string
  value: string
  id: string
  className: string
  dataset: Object
}
