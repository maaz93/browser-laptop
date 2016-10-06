// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs')
const path = require('path')
const isWindows = process.platform === 'win32'
const isDarwin = process.platform === 'darwin'

let electron
let app
try {
  electron = require('electron')
} catch (e) {
  electron = global.require('electron')
}
if (process.type === 'browser') {
  app = electron.app
} else {
  app = electron.remote.app
}

const getWidevineCDMComponentPath = () =>
  path.join(app.getPath('userData'), 'Extensions', 'WidevineCdm', '1.4.8.903')

const getWidevineCDMComponentBasePath = () =>
  path.join(getWidevineCDMComponentPath(), '_platform_specific')

const getWidevineCDMComponentManifestPath = () =>
  path.join(getWidevineCDMComponentPath(), 'manifest.json')

const getWidevineCMDPluginPath = () => {
  if (isWindows && process.arch === 'x64') {
    return path.join(getWidevineCDMComponentBasePath(), 'win_x64', 'widevinecdmadapter.dll')
  } else if (isWindows) {
    return path.join(getWidevineCDMComponentBasePath(), 'win_x86', 'widevinecdmadapter.dll')
  } else if (isDarwin) {
    return path.join(getWidevineCDMComponentBasePath(), 'mac_x64', 'widevinecdmadapter.plugin')
  }
  return path.join(getWidevineCDMComponentBasePath(), 'linux', 'libwidevinecdmadapter.so')
}

module.exports.init = () => {
  // TODO: This only works if sync currently
  try {
    const widevineAdapterManifestPath = getWidevineCDMComponentManifestPath()
    const data = fs.readFileSync(widevineAdapterManifestPath, 'utf8')
    if (!data) {
      return false
    }

    const widevineAdapterManifest = JSON.parse(data)
    // console.log('Enabling Widevine: ',  getWidevineCMDPluginPath(), widevineAdapterManifest.version)
    app.commandLine.appendSwitch('widevine-cdm-path', getWidevineCMDPluginPath())
    app.commandLine.appendSwitch('widevine-cdm-version', widevineAdapterManifest.version)
    return true
  } catch (e) {
    console.error('Widevine init exception:', e)
    return false
  }
}

module.exports.checkWidevineInstalled = (cb) => {
  try {
    const widevineAdapterManifestPath = getWidevineCDMComponentManifestPath()
    fs.readFile(widevineAdapterManifestPath, (err, data) => {
      if (err || !data) {
        cb(false)
      } else {
        cb(true)
      }
    })
  } catch (e) {
    cb(false)
  }
}

