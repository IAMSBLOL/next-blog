import chalk from 'chalk'

import shell from 'shelljs'

import { v4 as uuidv4 } from 'uuid';

import packageJson from '../package.json' assert {type:'json'}

//
const _tag = uuidv4()

// 这个是推送到docker hub，想改的话自己配置一下命名空间和仓库

// const _describetion = args['--d'] || args.d || 'test'

if (/[\u4e00-\u9fa5]/.test(_tag)) {
  console.log(chalk.yellow('命令参数:'))
  console.log(_tag)
  console.log(chalk.redBright('中文优雅、博大精深，但是docker并不支持'))
  process.exit(1)
}

const tag = _tag

const build = shell.exec(`docker build -t iamsblol/${packageJson.name}:${tag} -f ./docker/Dockerfile .`)
if (build.code) {
  console.log(chalk.red('npm run build failed……\n意外总比惊喜来得快~这就是生活吧\n我猜是你的小鲸鱼跪了'))
} else {
  // shell.exec(`docker tag ${packageJson.name}:${tag} iamsblol/${packageJson.name}:${tag}`)
  const rst = shell.exec(`docker push iamsblol/${packageJson.name}:${tag}`)

  if (rst.code) {
    console.log(chalk.redBright('镜像推送失败……'))
  } else {
    console.log(chalk.green(`
    -----------------------------------------------------------------------------------------------------------
    |    恭喜您推送镜像成功，具体地址请查看，https://hub.docker.com/repository/docker/iamsblol/images_of_sb      |
    -----------------------------------------------------------------------------------------------------------
    `));
  }
}
