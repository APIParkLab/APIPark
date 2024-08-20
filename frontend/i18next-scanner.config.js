const fs = require('fs');
const { crc32 } = require('crc');

const systemLanguage = {
  zh_CN: 'zh-CN',
  en_GB: 'en-GB'
};
// 读取已经存在在en.json文件的词条
let existData = {};
try {
  console.log('Current working directory:', process.cwd());
  const existJsonData = fs.readFileSync('packages/common/src/locales/scan/en-GB.json');
  existData = JSON.parse(existJsonData);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('File not found: packages/common/src/locales/scan/en-GB.json. Creating an empty file.');
    fs.writeFileSync('packages/common/src/locales/scan/en-GB.json', JSON.stringify({}));
  } else {
    throw error;
  }
}

const keyList = Object.keys(existData);

module.exports = {
  input: [
    'packages/*/src/**/*.{js,jsx,tsx,ts}',
    // 不需要扫描的文件加!
    '!packages/*/src/locales/**',
    '!**/node_modules/**'
  ],
  output: 'packages/common/src/locales/scan', // 输出目录
  options: {
    debug: true,
    func: false,
    trans: false,
    lngs: [systemLanguage.zh_CN, systemLanguage.en_GB],
    defaultLng: systemLanguage.zh_CN,
    resource: {
      loadPath: './newJson/{{lng}}.json', // 输入路径 (手动新建目录)
      savePath: './newJson/{{lng}}.json', // 输出路径 (输出会根据输入路径内容自增, 不会覆盖已有的key)
      jsonIndent: 2,
      lineEnding: '\n'
    },
    removeUnusedKeys: true,
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  // 这里我们要实现将中文转换成crc格式, 通过crc格式key作为索引, 最终实现语言包的切换.
  transform: function (file, enc, done) {
    // 自己通过该函数来加工key或value
    const { parser } = this;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      options.defaultValue = key;
      const hashKey = `K${crc32(key).toString(16)}`; // crc32转换格式
      // 如果词条不存在，则写入
      if (!keyList.includes(hashKey)) {
        parser.set(hashKey, options);
      }
    });
    done();
  }
};