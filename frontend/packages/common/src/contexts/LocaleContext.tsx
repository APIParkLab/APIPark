import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConfigProviderProps } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import zhTW from 'antd/locale/zh_TW';
import jaJP from 'antd/locale/ja_JP';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/ja';

type Locale = ConfigProviderProps['locale'];

const languageMap: Record<string, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh-TW': zhTW,
  'ja-JP': jaJP,
};

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: string) => void;
}>({
  locale: zhCN,
  setLocale: () => {},
});

export const LocaleProvider: React.FC = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(zhCN);

  const setLocale = (language: string) => {
    dayjs.locale(language);
    setLocaleState(languageMap[language]);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocaleContext = () => useContext(LocaleContext);