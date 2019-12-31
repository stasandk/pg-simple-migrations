'use strict'

const fs = require('fs')
const crypto = require('crypto')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

exports.getFiles = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err)
      files = files.sort()
      resolve(files)
    })
  })
}

exports.readFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

exports.getChecksum = (str, algorithm, encoding) => {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}

exports.rename = (oldName, newName) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldName, newName, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

exports.now = () => {
  const date = dayjs().utc().format('YYYYMMDDHHmmssSSS')
  return date
}
