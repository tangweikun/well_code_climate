import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询学员信息列表
// http://192.168.192.132:3000/project/193/interface/api/12722
export async function _getStudentTableList(query: {
  name?: string; // 姓名
  idcard?: string; // 证件号
  trainTimeApplyTimeBegin?: string; // 申报申请日期开始 yyyy-MM-dd
  trainTimeApplyTimeEnd?: string; // 申报申请日期结束 yyyy-MM-dd
  trainTimeApplyStatus?: string; // 转入学员申报状态   0-待申请  ；1-待审核   2-审核通过  3-审核未通过
}) {
  return await request(`${CORE_PREFIX}/v1/student/pageList`, 'GET', query);
}

// 获取学时审核详情
// http://192.168.192.132:3000/project/193/interface/api/24657
export async function _getStudyDetail(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/detail`, 'GET', query);
}

// 提交申报
// http://192.168.192.132:3000/project/193/interface/api/24685
export async function _submit(query: {}) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/submit`, 'POST', query, {
    withFeedback: true,
  });
}

// 编辑申报
// http://192.168.192.132:3000/project/193/interface/api/24685
export async function _editSubmit(query: {}) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/edit`, 'POST', query, {
    withFeedback: true,
  });
}

// 获取审核结果
// http://192.168.192.132:3000/project/193/interface/api/24671
export async function _getApplyResult(query: { sid: any }) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/getApplyResult`, 'GET', query);
}
