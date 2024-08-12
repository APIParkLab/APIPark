
import './App.css'
import { ConfigProvider } from 'antd';
import RenderRoutes from '@market/components/aoplatform/RenderRoutes';
import {BreadcrumbProvider} from "@common/contexts/BreadcrumbContext.tsx";
import { StyleProvider } from '@ant-design/cssinjs';
import zhCN from 'antd/locale/zh_CN';
import useInitializeMonaco from "@common/hooks/useInitializeMonaco";

const antdComponentThemeToken = {
  token: {
    // Seed Token，影响范围大
    colorPrimary: '#3D46F2',
    colorBorder:'#ededed',
    colorText:'#333',
    borderRadius: 4,
    // 派生变量，影响范围小
    colorBgContainer: '#fff',
    colorPrimaryBg:'#EBEEF2',
    colorTextQuaternary:'#BBB',
    colorTextTertiary:'#999'
  },
  components:{
    // 派生变量，影响范围小
    Input:{
      activeShadow:'none'
    },
    Select:{
      activeShadow:'none'
    },
    Checkbox:{
      activeShadow:'none'
    },
    Cascader:{
      activeShadow:'none',
      optionSelectedBg:'#EBEEF2',
      optionHoverBg:'#EBEEF2'
    },
    Layout: {
      bodyBg: '#fff',
      headerBg: '#fff',
      headerColor: '#333',
      headerHeight: 50,
      headerPadding: '10 20px',
      lightSiderBg: '#fff',
      siderBg: '#fff',
    },
    Breadcrumb:{
      itemColor:'#666',
      linkColor:'#666',
      lastItemColor:'#333',
    },
    Table:{
        headerBorderRadius:0,
        headerSplitColor:'#ededed',
        borderColor:'#ededed',
        cellPaddingBlockMD:'10px',
        cellPaddingInlineMD:'12px',
        cellPaddingBlockSM:'8px',
        cellPaddingInlineSM:'12px',
        headerFilterHoverBg:'#EBEEF2',
        headerSortActiveBg:'#F7F8FA',
        headerSortHoverBg:'#F7F8FA',
        fixedHeaderSortActiveBg:'#F7F8FA',
        headerBg:'#F7F8FA',
        rowHoverBg:'#EBEEF2'
      
    },
    Segmented:{
        itemColor:'#333',
        itemSelectedColor:'#333',
        trackBg:'#f7f8fa',
        trackPadding:0,
        // itemHoverColor:'#EBEEF2',
        itemActiveBg:'#EBEEF2',
        itemHoverBg:'#EBEEF2',
        itemSelectedBg:'#EBEEF2',
    },
      Tree:{
        // titleHeight:30,
        // fontSize:12,
        directoryNodeSelectedBg:'#EBEEF2',
        directoryNodeSelectedColor:'#333',
        nodeSelectedBg:'#EBEEF2',
        nodeHoverBg:'#EBEEF2'
      },
      Collapse:{
          headerBg:'#f7f8fa',
          headerPadding:"12px",
          contentPadding:"0 10px 12px 10px"
      },
      Button:{
        // paddingInline:8,
        dangerShadow:'none',
        defaultShadow:'none',
        primaryShadow:'none'
      },
      Tabs:{
        cardBg:'#EBEEF2',
        cardHeight:42,
        horizontalItemGutter:8,
        horizontalItemPaddingSM:'12px 8px 8px 8px',
        horizontalItemPadding:'12px 8px 8px 8px',
      },
      Menu:{
        // itemBg:'#F7F8FA',
        // subMenuItemBg:'#F7F8FA',
        // itemMarginBlock:0,
        // activeBarBorderWidth:0,
        // itemSelectedColor:'#333',
        // itemSelectedBg:'#EBEEF2',
        // itemHoverBg:'#EBEEF2'
      },
      List:{
        itemPadding:'8px 0'
      },
      Form:{
        itemMarginBottom:10,
        
      },
      Alert:{
        defaultPadding:'12px 16px'
      },
      Tag:{
        defaultBg:"#f7f8fa"
      },
  }
}

function App() {
  useInitializeMonaco()

  return (
      <StyleProvider hashPriority={"high"}>
        <ConfigProvider 
          locale={zhCN}
          wave={{disabled:true}}
          theme={antdComponentThemeToken}>
                <BreadcrumbProvider>
                    <RenderRoutes />
                </BreadcrumbProvider>
        </ConfigProvider>
      </StyleProvider>
  );
}

export default App
