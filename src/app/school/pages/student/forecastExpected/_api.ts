// import { request } from 'services/mock';
import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//http://192.168.192.132:3000/project/193/interface/api/24440
//新增受理学员信息
export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/pageList`, 'GET', query);
}

//http://192.168.192.132:3000/project/193/interface/api/24454
// 转正受理学员为正式学员
export async function _confirmStudent(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/saveStudent/${query.id}`, 'POST', query, {
    withFeedback: true,
  });
}
