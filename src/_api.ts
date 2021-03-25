import { request } from 'services';

// 查询树形菜单列表
// http://192.168.192.132:3000/project/98/interface/api/4301
export async function _getMenuTree() {
  return request(`/api/usercenter/menu/tree?category=ERP`, 'GET');
}

// 获取登录用户信息（基本信息，菜单，元素资源）
// http://192.168.192.132:3000/project/98/interface/api/3076
export async function _getUserInfo() {
  return request(`/api/usercenter/user/front/info?category=ERP`, 'GET');
}
