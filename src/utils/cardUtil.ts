import { _get } from 'utils';
import { message } from 'antd';
import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

/*打开设备 */
export async function openDevice() {
  // const openRes = await fetch('http://127.0.0.1:12321/Dtm_Api/DtmCardCommOpen?CardPort=100&DevicePort=0');
  // const openResult = await openRes.json();

  // return openResult;
  return await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardCommOpen?CardPort=100&DevicePort=0');
}

/*密钥验证 */
export async function keyVerify() {
  const pwdResult = await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardCommandEx?Command=12545&Data=0');
  // const pwdResult = await pwdRes.json();
  return pwdResult;
}

/*读取IC卡信息 */
export async function getICCardInfo() {
  const readICCardResult = await _request(
    'http://127.0.0.1:12321/Dtm_Api/DtmCardDataRead?StructType=31&Index=0&Count=1',
  );
  // const readICCardResult = await readICCardRes.json();
  if (_get(readICCardResult, 'return', '') === 0) {
    /*获取读取到的IC卡信息*/
    const getICCardRes = await fetch('http://127.0.0.1:12321/Dtm_Api/DtmCardGetDataStrEx');
    const icCardInfo = await getICCardRes.json();
    if (_get(icCardInfo, 'return', '') === 0) {
      return _get(icCardInfo, 'data', '');
    }
  } else if (_get(readICCardResult, 'return', '') === 1) {
    return false;
  } else if (_get(readICCardResult, 'return', '') === 3) {
    return false;
  }
  return '';
}

/*读取感应卡出厂编号*/
export async function getICCardID() {
  /*打开设备 */
  const openResult = await openDevice();
  if (_get(openResult, 'return', '') === 0) {
    const readICCardIDResult = await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardCommandEx?Command=12558&Data=0');

    if (_get(readICCardIDResult, 'return', '') === 0) {
      /*获取读取感应卡出厂编号 */
      const ICCardIDRes = await fetch('http://127.0.0.1:12321/Dtm_Api/DtmCardGetDataStrEx');
      const ICCardIDResult = await ICCardIDRes.json();
      if (_get(ICCardIDResult, 'return', '') === 0) {
        return _get(ICCardIDResult, 'data', '');
      }
    } else if (_get(readICCardIDResult, 'return', '') === 1) {
      message.error('未检测到IC卡');
      return false;
    } else if (_get(readICCardIDResult, 'return', '') === 3) {
      message.error('无效卡');
      return false;
    }
  } else {
    message.error('未检测到IC卡');
    return false;
  }

  return '';
}

function checkStatus(response: any) {
  const status = _get(response, 'status');
  if ((status >= 200 && status < 300) || status === 304) {
    return response;
  }
  throw new Error('');
}

function parseJSON(response: any) {
  return response.json();
}

export async function _request(url: string, signal?: null) {
  return fetch(url, {
    signal,
  })
    .then(checkStatus)
    .then(parseJSON)
    .catch((error) => {
      return { result: false, error };
    });
}

export async function getCardID(callback: any) {
  let data: any = '';
  /*打开设备 */
  // const openResult = await openDevice();
  // if (_get(openResult, 'return', '') === 0) {
  //   /*秘钥验证 */
  //   const pwdResult = await keyVerify();
  //   if (_get(pwdResult, 'return', '') === 0) {
  const ICCardInfoFunc = await getICCardInfo();
  const ICCardIDFunc = await getICCardID();
  await Promise.all([ICCardInfoFunc, ICCardIDFunc])
    .then((result) => {
      data = result;
    })
    .catch((error) => {
      message.error(error);
    });
  // }
  // } else {
  //   data = false;
  // }
  return callback(data);
}

/*关闭端口*/
export async function closePort() {
  return await _request('http://127.0.0.1:12321/WlSdt_api/ClosePort?Port=1001');
}

/*开启端口*/
export async function startPort() {
  return await _request('http://127.0.0.1:12321/WlSdt_api/OpenPort?Port=1001');
}

/*获取版本号*/
export async function getSamid() {
  return await _request('http://127.0.0.1:12321/WlSdt_api/GetSAMID?Port=1001');
}

/*读取身份证信息*/
export async function getIdCardInfo() {
  await startPort();
  const res = await _request('http://127.0.0.1:12321/WlSdt_api/ReadBaseMsg?Port=1001&ReadType=0');
  // await closePort();
  return res;
}

/*读取身份证流程 */
export async function getIdCard() {
  const closeResult = await closePort();
  //第一步：关闭端口号
  if (_get(closeResult, 'return', '') === 144) {
    //第二步：获取版本号
    const getResult = await getSamid();
    if (_get(getResult, 'return', '') === 144) {
      return await getIdCardInfo();
    }
  }
  return false;
}

/*读取身份证物理卡号*/
export async function getIdCardId() {
  // await startPort();
  const res = await _request('http://127.0.0.1:12321/WlSdt_api/GetCardNo?Port=1001');
  await closePort();
  return res;
}

/*读取身份证照片*/
export async function getIdCardImg() {
  // await startPort();
  const res = await _request('http://127.0.0.1:12321/WlSdt_api/ReadBaseMsg?Port=1001&ReadType=1');
  await closePort();
  return res;
}

/*用于返回 模块名字，如果返回字符串为空，证明 UKey 未插 或者松动， 或者 驱动未安装 */
export async function _getReaderName() {
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/GetReaderName');
  return res;
}
/*返回 UKey的序号，用于 驾校编号 和 UKey 序号 对应  绑定关系使用*/
export async function _getSerialNumber() {
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/GetSerialNum');
  return res;
}

/*pin码校验*/
export async function _checkPassword(query: { PassWord: string }) {
  const { PassWord } = query;
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/CheckPassword?PassWord=' + PassWord);
  return res;
}

/*读签章*/
export async function _readSignature() {
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/ReadSignature');
  return res;
}

/*加签 */
export async function _doSign(query: { Content: string; len: string; PassWord: string }) {
  const { Content, len, PassWord } = query;
  const res = await _request(
    `http://127.0.0.1:12321/WlUsbKey_Api/DOSIGN?Content=${Content}&len=${len}&PassWord=${PassWord}`,
  );
  return res;
}

/*读证书*/
export async function _readCertificate() {
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/ReadCertificate');
  return res;
}

/*读证书的口令*/
export async function _readCertPassword() {
  const res = await _request('http://127.0.0.1:12321/WlUsbKey_Api/ReadCertPassword');
  return res;
}

/*打开汉王设备*/
export async function _openHanDev() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/OpenDev');
  return res;
}

/*初始化设备*/
export async function _initHanDev() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/InitDev');
  return res;
}

/*关闭设备*/
export async function _closeHanDev() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/CloseDev');
  return res;
}

/*获取签名图片*/
export async function _getSign() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/GetSign');
  return res;
}

/*清空签名图片*/
export async function _clearDev() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/ClearDev');
  return res;
}

/*关闭处理进程*/
export async function _quitHWProc() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/QuitHWProc');
  return res;
}

/*签字确认*/
export async function _getConfirm() {
  const res = await _request('http://127.0.0.1:12321/Hanvon_Api/GetConfirm');
  return res;
}

//连接制卡机
export async function _connectDevice(signal?: any) {
  const res = await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardCommOpen?CardPort=100&DevicePort=0', signal);
  return res;
}

//采集指纹
export async function _fingerprintCollection(signal?: any) {
  const res = await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardCommandEx?Command=12804&Data=0', signal);
  return res;
}

//获取指纹模板
export async function _getFingerprint(signal?: any) {
  const res = await _request('http://127.0.0.1:12321/Dtm_Api/DtmCardGetDataStrEx', signal);
  return res;
}

//硬件返回插件版本信息
export async function _getVersionFromDevice() {
  const res = await _request('http://127.0.0.1:12321/Local/GetVersion');
  return res;
}

//返回系统插件版本信息
//http://192.168.192.132:3000/project/193/interface/api/24370
export async function _getPluginVersionFromConfig() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getPluginVersionInfo`, 'GET');
}
function compareVersion(v1: any, v2: any) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);

  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

//是否强制升级
export async function isForceUpdatePlugin() {
  const resConfig = await _getPluginVersionFromConfig(); //从系统后台配置取的版本号
  const webPluginMustUpdate = _get(resConfig, 'data.webPluginMustUpdate', '0') === '1';

  let timeoutPromise = (timeout: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('timeout');
      }, timeout);
    });
  };
  return Promise.race([timeoutPromise(2000), _getVersionFromDevice()])
    .then((res) => {
      if (res === 'timeout') {
        //插件没有获取版本的功能时，不用强制升级
        return false;
      } else {
        const versionConfig = _get(resConfig, 'data.webPluginVersion', '');
        const versionDevice = _get(res, 'Version', '');
        const isUpdate = versionDevice !== '' && compareVersion(versionConfig, versionDevice) === 1;
        return webPluginMustUpdate && isUpdate;
      }
    })
    .catch((error) => {
      return false;
    });
}

//机器人教练版本
export async function _getRobotCoachVersion() {
  const res = await _request('http://127.0.0.1:23432/RobotCoach/GetServerInfo');
  return res;
}

//远程刹车
export async function _carControl(query: {
  CarLicence: string; // 车牌号
  FootBrake: number; // 刹车状态：0--远程释放，1--远程刹车
}) {
  const res = await _request(
    `http://127.0.0.1:23432/RobotCoach/CarControl?CarLicence=${query.CarLicence}&FootBrake=${query.FootBrake}`,
  );
  return res;
}

//单车定位数据查询 查找指定车辆的位置信息和信号
export async function _getCarInfo(query: {
  CarLicence: string;
  CarStatus: string; //车辆IO状态：0 - 不读取IO状态 1 - 读取IO状态
}) {
  const res = await _request(
    `http://127.0.0.1:23432/RobotCoach/GetCarInfo?CarLicence=${query.CarLicence}&CarStatus=${query.CarStatus}`,
  );
  return res;
}

//车辆对讲请求
export async function _getTalkbackRequest() {
  const res = await _request('http://127.0.0.1:23432/RobotCoach/TalkbackRequest');
  return res;
}

//车辆对讲取消
export async function _cancelTalkbackRequest(query: { CarLicence: string }) {
  const res = await _request(`http://127.0.0.1:23432/RobotCoach/TalkbackCancel?CarLicence=${query.CarLicence}`);
  return res;
}

//语音信息下发
export async function _sendTalkbackResponse(query: {
  CarLicence: string;
  VoiceData: string; //语音内容
}) {
  const res = await _request(
    `http://127.0.0.1:23432/RobotCoach/TalkbackResponse?CarLicence=${query.CarLicence}&VoiceData=${query.VoiceData}`,
  );
  return res;
}

//多车定位数据查询 查询指定车辆列表的最新车辆信息
export async function _getCarsPosition(query: {
  CarLicence: string;
  Forceget: string; //Forceget  是否获取所有车辆位置信息：0 - 返回内存最新的且有更新的位置信息 1 - 强制获取所有车辆的位置信息
}) {
  const res = await _request(
    `http://127.0.0.1:23432/RobotCoach/GetCarsPosition?Forceget=${query.Forceget}&Carlicences=${query.CarLicence}`,
  );
  return res;
}

//多车状态信息查询 ：在线离线
export async function _getCarStatus(query: { CarLicence: string }) {
  const res = await _request(`http://127.0.0.1:23432/RobotCoach/GetCarInfo?Carlicences=${query.CarLicence}`);
  return res;
}

//车辆视频预览 指定某一辆车辆，发起视频监控请求。
// CarLicence 车牌号码
// videoPara 视频取流相关信息
// status 启用或者关闭预览，启用预览则为：enable，关闭预览则为disable
// mode 视频设备取流模式,默认为rtsp
// ip 视频设备地址
// user 视频设备登录用户
// code 视频设备登录密码
// channel 视频设备取流通道号 >=1
// eg:http://127.0.0.1:23432/RobotCoach/VideoViewCar?Carlicences=%E6%B5%99A1234&VideoPara=enable,rtsp,172.16.8.250,admin,Well12345,101
export async function _getVideoViewCar(query: {
  CarLicence: string;
  status: string;
  mode: string;
  ip: string;
  user: string;
  code: string;
  channel: string;
}) {
  const res = await _request(
    `http://127.0.0.1:23432/RobotCoach/VideoViewCar?Carlicences=${query.CarLicence}&status=${query.status}&mode=${query.mode}&ip=${query.ip}&user=${query.user}&code=${query.code}&channel=${query.channel}`,
  );
  return res;
}

//应用信息获取
export async function _getServerInfo() {
  const res = await _request(`http://127.0.0.1:23432/RobotCoach/GetServerInfo`);
  return res;
}
