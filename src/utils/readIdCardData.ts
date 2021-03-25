import { getIdCardInfo, getIdCardImg } from './cardUtil';
import moment from 'moment';
import { message } from 'antd';
import { _uploadImg } from 'api';
import { base64ConvertFile, _get } from 'utils';

export async function readIdCardData(form: any, name: string, callback?: any) {
  const result = await getIdCardInfo();
  const imgResult = await getIdCardImg();
  let imgRes: any = {};
  if (_get(result, 'result') === false) {
    return {};
  }
  if (_get(result, 'return') === '144') {
    let birthday = `${_get(result, 'idNo').substring(6, 10)}-${_get(result, 'idNo').substring(10, 12)}-${_get(
      result,
      'idNo',
    ).substring(12, 14)}`;
    form.setFields([
      { name: name, value: _get(result, 'name') },
      { name: 'sex', value: _get(result, 'sex') === '女' ? '2' : '1' },
      { name: 'address', value: _get(result, 'address') },
      { name: 'cardtype', value: '1' },
      { name: 'idcard', value: _get(result, 'idNo') },
      { name: 'idcardVerify', value: _get(result, 'idNo') },
      { name: 'birthday', value: moment(birthday) },
    ]);
    if (_get(imgResult, 'result', '')) {
      const file = base64ConvertFile(_get(imgResult, 'result'));
      let formData = new FormData();
      formData.append('file', file);
      imgRes = await _uploadImg(formData);
    } else {
      message.error('未读取到二代证照片');
    }
  } else {
    message.error('未读取到二代证信息');
  }
  if (callback) {
    callback(result, _get(imgRes, 'data', {}));
  }
  return { cardInfoResult: result, imgData: _get(imgRes, 'data', {}) };
}
