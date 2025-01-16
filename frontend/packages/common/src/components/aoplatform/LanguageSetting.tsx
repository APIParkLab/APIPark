import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import i18n from '@common/locales'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Dropdown } from 'antd'
import { memo, useEffect, useMemo } from 'react'

const LanguageItems = [
  {
    key: 'en-US',
    label: (
      <Button key="en" type="text" className="flex items-center p-0 bg-transparent border-none">
        English
      </Button>
    ),
    title: 'English'
  },
  {
    key: 'ja-JP',
    label: (
      <Button key="jp" type="text" className="flex items-center p-0 bg-transparent border-none">
        日本語
      </Button>
    ),
    title: '日本語'
  },
  {
    key: 'zh-TW',
    label: (
      <Button key="tw" type="text" className="flex items-center p-0 bg-transparent border-none">
        繁體中文
      </Button>
    ),
    title: '繁體中文'
  },
  {
    key: 'zh-CN',
    label: (
      <Button key="cn" type="text" className="flex items-center p-0 bg-transparent border-none">
        简体中文
      </Button>
    ),
    title: '简体中文'
  }
]
const LanguageSetting = ({ mode = 'light' }: { mode?: 'dark' | 'light' }) => {
  const { dispatch, state } = useGlobalContext()

  const langLabel = useMemo(() => LanguageItems.find((item) => item?.key === state.language)?.title, [state.language])

  useEffect(() => {
    const savedLang = i18n.language || sessionStorage.getItem('i18nextLng')
    if (savedLang && state.language !== savedLang) {
      dispatch({ type: 'UPDATE_LANGUAGE', language: savedLang })
    } else if (!savedLang) {
      const browserLang = navigator.language
      const supportedLang = LanguageItems.find((item) => item.key === browserLang) ? browserLang : 'zh-CN'
      if (state.language === supportedLang) return
      dispatch({ type: 'UPDATE_LANGUAGE', language: supportedLang })
      i18n.changeLanguage(supportedLang)
    }
  }, [])
  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        items: LanguageItems,
        style: { minWidth: '80px' },
        onClick: (e) => {
          const { key } = e
          dispatch({ type: 'UPDATE_LANGUAGE', language: key })
          i18n.changeLanguage(key)
          sessionStorage.setItem('i18nextLng', key)
        }
      }}
    >
      <Button
        className={`border-none ${
          mode === 'dark' ? 'text-[#333] hover:text-[#333333b3]' : 'text-[#ffffffb3] hover:text-[#fff] '
        }`}
        type="default"
        ghost
      >
        <span className="flex items-center gap-[8px]">
          {' '}
          <Icon icon="ic:baseline-language" width="14" height="14" />
          {langLabel}
        </span>
      </Button>
    </Dropdown>
  )
}
export default memo(LanguageSetting)
