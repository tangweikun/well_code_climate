import { request } from 'services';
import { USER_CENTER_PREFIX } from 'constants/env';

// 修改密码
// http://192.168.192.132:3000/project/218/interface/api/19855
export async function _updatePassword(query: {
  id: string; // 用户ID
  oldPassword: string; // 原密码
  newPassword: string; // 新密码
}) {
  return await request(`${USER_CENTER_PREFIX}/user/password/set`, 'POST', query, { withFeedback: true });
}

//查询驾校列表
//http://192.168.192.132:3000/project/198/interface/api/20611
export async function _getSchoolList(query: {
  page?: string;
  limit?: string;
  name?: string; //名称
  leaderPhone?: string; //电话
  provinceCode?: string; //省
  cityCode?: string; //市
  areaCode?: string; //区县
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/pageByUserBinded`, 'GET', query);
}

//切换驾校
//http://192.168.192.132:3000/project/198/interface/api/20534
export async function _changeSchool(query: any) {
  const { id } = query;
  return await request(`${USER_CENTER_PREFIX}/user/${id}/company/default`, 'PUT');
}
