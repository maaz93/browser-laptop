/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const Immutable = require('immutable')
const ImmutableComponent = require('./immutableComponent')
const Dialog = require('./dialog')
const Button = require('./button')
const SwitchControl = require('./switchControl')
const windowActions = require('../actions/windowActions')
const appActions = require('../actions/appActions')
const ipc = global.require('electron').ipcRenderer
const messages = require('../constants/messages')

class ClearBrowsingDataPanel extends ImmutableComponent {
  constructor () {
    super()
    this.onToggleBrowserHistory = this.onToggleSetting.bind(this, 'browserHistory')
    this.onToggleDownloadHistory = this.onToggleSetting.bind(this, 'downloadHistory')
    this.onToggleCachedImagesAndFiles = this.onToggleSetting.bind(this, 'cachedImagesAndFiles')
    this.onToggleSavedPasswords = this.onToggleSetting.bind(this, 'savedPasswords')
    this.onToggleAllSiteCookies = this.onToggleSetting.bind(this, 'allSiteCookies')
    this.onToggleAutocompleteData = this.onToggleSetting.bind(this, 'autocompleteData')
    this.onToggleAutofillData = this.onToggleSetting.bind(this, 'autofillData')
    this.onToggleSavedSiteSettings = this.onToggleSetting.bind(this, 'savedSiteSettings')
    this.onClear = this.onClear.bind(this)
    this.getIsChecked = this.getIsChecked.bind(this)
    this.getNewDefaultValues = this.getNewDefaultValues.bind(this)
  }
  getIsChecked (setting) {
    const currentValue = this.props.clearBrowsingDataDetail.get(setting)
    if (this.props.defaultValues && currentValue === undefined) {
      return this.props.defaultValues.get(setting)
    } else {
      return currentValue
    }
  }
  getNewDefaultValues () {
    let newDefaultValues = new Immutable.Map()
    let settings = ['browserHistory', 'downloadHistory', 'cachedImagesAndFiles', 'savedPasswords', 'allSiteCookies', 'autocompleteData', 'autofillData', 'savedSiteSettings']
    // TODO: Optimize this to send back only defined settings
    settings.forEach(function (setting) {
      const currentValue = this.props.clearBrowsingDataDetail.get(setting)
      newDefaultValues = newDefaultValues.set(setting, currentValue !== undefined ? currentValue : this.props.defaultValues.get(setting))
    }.bind(this))
    return newDefaultValues
  }
  onToggleSetting (setting, e) {
    windowActions.setClearBrowsingDataDetail(this.props.clearBrowsingDataDetail.set(setting, e.target.value))
  }
  onClear () {
    let detail = this.props.clearBrowsingDataDetail
    if (this.props.defaultValues) {
      detail = this.getNewDefaultValues()
    }
    appActions.setClearBrowserDataDefaults(detail)
    appActions.clearAppData(detail)
    this.props.onHide()
    if (detail.get('allSiteCookies') && detail.get('browserHistory') &&
        detail.get('cachedImagesAndFiles')) {
      ipc.send(messages.PREFS_RESTART)
    }
  }
  render () {
    return <Dialog onHide={this.props.onHide} className='clearBrowsingDataPanel' isClickDismiss>
      <div className='clearBrowsingData' onClick={(e) => e.stopPropagation()}>
        <div className='formSection clearBrowsingDataTitle' data-l10n-id='clearBrowsingData' />
        <div className='formSection clearBrowsingDataOptions'>
          <SwitchControl className='browserHistorySwitch' rightl10nId='browserHistory' checkedOn={this.getIsChecked('browserHistory')} onClick={this.onToggleBrowserHistory} />
          <SwitchControl rightl10nId='downloadHistory' checkedOn={this.getIsChecked('downloadHistory')} onClick={this.onToggleDownloadHistory} />
          <SwitchControl rightl10nId='cachedImagesAndFiles' checkedOn={this.getIsChecked('cachedImagesAndFiles')} onClick={this.onToggleCachedImagesAndFiles} />
          <SwitchControl rightl10nId='savedPasswords' checkedOn={this.getIsChecked('savedPasswords')} onClick={this.onToggleSavedPasswords} />
          <SwitchControl rightl10nId='allSiteCookies' checkedOn={this.getIsChecked('allSiteCookies')} onClick={this.onToggleAllSiteCookies} />
          <SwitchControl className='autocompleteDataSwitch' rightl10nId='autocompleteData' checkedOn={this.getIsChecked('autocompleteData')} onClick={this.onToggleAutocompleteData} />
          <SwitchControl className='autofillDataSwitch' rightl10nId='autofillData' checkedOn={this.getIsChecked('autofillData')} onClick={this.onToggleAutofillData} />
          <SwitchControl className='siteSettingsSwitch' rightl10nId='savedSiteSettings' checkedOn={this.getIsChecked('savedSiteSettings')} onClick={this.onToggleSavedSiteSettings} />
        </div>
        <div className='formSection clearBrowsingDataButtons'>
          <Button l10nId='cancel' className='secondaryAltButton' onClick={this.props.onHide} />
          <Button l10nId='clear' className='primaryButton clearDataButton' onClick={this.onClear} />
        </div>
        <div className='formSection clearBrowsingDataWarning'>
          <div data-l10n-id='clearDataWarning' />
        </div>
      </div>
    </Dialog>
  }
}

module.exports = ClearBrowsingDataPanel
