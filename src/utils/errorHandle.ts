import { Alert } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler'
import { log } from '@/utils/log'
import { getBootLog } from '@/utils/bootLog'
import { toast } from './tools'

const buildDetail = (e: Error, isFatal: boolean) => {
  const bootLog = getBootLog()
  const stack = (e.stack ?? '').replace(/^Error.*\n?/, '')
  return [
    '应用出 bug 了😭，以下是错误异常信息。点「复制错误信息」可复制完整内容。',
    '',
    `Error: ${isFatal ? 'Fatal: ' : ''}${e.name} ${e.message}`,
    '',
    '--- Boot Log ---',
    bootLog.slice(-1500) || '(empty)',
    '',
    '--- Stack ---',
    stack.slice(0, 2500) || '(empty)',
  ].join('\n')
}

const errorHandler = (e: Error, isFatal: boolean) => {
  const excludedErrors = [
    'Failed to construct \'Response\'',
  ]
  if (isFatal) {
    if (excludedErrors.some((excludedError) => e.message.includes(excludedError))) {
      toast('应用遇到了错误，如果你有固定的复现方式，请截图并在 GitHub 反馈（并附上具体的操作步骤，以及“设置-错误日志”的内容）')
    } else {
      const detail = buildDetail(e, isFatal)
      Alert.alert(
        '💥Unexpected error occurred💥',
        detail,
        [
          {
            text: '复制错误信息 (Copy)',
            onPress: () => {
              Clipboard.setString(detail)
            },
          },
          {
            text: '关闭 (Close)',
            onPress: () => {
              // exitApp()
            },
          },
        ],
      )
    }
  }
  log.error(e.stack)
}

if (process.env.NODE_ENV !== 'development') {
  setJSExceptionHandler(errorHandler)

  setNativeExceptionHandler((errorString) => {
    log.error(errorString)
    console.log('+++++', errorString, '+++++')
  }, false)
}
