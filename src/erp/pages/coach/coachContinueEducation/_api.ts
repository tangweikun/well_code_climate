import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 分页展示信息列表
// http://192.168.192.132:3000/project/183/interface/api/16586
export async function _getInfo(query: {
  page: number;
  limit: number;
  starttime?: string; // 继续教育时间起
  endtime?: string; // 继续教育时间止
  coachname?: string; // 教练员姓名
  idcard?: string; // 证件号码
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaContinueedu/pageList`, 'GET', query);
}

//增加继续教育
//http://192.168.192.132:3000/project/183/interface/api/16593
export async function _addContinueEdu(query: {
  // id:any,//id
  cid: string; // 教练员编码
  coachname?: string; // 教练员姓名
  edudept?: string; // 本期培训单位
  remark?: string; // 备注
  starttime: string; // 继续教育开始日期
  endtime: string; // 继续教育结束日期
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaContinueedu/save`, 'POST', query, { withFeedback: true });
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getFinalAssess(query: { schoolId?: number; coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}
