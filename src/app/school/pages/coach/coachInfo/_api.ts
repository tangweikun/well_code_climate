import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 查询教练信息列表
// http://192.168.192.132:3000/project/183/interface/api/14850
export async function _getInfo(query: {
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
  page: number;
  limit: number;
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredFlag?: string; // 教练员监管平台备案标记-  0 :未备案，1: 已备案
  employstatus?: string; // 教练员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageList`, 'GET', query);
}

// 根据主键获取教练详情信息
// http://192.168.192.132:3000/project/183/interface/api/14864
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/selectByKey`, 'GET', query);
}

// 教练员信息监管删除
// http://192.168.192.132:3000/project/183/interface/api/18791
export async function _deleteInfo(query: {
  cid: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/disableByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn3' },
  });
}

// 新增教练信息
// http://192.168.192.132:3000/project/183/interface/api/16516
export async function _addInfo(query: {
  coachname: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  idcard: string; // 身份证件号码
  mobile: string; // 手机号码
  address?: string; // 联系地址
  drilicence: string; // 驾驶证号
  fstdrilicdate: string; // 驾驶证初领日期YYYY-MM-DD
  dripermitted: string; // 准驾车型,编码单选
  occupationno?: string; // 职业资格证号/教练证号
  occupationlevel?: string; // 职业资格等级
  teachpermitted: string; // 准教车型,编码单选
  employstatusKhy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  coachtype?: string; // 教练员类型(1-理论教练员 2-驾驶教练员 3-理论/驾驶教练员 4-客货 5-危险品)
  headImgUrl?: string; // 教练员头像图片
  iscoach: number; // 是否教练(0-否 1-是)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn6' },
  });
}

// 编辑教练信息
// http://192.168.192.132:3000/project/183/interface/api/16523
export async function _updateInfo(query: {
  coachname: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  idcard: string; // 身份证件号码
  mobile: string; // 手机号码
  address?: string; // 联系地址
  drilicence: string; // 驾驶证号
  fstdrilicdate: string; // 驾驶证初领日期YYYY-MM-DD
  dripermitted: string; // 准驾车型,编码单选
  occupationno?: string; // 职业资格证号/教练证号
  occupationlevel?: string; // 职业资格等级
  teachpermitted: string; // 准教车型,编码单选
  employstatusKhy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  coachtype?: string; // 教练员类型(1-理论教练员 2-驾驶教练员 3-理论/驾驶教练员 4-客货 5-危险品)
  headImgUrl?: string; // 教练员头像图片
  head_img_oss_id: string; // 图片id
  iscoach: number; // 是否教练(0-否 1-是)
  cid: string; // 主键
  isChange: string; // 编辑时必传基本信息是否变更0：未变更1：变更
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn2' },
  });
}

// 备案-教练员信息备案
// http://192.168.192.132:3000/project/183/interface/api/17181
export async function _record(query: {
  id: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/recordCoach`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn4' },
  });
}

//绑定二代证
//http://192.168.192.132:3000/project/183/interface/api/16572
export async function _bindCard(
  query: {
    cid: string;
    type: string; // 查询类型1：教练员2：考核员3：安全员
    certCardNum: string; //身份证卡号
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateIdCardCode`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

// 注销人员接口
// http://192.168.192.132:3000/project/183/interface/api/20296
export async function _logoutPerson(query: {
  cid: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/disableByKey`, 'PUT', query, {
    withFeedback: true,
  });
}

// 变更教练员、考核员、安全员供职状态
// http://192.168.192.132:3000/project/183/interface/api/20933
export async function _changeStatus(
  query: {
    cid: string;
    type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
    status: string;
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateCoaEmploystatus`, 'PUT', query, {
    withFeedback: true,
    customHeader,
  });
}

// 查询车辆列表下拉框
// http://192.168.192.132:3000/project/183/interface/api/20919
export async function _getCarList(query: { licnum?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/listCar`, 'GET', query);
}

// 查询教练员、考核员、安全员审核结果
// http://192.168.192.132:3000/project/183/interface/api/23761
export async function _getResult(query: {
  id: string; // 人员id
}) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/coa/recordCoachReview`,
    'GET',
    { ...query, type: '1' }, //人员类型1:教练员2：考核员3：安全员
    { withFeedback: true },
  );
}

//变更身份认证关闭标志 免签
//http://192.168.192.132:3000/project/183/interface/api/23978
export async function _updateCoaIdauth(query: {
  cid: string;
  idauthclosed: string; //身份认证关闭标志(免签)  0-开启, 1-关闭
  idauthcloseddeadline: string; //身份认证关闭标志（免签）截止日期 YYYY-MM-DD
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateCoaIdauth`, 'PUT', query, {
    withFeedback: true,
  });
}
