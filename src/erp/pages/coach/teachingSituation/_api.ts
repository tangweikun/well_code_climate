import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/17265
export async function _getFinalAssess(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageList`, 'GET', query);
}
