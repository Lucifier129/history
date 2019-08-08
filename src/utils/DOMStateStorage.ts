/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 14:52:21 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-05 14:52:03
 */
import warning from 'warning'
import './type'

const QuotaExceededErrors = {
  QuotaExceededError: true,
  QUOTA_EXCEEDED_ERR: true
}

const SecurityErrors = {
  SecurityError: true
}

const KeyPrefix: string = '@@History/'

export const createKey: CH.Utils.CreateKey = (key) =>
  KeyPrefix + key

export const saveState: CH.Utils.SaveKey = (key, state) => {
  if (!window.sessionStorage) {
    // Session storage is not available or hidden.
    // sessionStorage is undefined in Internet Explorer when served via file protocol.
    warning(
      false,
      '[history] Unable to save state; sessionStorage is not available'
    )

    return
  }

  try {
    if (state == null) {
      window.sessionStorage.removeItem(createKey(key))
    } else {
      window.sessionStorage.setItem(createKey(key), JSON.stringify(state))
    }
  } catch (error) {
    if (SecurityErrors[error.name]) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
      warning(
        false,
        '[history] Unable to save state; sessionStorage is not available due to security settings'
      )

      return
    }

    if (QuotaExceededErrors[error.name] && window.sessionStorage.length === 0) {
      // Safari "private mode" throws QuotaExceededError.
      warning(
        false,
        '[history] Unable to save state; sessionStorage is not available in Safari private mode'
      )

      return
    }

    throw error
  }
}

export const readState: CH.Utils.ReadState = (key) => {
  let json: string
  try {
    json = window.sessionStorage.getItem(createKey(key))
  } catch (error) {
    if (SecurityErrors[error.name]) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
      warning(
        false,
        '[history] Unable to read state; sessionStorage is not available due to security settings'
      )

      return undefined
    }
  }

  if (json) {
    try {
      return JSON.parse(json)
    } catch (error) {
      // Ignore invalid JSON.
    }
  }

  return undefined
}
