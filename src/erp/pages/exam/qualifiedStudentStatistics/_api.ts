import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';
interface IGetTestResultStatisticParams {
  cid?: string;
  endDate?: string;
  period: string;
  startDate?: string;
  testSubject?: string;
}
interface IGetTestResultListParams {
  cid?: string;
  endDate?: string;
  period: string;
  startDate?: string;
  testSubject?: string;
  page: string;
  limit: string;
}

//考出成绩统计
//http://192.168.192.132:3000/project/223/interface/api/21479
export async function _getTestResultStatistic(query: IGetTestResultStatisticParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/success/count`, 'GET', query);
}
//考出记录分页
//http://192.168.192.132:3000/project/223/interface/api/21486
export async function _getTestResultList(query: IGetTestResultListParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/success/list`, 'GET', query);
}
