import * as crypto from 'crypto-browserify'
import { AESContent } from '..'

const ALGORITHM = 'aes-256-ctr'
const HEADER: string = `<------[${ALGORITHM}]------>\n`

export const encrypt = (text: string, password: string): AESContent => {
  const iv = crypto.randomBytes(16)
  const md5 = crypto.createHash('md5')
  md5.update(password)
  const textWithHeader = HEADER + text

  const cipher = crypto.createCipheriv(ALGORITHM, md5.digest('hex'), iv)

  const encrypted = Buffer.concat([cipher.update(textWithHeader), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

export const decrypt = (hash: AESContent, password: string): string | undefined => {
  const md5 = crypto.createHash('md5')
  md5.update(password)
  const decipher = crypto.createDecipheriv(ALGORITHM, md5.digest('hex'), Buffer.from(hash.iv, 'hex'))

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

  const decryptedText = decrpyted.toString()
  if (decryptedText.startsWith(HEADER)) {
    return decryptedText.slice(HEADER.length)
  }
}
