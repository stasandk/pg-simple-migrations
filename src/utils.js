import fs from 'fs'
import crypto from 'crypto'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const getFiles = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err)
      files = files.sort()
      resolve(files)
    })
  })
}

export const readFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

export const getChecksum = (str, algorithm, encoding) => {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}

export const rename = (oldName, newName) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldName, newName, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

export const now = () => {
  const date = dayjs().utc().format('YYYYMMDDHHmmssSSS')
  return date
}
