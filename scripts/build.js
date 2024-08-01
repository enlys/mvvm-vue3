// 进行打包 monorepo
// 1.获取打包目录
import {execa} from 'execa';
import fs from'fs';

const dirs = fs.readdirSync('./packages').filter(f => {
  if (!fs.statSync(`./packages/${f}`).isDirectory()) {
    return false;
  }
  // const pkg = require(`./packages/${f}/package.json`);
  // return !pkg.private;
  return true;
});

function runParallel(dirs, iteratorFn) {
  const res = dirs.map(f => iteratorFn(f));
  return Promise.all(res);
}

async function build(dir) {
  // -c 执行配置,环境变量
  //  {stdio: 'inherit'} 子进程的输出在父进程能看到
  // bundleConfigAsCjs 兼容cjs
  await execa('rollup', ['-c', '--environment', `TARGET:${dir}`, '--bundleConfigAsCjs'], {stdio: 'inherit'});
  // return new Promise((resolve, reject) => {
  //   const cmd = 'rollup';
  //   const args = '-cw';
  //   const opts = {
  //     stdio: 'inherit',
  //   };
  //   const child = require('child_process').spawn(cmd, args.split(' '), opts);
  //   child.on('close', code => {
  //     if (code !== 0) {
  //       reject(new Error(`命令行执行失败`));
  //     }
  //   })
  // })
}

// 并行打包
runParallel(dirs, build).then(() => {
  console.log('打包成功');
});

