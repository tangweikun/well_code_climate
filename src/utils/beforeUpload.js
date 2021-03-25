import { message } from 'antd';

export function beforeUpload(file, fileList, fileTypes = ['image/jpeg', 'image/png'], maxSize = 10) {
  const isValidFileType = fileTypes.includes(file.type);
  const isValidSize = file.size / 1024 / 1024 < maxSize;

  if (!isValidFileType) {
    message.error('上传文件格式不对!');
    return false;
  }

  if (!isValidSize) {
    message.error(`图片必须小于${maxSize}M!`);
    return false;
  }

  return true;
}
