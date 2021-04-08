import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 监控列表
// http://192.168.192.132:3000/project/183/interface/api/24916
export async function _getCarList() {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/listMonitor`, 'GET');
}
