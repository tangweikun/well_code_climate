import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询结算记录列表
// http://192.168.192.132:3000/project/193/interface/api/18707
export async function _getInfo(query: {
  currentPage: number;
  pageSize: number;
  studentName?: string; // 学员名字
  idNumber?: string;
  payFlowId?: string; // 交易流水号
  settleType?: string; // 结算类型，清查数据字典
  status?: string; // 结算状态   0：待结算 1、结算中，2、已结算，3、结算异常
  studentBankAccount?: string; //学员电子账户
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/page`, 'GET', query);
}

// 获取结算金额
// http://192.168.192.132:3000/project/193/interface/api/18721
export async function _getTotalMoney(query: { studentId?: any }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/statistic`, 'GET', query);
}
