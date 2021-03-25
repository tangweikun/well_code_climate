import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 初审管理-分页展示报审信息列表
// http://192.168.192.132:3000/project/193/interface/api/14402
export async function _getFinalAssess(query: {
  page: number;
  limit: number;
  subject?: string; // 报审类型 培训科目/部分/阶段(1-科目一 2-科目二 3-科目三 4- 科目四   5-组合报审   9-结业上报
  sid?: string; // 学员表主键
  isapply?: string; // 报审状态 0: 待提交（申请准备）   1：已提交（提交上报）  2：通过（同意）  3： 不通过（拒绝）  4：撤销
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/pageList`, 'GET', query);
}

//  阶段报审详情
// http://192.168.192.132:3000/project/193/interface/api/14416
export async function _getDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/selectByKey`, 'GET', query);
}

//  注销报审申请记录
// http://192.168.192.132:3000/project/193/interface/api/14423
export async function _cancelFinalAssess(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/cancel/${query.id}`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn2' },
  });
}

// 结业/阶段申请提交信息回调接口
// http://192.168.192.132:3000/project/193/interface/api/17076
export async function _updateStuIsApply(query: { id: string }, withFeedback: any = true) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/upload/${query.id}`, 'PUT', query, {
    withFeedback,
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn4' },
  });
}

// 科目申请-满足科目报审条件的学员记录信息
// http://192.168.192.132:3000/project/193/interface/api/14437
export async function _getStudent(query: {
  page: number;
  limit: number;
  subject?: string; // 报审类型 培训科目/部分/阶段(1-科目一 2-科目二 3-科目三 4- 科目四   5-组合报审   9-结业上报
  sid?: string; // 学员表主键
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApplyPrestep/pageList`, 'GET', query);
}

// 新增阶段报审申请/结业报审申请
// http://192.168.192.132:3000/project/193/interface/api/14409
export async function _addReview(query: {
  applyPrestepId: string; // 学员报审申请前置表主键
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/save`, 'POST', query, {
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn1' },
  });
}

// 查看监管审核结果
// http://192.168.192.132:3000/project/193/interface/api/19099
export async function _getResult(query: { id: string }) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/stageTrainningTimeReview/${query.id}`,
    'PUT',
    {},
    {
      customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn3' },
    },
  );
}

// 查看阶段培训记录表
export async function _getReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/report/${query.id}`, 'GET');
}

//科目上报的方式 1:ukey盖章 0：传统方式不用ukey
//http://192.168.192.132:3000/project/193/interface/api/22074
export async function _getReportType(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/getStageUploadType/${query.id}`, 'GET');
}

//获取Ukey签字所需的报文原始数据
//http://192.168.192.132:3000/project/193/interface/api/22060
export async function _getUKeyData(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/getStageDataForSignature/${query.id}`, 'GET');
}

//Ueky盖章与签字内容提交报审
//http://192.168.192.132:3000/project/193/interface/api/22067
export async function _uploadByKeyAndSignature(query: { id: string; fileId: string; signatureData: string }) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/uploadByKeyAndSignature/${query.id}`,
    'PUT',
    {
      fileId: query.fileId,
      signatureData: query.signatureData,
    },
    {
      withFeedback: true,
    },
  );
}

// 导出阶段报审Excel
// http://192.168.192.132:3000/project/193/interface/api/22669
export async function _export(query: {
  sdate: string; // 初审开始时间 YYYY-MM-DD
  edate: string; // 初审截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 导出阶段报审Excel查询
// http://192.168.192.132:3000/project/183/interface/api/23523
export async function _exportStageApplyBefore(query: {
  sdate: string; // 初审开始时间 YYYY-MM-DD
  edate: string; // 初审截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/exportStageApplyBefore`, 'GET', query);
}

//学员报审科目签名提交
//http://192.168.192.132:3000/project/193/interface/api/17979
export async function _submitSignature(query: {
  sid: string;
  said: string; //报审科目记录编码
  fileid: string; //学员签字文件编码
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/submitStuSignature`, 'PUT', query, {
    withFeedback: true,
  });
}
