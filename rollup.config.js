// 通过rollup.config.js配置rollup打包
// 引入依赖
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json'; 
import resolvePlugin from '@rollup/plugin-node-resolve'; // 引入插件
import path from 'path';

// 获取文件路径
let packagesDir = path.resolve('./', 'packages');

// 获取需要打包的包
let packageDir = path.resolve(packagesDir, process.env.TARGET);

const resolve = p => path.resolve(packageDir, p);
const pkg = require(resolve('package.json'));
const packageOptions = pkg.buildOptions;
const name = path.basename(packageDir);

// 创建配置
const outputOptions = {
  'esm-bundler':   {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'esm',
  },
  'cjs':{
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife',
  }
};

const options = pkg.buildOptions;

function createConfig(format, output) {
  return {
    input: resolve('src/index.ts'),
    output: {
      file: output.file,
      format: output.format,
      name: options.name,
      sourcemap: true
    },
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve('./', 'tsconfig.json'),
     }),
     resolvePlugin()
    ]
  }
}

// 导出配置
export default options.formats.map(format => createConfig(format, outputOptions[format]));
