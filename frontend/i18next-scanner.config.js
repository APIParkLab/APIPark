const fs = require('fs');
const path = require('path');
const { crc32 } = require('crc');

const systemLanguage = {
  en_US: 'en-US',
  zh_CN: 'zh-CN',
  ja_JP: 'ja-JP',
  zh_TW: 'zh-TW',
};
const localesDir = 'packages/common/src/locales/scan';
const newJsonDir = 'packages/common/src/locales/scan/newJson';
const oldJsonDir = 'packages/common/src/locales/scan/oldJson';
const keyHashFile = 'packages/common/src/locales/keyHashMap.json';
let existData = {};
let keyHashMap = {};
fs.readdirSync(localesDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const lang = path.basename(file, '.json');
    const filePath = path.join(localesDir, file);
    try {
      console.log('Current working directory:', process.cwd(), filePath);
      const existJsonData = fs.readFileSync(filePath);
      existData[lang] = JSON.parse(existJsonData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`File not found: ${filePath}. Creating an empty file.`);
        fs.writeFileSync(filePath, JSON.stringify({}));
        existData[lang] = {};
      } else {
        throw error;
      }
    }
  }
});

const keyList = Object.keys(existData);

// 清空 newJson 目录下的所有语言文件
Object.values(systemLanguage).forEach(lng => {
  const newJsonPath = path.join(newJsonDir, `${lng}.json`);
  fs.writeFileSync(newJsonPath, JSON.stringify({})); // 清空文件
});

module.exports = {
  input: [
    'packages/*/src/**/*.{js,jsx,tsx,ts}',
    // 不需要扫描的文件加!
    '!packages/*/src/locales/**',
    '!**/node_modules/**',
  ],
  output: 'packages/common/src/locales/scan', // 输出目录
  options: {
    debug: true,
    func: false,
    trans: false,
    lngs: [systemLanguage.zh_CN, systemLanguage.en_US, systemLanguage.ja_JP, systemLanguage.zh_TW],
    defaultLng: systemLanguage.zh_CN,
    resource: {
      loadPath: './newJson/{{lng}}.json', // 输入路径 (手动新建目录)
      savePath: './newJson/{{lng}}.json', // 输出路径 (输出会根据输入路径内容自增, 不会覆盖已有的key)
      jsonIndent: 2,
      lineEnding: '\n',
    },
    removeUnusedKeys: true,
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  // 这里我们要实现将中文转换成crc格式, 通过crc格式key作为索引, 最终实现语言包的切换.
  transform: function (file, enc, done) {
    // 自己通过该函数来加工key或value
    const { parser } = this;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      options.defaultValue = key;
      const hashKey = `K${crc32(key).toString(16)}`; // crc32转换格式
      keyHashMap[key] = hashKey;

      // 遍历每种语言，逐个语言检查翻译是否存在
      keyList.forEach(lng => {
        const langData = existData[lng] || {};

        // 如果某语言没有翻译该字段，则记录到该语言的 newJson 文件中
        if (!langData[hashKey]) {
          const newJsonPath = path.join(newJsonDir, `${lng}.json`);
          let newJsonData = {};

          // 读取当前语言的 newJson 文件，如果已存在，则加载
          try {
            const newJsonRaw = fs.readFileSync(newJsonPath);
            newJsonData = JSON.parse(newJsonRaw);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              throw error;
            }
          }

          // 只添加尚未存在的 key
          if (!newJsonData[hashKey]) {
            newJsonData[hashKey] = options.defaultValue; // 使用原始 key 作为默认值
            fs.writeFileSync(newJsonPath, JSON.stringify(newJsonData, null, 2));
          }
        }
      });
      // // 如果词条不存在，则写入
      // if (!keyList.includes(hashKey)) {
      //   parser.set(hashKey, options);
      // }
    });
    done();
  },
  flush: function (done) {
    // 将 keyHashMap 写入文件
    fs.writeFileSync(keyHashFile, JSON.stringify(keyHashMap, null, 2));

    // 遍历每种语言，处理旧字段
    keyList.forEach(lng => {
      const localeFilePath = path.join(localesDir, `${lng}.json`);
      const oldJsonPath = path.join(oldJsonDir, `${lng}.json`);
      const langData = existData[lng] || {};

      let oldJsonData = {};

      // 将不存在于 keyHashMap 中的键移动到 oldJson 文件中
      Object.keys(langData).forEach(hashKey => {
        if (!Object.values(keyHashMap).includes(hashKey)) {
          oldJsonData[hashKey] = langData[hashKey]; // 将旧的 key 移到 oldJson 中
        }
      });

      // 写入 oldJson 文件
      if (Object.keys(oldJsonData).length > 0) {
        fs.writeFileSync(oldJsonPath, JSON.stringify(oldJsonData, null, 2));
      }
    });
    done();
  },
};
