import { Dropdown, Row, Col, Button } from 'antd';
import i18n from '@common/locales';
import { $t } from '@common/locales';
import { memo, useEffect, useMemo } from 'react';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { Icon } from '@iconify/react/dist/iconify.js';

const LanguageSetting = ({mode = 'light'}:{mode?:'dark'|'light'}) => {
    const { dispatch,state} = useGlobalContext()
    const items = [
    {
      key: 'cn',
      label: <Button key="cn" type="text" className="border-none p-0 flex items-center bg-transparent ">
        {$t('简体')}
      </Button>,
      title: $t('简体'),
    },
    {
      key: 'en',
      label:<Button key="en" type="text" className="border-none p-0 flex items-center bg-transparent ">
      {$t('英文')}
    </Button>,
    title:$t('英文')
    }
  ];

  const langLabel = useMemo(()=>items.find((item) => item?.key === state.language)?.title,[state.language])

  useEffect(()=>{
    sessionStorage.getItem('i18nextLng') && dispatch({ type: 'UPDATE_LANGUAGE',  language: sessionStorage.getItem('i18nextLng') as 'en' | 'cn'  });
  },[
  ])
  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        items,
        style:{minWidth:'80px'},
        onClick: (e) => {
          const { key } = e;
          dispatch({ type: 'UPDATE_LANGUAGE',  language: key  });
          i18n.changeLanguage(key);
          // window.location.reload()
        }
      }}
    >
       <Button  className={`border-none ${mode==='dark' ? "text-[#333] hover:text-[#333333b3]" : "text-[#ffffffb3] hover:text-[#fff] "}`}  type="default" ghost >
          <span className='flex items-center gap-[8px]'> <Icon icon="ic:baseline-language" width="14" height="14"/>{langLabel}</span>
        </Button> 
    </Dropdown>
  );
};
export default memo(LanguageSetting);

