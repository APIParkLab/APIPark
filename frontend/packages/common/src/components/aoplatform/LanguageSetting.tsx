import { Dropdown, Row, Col, Button } from 'antd';
import i18n from '@common/locales';
import { memo, useEffect, useMemo } from 'react';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { Icon } from '@iconify/react/dist/iconify.js';

const LanguageSetting = ({ mode = 'light' }: { mode?: 'dark' | 'light' }) => {
  const { dispatch, state } = useGlobalContext();
  const items = [
    {
      key: 'en-US',
      label: (
        <Button key="en" type="text" className="flex items-center p-0 bg-transparent border-none">
          English
        </Button>
      ),
      title: 'English',
    },
    {
      key: 'ja-JP',
      label: (
        <Button key="jp" type="text" className="flex items-center p-0 bg-transparent border-none">
          日本語
        </Button>
      ),
      title: '日本語',
    },
    {
      key: 'zh-TW',
      label: (
        <Button key="tw" type="text" className="flex items-center p-0 bg-transparent border-none">
          繁體中文
        </Button>
      ),
      title: '繁體中文',
    },
    {
      key: 'zh-CN',
      label: (
        <Button key="cn" type="text" className="flex items-center p-0 bg-transparent border-none">
          简体中文
        </Button>
      ),
      title: '简体中文',
    },
  ];

  const langLabel = useMemo(
    () => items.find(item => item?.key === state.language)?.title,
    [state.language]
  );

  useEffect(() => {
    const savedLang = sessionStorage.getItem('i18nextLng');
    const browserLang = navigator.language || navigator.userLanguage;
    if (savedLang) return;

    dispatch({ type: 'UPDATE_LANGUAGE', language: browserLang });
  }, []);
  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        items,
        style: { minWidth: '80px' },
        onClick: e => {
          const { key } = e;
          dispatch({ type: 'UPDATE_LANGUAGE', language: key });
          i18n.changeLanguage(key);
        },
      }}
    >
      <Button
        className={`border-none ${
          mode === 'dark'
            ? 'text-[#333] hover:text-[#333333b3]'
            : 'text-[#ffffffb3] hover:text-[#fff] '
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
  );
};
export default memo(LanguageSetting);
