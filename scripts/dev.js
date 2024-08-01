// 进行打包 monorepo
// 1.获取打包目录
import {execa} from 'execa';
async function build(dir) {
  // -cw 执行配置,环境变量 且监听
  //  {stdio: 'inherit'} 子进程的输出在父进程能看到
  await execa('rollup', ['-cw', '--environment', `TARGET:${dir}`, '--bundleConfigAsCjs'], {stdio: 'inherit'});
}

build('reactivity');


