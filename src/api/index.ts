import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX, USER_CENTER_PREFIX } from 'constants/env';
import { Auth, _get } from 'utils';

// 查询字典列表
// http://192.168.192.132:3000/project/193/interface/api/17307
interface IGetCode {
  codeType?: string;
  codeKey?: string;
  parentCodeKey?: string;
  pauseRequest?: boolean;
}

export async function _getCode(query: IGetCode) {
  const { pauseRequest, ...params } = query;
  if (pauseRequest) return;
  return await request(`${CORE_PREFIX}/v1/sysbase/code/get2`, 'GET', params);
}

// 获取驾校车型经营范围
// http://192.168.192.132:3000/project/193/interface/api/18343
export async function _getBusinessScope() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeCombo`, 'GET');
}

// 获取驾校报审 科目列表 combo
// http://192.168.192.132:3000/project/193/interface/api/19764
export async function _getSubjectApply() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolSubjectApplyCombo`, 'GET');
}

// 获取驾校阶段 核实状态 combo
// http://192.168.192.132:3000/project/193/interface/api/19771
export async function _getApplyStatus() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSubjectApplyStatusCombo`, 'GET');
}

// 查看学员列表
// http://192.168.192.132:3000/project/193/interface/api/14143
export async function _getStudentList(query: { name?: string; idcard?: string; status?: string; stuschoolid?: any }) {
  // 搜索条件name小于2位时不发起请求
  if (!_get(query, 'idcard', '') && _get(query, 'name.length', 0) < 2) {
    return;
  }
  //证件号小于5位不发起请求
  if (!_get(query, 'name', '') && _get(query, 'idcard.length', 0) < 5) {
    return;
  }

  return await request(`${CORE_PREFIX}/v1/student/selectByNameOrIdCard`, 'GET', {
    stuschoolid: Auth.get('schoolId'),
    ...query,
    page: 1,
    limit: 10,
  });
}

// 获取驾校可训课程范围combo
// http://192.168.192.132:3000/project/193/interface/api/21080
export async function _getCourse() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolTrainClassCombo`, 'GET');
}

//查询所有关联主驾校（含当前驾校）
export async function _getSchoolList() {
  return await request(`${USER_CENTER_PREFIX}/v1/company/listAllMainCompany`, 'GET');
}

//查询营业网点绑定机构的下拉框接口，营业网点所属驾校+营业网点已绑驾
//http://192.168.192.132:3000/project/183/interface/api/21416
export async function _getSchoolCombo(query: { sbnid: any; traincode: any }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getSchoolsByNetwork`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string; idcard?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}

//上传图片
export async function _uploadImg(query: any) {
  return request(`/api/video-face/tmpFile/upload`, 'POST', query, {
    customHeader: { 'Content-Type': 'multipart/form-data' },
  });
}

// 查询教练员、考核员、安全员审核结果
// http://192.168.192.132:3000/project/183/interface/api/23761
export async function _getCoachExamineResult(query: {
  id: string; // 人员id
}) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/coa/recordCoachReview`,
    'GET',
    { type: '1', ...query }, //人员类型1:教练员2：考核员3：安全员
    { withFeedback: true },
  );
}

// 基于驾校经营范围获取业务类型
// http://192.168.192.132:3000/project/193/interface/api/23985
export async function _getBusinessType() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiTypeCombo`, 'GET');
}

// 查询教学信息
// http://192.168.192.132:3000/project/198/interface/api/17692
export async function _getTeachInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/teachInfo`, 'GET', query);
}

// 查询基础信息
// http://192.168.192.132:3000/project/198/interface/api/17608
export async function _getBaseInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/basicInfo`, 'GET', query);
}
