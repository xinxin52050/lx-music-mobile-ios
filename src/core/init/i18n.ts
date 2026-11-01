import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createI18n } from '@/lang/i18n'
import type { I18n } from '@/lang/i18n'
import { getDeviceLanguage } from '@/utils/tools'
import { setLanguage, updateSetting } from '@/core/common'

// iOS 首次适配版本的 getSystemLocales 返回 BCP-47（如 zh-Hans-CN），
// 不在 availableLocales 里，导致中文设备被写成 en_us。
// 这里在 iOS 上做一次性纠正，之后完全尊重用户手动选择的语言。
const IOS_LANG_FIX_KEY = '@lx_ios_lang_fix_v1'

export default async(setting: LX.AppSetting) => {
  let lang = setting['common.langId']

  global.i18n = createI18n()

  const deviceLanguage = await getDeviceLanguage()

  if (Platform.OS === 'ios') {
    const fixed = await AsyncStorage.getItem(IOS_LANG_FIX_KEY).catch(() => null)
    if (!fixed) {
      if ((!lang || lang === 'en_us') && (deviceLanguage === 'zh_cn' || deviceLanguage === 'zh_tw')) {
        lang = deviceLanguage as I18n['locale']
      }
      await AsyncStorage.setItem(IOS_LANG_FIX_KEY, '1').catch(() => {})
    }
  }

  if (!lang || !global.i18n.availableLocales.includes(lang)) {
    lang = global.i18n.availableLocales.includes(deviceLanguage as I18n['locale'])
      ? deviceLanguage as I18n['locale']
      : 'en_us'
  }

  if (lang !== setting['common.langId']) updateSetting({ 'common.langId': lang })
  setLanguage(lang)
}
