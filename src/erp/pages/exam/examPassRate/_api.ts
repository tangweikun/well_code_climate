import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

interface IExamPassRateCoachParams extends IPaginationParams {
  period: string;
}

interface IExamPassRateAgeCarTypeParams extends IPaginationParams {
  period: string;
}

//按教练
//http://192.168.192.132:3000/project/223/interface/api/21612
export async function _examPassRateCoach(query: IExamPassRateCoachParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/passRate/byCoach`, 'GET', query);
}

//按年龄
//http://192.168.192.132:3000/project/223/interface/api/21598
export async function _examPassRateAge(query: IExamPassRateAgeCarTypeParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/passRate/byAge`, 'GET', query);
}

//按车型
//http://192.168.192.132:3000/project/223/interface/api/21605
export async function _examPassRateCarType(query: IExamPassRateAgeCarTypeParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/passRate/byCarType`, 'GET', query);
}
