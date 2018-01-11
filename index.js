const _ = require('lodash');
const sizeOf = require('image-size');
const fileType = require('file-type');
const sharp = require('sharp');
const fs = require('fs');
const process = require('process');

let PATH = ''; // 处理的路径
let SIZE = 1024; // 处理图片的最大尺寸
let REPLACE = 'false';

PATH = process.argv[2];
SIZE = process.argv[3] ? Number(process.argv[3]) : 1024;
REPLACE = process.argv[3] ? process.argv[4] : 'false';

console.log('执行的参数', PATH, SIZE, REPLACE);

// 图片处理函数
function resize(item) {
  var fT = fileType(fs.readFileSync(item));
  if (fT.mime === 'image/png' || fT.mime === 'image/jpeg' || fT.mime === 'image/gif') {
    console.log('%s 文件开始转化...', item);
    let outFile = item.replace(`.${fT.ext}`, `-min.${fT.ext}`);
    sharp(item).resize(SIZE).toFile(outFile, function(err) {
      if (err) {
        console.log('%s 文件转化失败', item);
        return err;
      }
      console.log('%s 文件转化完成', item);
      // 删除原有图片
      if (REPLACE === 'true') {
        console.log('删除原有图片', outFile, item);
        fs.rename(outFile, item, function(err) {
          if(err) {
            console.error('删除原有图片失败', item, err);
            return err;
          }
        });
      }
    });
  }
}

/**
 * 图片处理的逻辑
 * 功能：1. 遍历目录下的所有的未处理的图片并进行压缩 2. 是否删除原来的图片
 * @param {string} PATH - 命令的第一个参数，图片的处理路径
 * @param {string} SIZE - 命令的第二个参数，图片的大小
 * @param {string} REPLACE - 命令的第三个参数，是否删除原来的图片
 */
function resizeImages(path) {
  fs.readdir(path, function(err, files) {
    if(err) {
      console.error('Task Error! Try again!');
      return err;
    }
    let minReg = /-min./;
    _.map(files, function(item) {
      if (!minReg.test(item)) {
        item = path + '/' + item;
        fs.stat(item, function(err, result) {
          if(err) {
            console.error('打开文件时出现错误');
            return err;
          }
          if (result.isDirectory()) {
            resizeImages(item, SIZE);
          } else if (result.isFile()) {
            resize(item);
          }
        });
      }
    });
  });
}

// 处理单张图片
function resizeImage(path) {
  resize(path);
}

if (PATH) {
  fs.stat(PATH, function(err, result) {
    if (result.isDirectory()) {
      // 如果是目录则进行批量处理
      resizeImages(PATH, SIZE);
    } else {
      // 如果是单张图片
      resizeImage(PATH, SIZE);
    }
  });
}