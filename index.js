const _ = require('lodash');
const sizeOf = require('image-size');
const fileType = require('file-type');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const process = require('process');

// 程序的执行路径
const CURPATH = process.cwd();

const param_config = {
  name: 'resize',
  description: '图片压缩',
  options: [{
    name: 'path',
    shortcut: 'p',
    default: '',
    description: '目标路径'
  }, {
    name: 'watch',
    shortcut: 'w',
    default: false,
    description: '是否监听目标路径'
  }, {
    name: 'size',
    shortcut: 's',
    default: 1024,
    description: '图片压缩尺寸'
  }, {
    name: 'replace',
    shortcut: 'r',
    default: false,
    description: '是否替换原有图片'
  }]
}

const params = require('parameters')(param_config);
const args = params.parse();

SIZE = args.size ? Number(args.size) : 1024;
REPLACE = args.replace ? args.replace : 'false';

// 开始执行
if (!args.help) {
  const _path = path.resolve(CURPATH, `${args.path}`); // 当前路径
  let _continus = true;
  if (!args.watch) {
    // 判断是否为有效路径
    if (fs.existsSync(_path)) {
      if (fs.lstatSync(_path).isDirectory()) {
        resizeImages(_path);
      } else {
        resizeImage(_path);
      }
    } else {
      throw new Error('路径无效');
    }
  } else {
    let _dir = _path;
    if (!fs.lstatSync(_path).isDirectory()) {
      _dir = path.dirname(_path);
    }
    fs.watch(_dir, {
      recursive: true
    }, (eventType, filename) => {
      if (filename) {
        let _tar = `${_dir}/${filename}`;
        try {
          if (fs.existsSync(_tar) && !/-min\./g.test(filename)) {
            resizeImage(_tar);
          }
        } catch (err) {
        }
      }
    });
  }
} else {
  console.log(params.help());
}

// 图片处理函数
function resize(item) {
  var fT = fileType(fs.readFileSync(item));
  if (fT && (fT.mime === 'image/png' || fT.mime === 'image/jpeg' || fT.mime === 'image/gif')) {
    console.log('%s 文件开始转化...', item);
    let outFile = item.replace(`.${fT.ext}`, `-min.${fT.ext}`);
    sharp(item).resize(SIZE).toFile(outFile, function (err) {
      if (err) {
        console.log('%s 文件转化失败', item);
        return err;
      }
      console.log('%s 文件转化完成', item);
      // 删除原有图片
      if (REPLACE == true) {
        console.log('删除原有图片', outFile, item);
        fs.rename(outFile, item, function (err) {
          if (err) {
            console.error('删除原有图片失败', item, err);
            return err;
          }
        });
      }
    });
  }
}

function resizeImages(path) {
  fs.readdir(path, function (err, files) {
    if (err) {
      console.error('Task Error! Try again!');
      return err;
    }
    let minReg = /-min./;
    _.map(files, function (item) {
      if (!minReg.test(item)) {
        item = path + '/' + item;
        fs.stat(item, function (err, result) {
          if (err) {
            console.error('打开文件时出现错误');
            return err;
          }
          if (result.isDirectory()) {
            resizeImages(item);
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