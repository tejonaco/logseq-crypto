import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

export interface AESContent {
  iv: string
  content: string
}

export interface SimpleBlockTree {
  children?: SimpleBlockTree[]
  content: string
}

export interface CryptoData {
  encrypted: boolean
  hash: string
  iv: string
  data: string
}

export interface CryptoDataDict {
  [Key: string]: CryptoData
}
