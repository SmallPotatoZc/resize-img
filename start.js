const process = require('process');
const { spawn } = require('child_process');

// 程序的执行路径
const CURPATH = process.cwd();

const argv = process.argv.splice(2);

const resizeImg = spawn(`${CURPATH}/macos/resizeImg`, argv);

resizeImg.stdout.on('data', (data) => {
  console.log(data.toString());
});

resizeImg.stderr.on('data', (data) => {
  console.log(data.toString());
});