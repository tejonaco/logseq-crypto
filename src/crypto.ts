import * as crypto from 'crypto-browserify'
import { AESContent } from '..'

const ALGORITHM = 'aes-256-ctr'
const HASH_OBFUSCATOR = '//*// Random noise to prevent dictionary attacks //*//'

export const secureHash = (password: string): string => {
  /* Hash to store page password */
  const hash = crypto.createHash('sha256')
  hash.update(password + HASH_OBFUSCATOR)
  return hash.digest('hex')
}

export const encrypt = (text: string, password: string): AESContent => {
  const iv = crypto.randomBytes(16)
  // AES password is made from md5 hash
  const md5 = crypto.createHash('md5')
  md5.update(password)

  const cipher = crypto.createCipheriv(ALGORITHM, md5.digest('hex'), iv)

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

export const decrypt = (encryptedData: AESContent, password: string): string => {
  const md5 = crypto.createHash('md5')
  md5.update(password)
  const decipher = crypto.createDecipheriv(ALGORITHM, md5.digest('hex'), Buffer.from(encryptedData.iv, 'hex'))

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(encryptedData.content, 'hex')), decipher.final()])

  return decrpyted.toString()
}
