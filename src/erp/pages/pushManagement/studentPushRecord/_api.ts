import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//车学堂同步状态查询
//http://192.168.192.132:3000/project/193/interface/api/20849
export async function _getInfo(query: { page: number; limit: number }) {
  return await request(`${CORE_PREFIX}/v1/student/syncStatus`, 'GET', query);
}

//车学堂推送学员
//http://192.168.192.132:3000/project/193/interface/api/20856
export async function _sendSync(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/sendSync`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'pushManagement/studentPushRecord', elementId: 'pushManagement/studentPushRecord:btn1' },
  });
}
