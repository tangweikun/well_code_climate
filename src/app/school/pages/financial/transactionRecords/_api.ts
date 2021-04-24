import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询交易记录列表
// http://192.168.192.132:3000/project/193/interface/api/18910
export async function _getInfo(query: {
  page: number;
  limit: number;
  resourceId?: string; // 所属系统
  payFactory?: string; // 开户渠道,pa_bank,yl_bank
  payFlowId?: string; // 平台交易单号
  tradeNo?: string; // 银行交易单号
  orderId?: string; // 订单号
  settleAccountId?: string; // 付款账号，结算账号
  payEEAccount?: string; //收账账号
  transType?: string; //交易类型
  status?: string; //交易状态
  comType?: string; //入账方式，2入账 12补账
  startDate?: string; //开始时间
  endDate?: string; //结束时间
  // shopId: string;//驾校ID
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/transRecords/pageList`, 'GET', query);
}
