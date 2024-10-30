
/** @type {import('tailwindcss').Config} */

module.exports = {
    important:true,
    corePlugins:{
        preflight:false
    },
    content: [
      `./packages/**/index.html`,
      `./packages/**/src/**/*.{js,ts,jsx,tsx}`,],
    theme: {
      extend: {
        width: {
          INPUT_NORMAL: '100%',
          // INPUT_NORMAL: '346px',
          INPUT_LARGE: '508px',
          GROUP: '240px',
          SEARCH: '276px',
          LOG: '254px'
        },
        minHeight:{
          TEXTAREA:'68px'
        },
        borderRadius: {
          DEFAULT: 'var(--border-radius)',
          SEARCH_RADIUS: '50px'
        },
        boxShadow:{
          SCROLL: '0 2px 2px #0000000d',
          SCROLL_TOP:' 0 -2px 2px -2px var(--border-color)'
        },
        colors: {
          DISABLE_BG: 'var(--disabled-background-color)',
          MAIN_TEXT: 'var(--text-color)',
          MAIN_HOVER_TEXT: 'var(--text-hover-color)',
          SECOND_TEXT:'var(--disabled-text-color)',
          MAIN_BG: 'var(--background-color)',
          MENU_BG:'var(--MENU-BG-COLOR)',
          'bar-theme': 'var(--bar-background-color)',
          BORDER: 'var(--border-color)',
          NAVBAR_BTN_BG: 'var(--item-active-background-color)',
          MAIN_DISABLED_BG: 'var(--disabled-background-color)',
          theme: 'var(--primary-color)',
          DESC_TEXT: 'var(--TITLE_TEXT)',
          HOVER_BG: 'var(--item-hover-background-color)',
          guide_cluster: '#ee6760',
          guide_upstream: '#f9a429',
          guide_api: '#71d24d',
          guide_publishApi: '#5884ff',
          guide_final: '#915bf9',
          table_text: 'var(--table-text-color)',
          status_success:'#138913',
          status_fail:"#ff3b30",
          status_update:"#03a9f4",
          status_pending:"#ffa500",
          status_offline:"#8f8e93",
          A_HOVER:'var(--button-primary-hover-background-color)'
        },
        spacing: {
          mbase: 'var(--FORM_SPAN)',
          label: '12px', // 选择器和label之间的间距，待删
          btnbase: 'var(--LAYOUT_MARGIN)', // x方向的间距
          btnybase: 'var(--LAYOUT_MARGIN)', // y轴方向的间距
          btnrbase: '20px', // 页面最右侧边距20px
          formtop: 'var(--FORM_SPAN)',
          icon: '5px',
          blockbase: '40px',
          DEFAULT_BORDER_RADIUS: 'var(--border-radius)',
          TREE_TITLE:'var(--small-padding) var(--LAYOUT_PADDING);'
        },
        borderColor: {
          'color-base': 'var(--border-color)'
        }
      }
    },
    plugins: [],
    corePlugins: {
      preflight: false,
    },
  }
  
  