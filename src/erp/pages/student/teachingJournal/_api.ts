import { request } from 'services';
import { NOT_CORE_PREFIX, CORE_PREFIX } from 'constants/env';

// 电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/17265
export async function _getFinalAssess(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageList`, 'GET', query);
}

// 电子教学日志详情
// http://192.168.192.132:3000/project/183/interface/api/17244
export async function _getDetails(query: { classid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getClassrecord`, 'GET', query);
}

// 分钟学时分页列表
// http://192.168.192.132:3000/project/183/interface/api/17279
export async function _getMinutes(query: {
  classid: string; // 电子教学日志id
  page: number;
  limit: number;
  signstarttime: string; // 签到开始时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/pageListTrainingTimeMin`, 'GET', query);
}

// 批量设置分钟学时为有效、无效
// http://192.168.192.132:3000/project/183/interface/api/11875
export async function _setMinState(
  query: {
    classid: string; // 电子教学日志主键
    crstate: string; // 有效还是无效
    msg_jx?: string; // 驾校侧说明（审核未通过原因
    signstarttime: string; // 签到时间
    subjectcode: string; // 培训部分
    trainids: string; // 分钟学时id，多个id以逗号分隔
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/batchSetupTrainingTimeMinState`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

// 获取培训照片详情
// http://192.168.192.132:3000/project/183/interface/api/18091
export async function _getTrainingPhotosDetail(query: {
  classid: string; // 电子教学日志id
  photoTypes?: string;
  signstarttime: string; // 签到开始时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/getTrainingPhotosDetail`, 'GET', query);
}

// 电子教学日志上传
// http://192.168.192.132:3000/project/183/interface/api/18861
export async function _uploadLog(
  query: {
    classid: string; // 电子教学日志ID
    year: string; // 电子教学日志所属年份
  },
  withFeedback: any = true,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/report`, 'POST', query, { withFeedback });
}

// 批量电子教学日志上传
// http://192.168.192.132:3000/project/183/interface/api/21017
export async function _uploadLogArr(query: {
  classids: any; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/batchReport`, 'POST', query, { withFeedback: true });
}

// 设置电子教学日志有效无效-详情总审核
// http://192.168.192.132:3000/project/183/interface/api/11868
export async function _reviewLog(query: {
  classids: string; // 电子教学日志主键(因为改成支持多条，所有后端改成classids)
  crstate?: string; // 有效无效，1：有效；3：无效(整体无效)
  msg_jx?: string; // 驾校侧初审说明，无效时需提供此字段
  signstarttime: string; // 签到时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/setupClassrecordState`, 'POST', query, {
    withFeedback: true,
  });
}

// 获取车辆轨迹
// http://192.168.192.132:3000/project/183/interface/api/17258
export async function _getVehicleTrajectory(query: {
  carid: string; // 教练车id
  signstarttime: string; // 签到开始时间
  signendtime: string; // 签到结束时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getVehicleTrajectory`, 'GET', query);
}

//电子教学日志分页列表（所有）
//http://192.168.192.132:3000/project/183/interface/api/20135
export async function _getFinalAssessAll(query: { page: number; limit: number; stuid: string; subjectcode: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageListAll`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string; idcard?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}

// 查询车辆列表下拉框
// http://192.168.192.132:3000/project/183/interface/api/20919
export async function _getCarList(query: { licnum?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/listCar`, 'GET', query);
}

// 待上传电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/21318
export async function _getWaitUpload(query: { signstarttime_start?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageListClassrecordCanBeUploaded`, 'GET', query);
}

//http://192.168.192.132:3000/project/193/interface/api/22613
//查询审核结果
export async function _getResult(query: { is?: string; sid?: string; subject?: string }) {
  return await request(`${CORE_PREFIX}/v1/stuClassrecord/query/result`, 'GET', query);
}
