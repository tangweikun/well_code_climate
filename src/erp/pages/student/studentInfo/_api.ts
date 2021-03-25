import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX, DATA_EXCHANGE_PREFIX } from 'constants/env';

// 查询学员信息列表
// http://192.168.192.132:3000/project/193/interface/api/12722
export async function _getStudentInfo(query: {
  page: number;
  limit: number;
  name?: string; // 学员姓名或拼音码
  idcard?: string; // 身份证件号码
  registered_Flag?: string; // 监管平台备案标记-  0 :未备案，1: 已备案
  status?: string; // 学员状态(00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 99-归档)
  traintype?: string; // 培训车型   编码单选C1/C2等
  busitype?: string; // 业务类型 0:初领 1:增领 9:其他
  contractflag?: string; // 合同签订标志 0 未签订  1已签订
  applydatebegin?: string; // 报名起始日期
  applydateend?: string; // 报名结束日期
}) {
  return await request(`${CORE_PREFIX}/v1/student/pageList`, 'GET', query);
}

// 查询学员详细信息
// http://192.168.192.132:3000/project/193/interface/api/12736
export async function _getDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/selectByKey`, 'GET', query);
}

// 查看详情-预报名审核
// http://192.168.192.132:3000/project/193/interface/api/12638
export async function _getReviewDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/selectByKey`, 'GET', query);
}

// 注销学员
// http://192.168.192.132:3000/project/193/interface/api/16362
export async function _deleteStudent(query: { id: string }) {
  return await request(
    `${CORE_PREFIX}/v1/student/update/${query.id}`,
    'PUT',
    {},
    { customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn4' } },
  );
}

// 新增学员信息
// http://192.168.192.132:3000/project/193/interface/api/16292
export async function _addStudent(query: {
  name: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  cardtype: string; // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  idcard: string; // 身份证件号码
  nationality: string; // 国籍(应符合GB/T2659)
  phone: string; // 手机号码
  address: string; // 联系地址
  head_img_oss_id: string; // 学员头像图片
  busitype: string; // 业务类型 0:初领 1:增领 9:其他
  drilicnum?: string; // 驾驶证号
  fstdrilicdate?: string; // 驾驶证初领日期YYYY-MM-DD
  perdritype?: string; // 原准驾车型，编码单选C1/C2等
  traintype?: string; // 培训车型   编码单选C1/C2等
  applydate: string; // 报名日期    YYYY-MM-DD
  schoolid: any;
}) {
  return await request(`${CORE_PREFIX}/v1/student/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn1' },
  });
}

// 编辑学员信息
// http://192.168.192.132:3000/project/193/interface/api/16306
export async function _updateStudent(query: {
  name: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  cardtype: string; // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  idcard: string; // 身份证件号码
  nationality: string; // 国籍(应符合GB/T2659)
  phone: string; // 手机号码
  address: string; // 联系地址
  head_img_oss_id: string; // 学员头像图片
  busitype: string; // 业务类型 0:初领 1:增领 9:其他
  drilicnum?: string; // 驾驶证号
  fstdrilicdate?: string; // 驾驶证初领日期YYYY-MM-DD
  perdritype?: string; // 原准驾车型，编码单选C1/C2等
  traintype?: string; // 培训车型   编码单选C1/C2等
  applydate: string; // 报名日期    YYYY-MM-DD
  sid: string; // 学员主键
  fileType?: string; // 业务类型 驾校 schoolregister 学员 studentregister 教练 coachregister   车辆 carregister 学员人脸 studentface  教练人脸coachface 考核员注册 examinemanregister   安全员注册 securemanregister   二维码 Qrcode
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn3' },
  });
}

// 学员绑定培训机构-转校
// http://192.168.192.132:3000/project/193/interface/api/12764
export async function _changeSchool(query: { sid: string; schoolid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/updateSchool`, 'PUT', query);
}

// 绑定二代证
// http://192.168.192.132:3000/project/193/interface/api/12750
export async function _bindCard(query: {
  sid: string;
  iccardcode?: string; // IC卡号
  userid: any; //用户中心主键
  realName?: string; //真实姓名
  certNum: string; //身份证号
  certCardNum: string; //身份证卡号
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateIdCadeCode`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn7' },
  });
}

// 查询班级列表 分页展示班级信息
// http://192.168.192.132:3000/project/183/interface/api/14234
export async function _getClassList(query: {
  page: number;
  limit: number;
  packlabel?: string; // 班级名称
  traintype?: string; // 培训车型 编码单选C1/C2等
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/pageList`, 'GET', query);
}

// 查询教练员列表--下拉框
// http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', {
    ...query,
    registered_Flag: '2',
    employstatus: '01',
  });
}

// C1转C2车型
// http://192.168.192.132:3000/project/193/interface/api/19785
export async function _transformCarType(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/${query.id}/changeCarType`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn8' },
  });
}

// registered-(备案)
// http://192.168.192.132:3000/project/193/interface/api/19673
export async function _registered(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/registered`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn6' },
  });
}

// 驾校侧可编辑的合同数据项
// http://192.168.192.132:3000/project/193/interface/api/18749
export async function _getSchContractTemp(query: { sid: any }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/getSchContractTemp`, 'GET', query);
}

// 生成学员合同模板
// http://192.168.192.132:3000/project/193/interface/api/18777
export async function _stuSignContract(query: {
  sid: string;
  cartype: string; //经营车型,C1,C2
  tempid: any;
  schContractTempitemList: any;
  memo?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/save`, 'POST', query, {
    withFailedFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn5' },
  });
}

// 学员合同生成过程中的模板预览
// http://192.168.192.132:3000/project/193/interface/api/18756
export async function _previewContract(query: {
  sid: string;
  cartype: string; //经营车型,C1,C2
  tempid: any;
  schContractTempitemList: any;
  memo?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewDoing`, 'POST', query, {
    responseType: 'arraybuffer',
  });
}

// 查询班级详情- 根据班级主键查询并返回班级课程实体对象
// http://192.168.192.132:3000/project/193/interface/api/25441
export async function _getClassDetail(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/selectStuChargeStandardBySid`, 'GET', query);
}

// 查询班级详情- 根据班级主键查询并返回班级课程实体对象
// http://192.168.192.132:3000/project/183/interface/api/14248
export async function _previewContractFile(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewContractFile`, 'GET', query);
}

// 电子档案--培训考核单
// http://192.168.192.132:3000/project/193/interface/api/17293
export async function _trainExam(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getStageReport`, 'GET', query);
}

// 电子档案--结业证书
// http://192.168.192.132:3000/project/193/interface/api/17300
export async function _getFileUrl(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getGraduateReport`, 'GET', query);
}

// 学员所有培训科目学时信息
// http://192.168.192.132:3000/project/193/interface/api/20660
export async function _getStudentTrain(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStagetrainningTime/stuStageGroupTrainning/${query.sid}`, 'GET');
}

// 预报名审核(预报名审核-审核并注册)
// http://192.168.192.132:3000/project/193/interface/api/16285
export async function _updateByKeyForExam(query: {}) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/updateByKeyForExam`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'forecastReview', elementId: 'student/forecastReview:btn2' },
  });
}

//是否是一次性冻结、预约冻结的学员
//http://192.168.192.132:3000/project/193/interface/api/20814
export async function isFreezingModeStudent(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/isFreezingModeStudent/`, 'GET', query);
}

//是否显示获取远程教育学时按钮
//http://192.168.192.132:3000/project/193/interface/api/20807
export async function showNetworkTimeButton() {
  return await request(`${CORE_PREFIX}/v1/student/showNetworkTimeButton`, 'GET');
}

//获取学员远程教育学时
//http://192.168.192.132:3000/project/183/interface/api/20821
export async function getStudentNetworkTime(query: { stuid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getStudentNetworkTime`, 'GET', query, {
    withFeedback: true,
  });
}

//用户敏感信息项目列表
//http://192.168.192.132:3000/project/193/interface/api/20800
export async function getKeyInfos() {
  return await request(`${CORE_PREFIX}/v1/student/keyinfos`, 'GET');
}

//用户备案信息项目列表
//http://192.168.192.132:3000/project/193/interface/api/20926
export async function getReginfos() {
  return await request(`${CORE_PREFIX}/v1/student/reginfos`, 'GET');
}

// 查询点卡余额
// http://192.168.192.132:3000/project/203/interface/api/21633
export async function getCardMoney(query: {
  accounttype: any; // 账户类型 00:普通 10-代理商
  operator: String; // 操作人 编码+姓名+证件号码
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/queryaccountbalance`, 'POST', query);
}

// 导出学员Excel
// http://192.168.192.132:3000/project/193/interface/api/22767
export async function _export(query: {
  applydatebegin: string; // 报名开始时间 YYYY-MM-DD
  applydateend: string; // 报名截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/student/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 导出学员Excel查询
// http://192.168.192.132:3000/project/183/interface/api/23131
export async function _exportStudentBefore(query: {
  applydatebegin: string; // 报名开始时间 YYYY-MM-DD
  applydateend: string; // 报名截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/student/exportStudentBefore`, 'GET', query);
}

//开户
//http://192.168.192.132:3000/project/193/interface/api/22627
export async function _openAccount(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/open`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn12' },
  });
}

//充值
//http://192.168.192.132:3000/project/193/interface/api/22634
export async function _accountFund(query: { sid: string; operAmount: number; memo?: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/fund`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn13' },
  });
}

//账户信息
//http://192.168.192.132:3000/project/193/interface/api/22606
export async function _queryAccountInfo(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/queryInfo`, 'GET', query);
}

// 获取转入学员豆腐块
// http://192.168.192.132:3000/project/193/interface/api/23943
export async function _getTransfer(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/transfer/rule/list`, 'GET', query);
}

// 基于车型获取业务类型combo
// http://192.168.192.132:3000/project/193/interface/api/23887
export async function _getTrainType(query: { traintype: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getBusiTypeComboForTraintype/${query.traintype}`, 'GET');
}

// 学员报名场景，在学员档案菜单，新增/编辑表单中可选的驾校车型经营范围combo
// http://192.168.192.132:3000/project/193/interface/api/22179
export async function _getTrainCar(query: { schId: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeComboForSignup/${query.schId}`, 'GET');
}

//上传签名
//http://192.168.192.132:3000/project/193/interface/api/18784
export async function _submitStuSignature(query: { fileid: string; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/submitStuSignature`, 'PUT', query, { withFeedback: true });
}

//学员合同文件预览
//http://192.168.192.132:3000/project/193/interface/api/18763
export async function _getContractFile(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewContractFile`, 'GET', query);
}

// 变更身份认证关闭标志
// http://192.168.192.132:3000/project/193/interface/api/24650
export async function _updateStuIdauth(query: {
  sid: string; // 主键id
  idauthcloseddeadline: string; // 身份认证关闭标志截止日期 YYYY-MM-DD
  idauthclosed: string; // 身份认证关闭标志  0-开启, 1-关闭
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateStuIdauth`, 'PUT', query);
}

//新增受理学员信息
//http://192.168.192.132:3000/project/193/interface/api/24447
export async function _addSchStudentAcceptinfo(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/forecastExpected:btn1' },
  });
}

//http://192.168.192.132:3000/project/193/interface/api/24468
//编辑受理学员信息
export async function _updateSchStudentAcceptinfo(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/forecastExpected:btn2' },
  });
}

//培训机构下拉框
//http://192.168.192.132:3000/project/193/interface/api/24433
export async function _getListAssociated() {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/getListAssociated`, 'GET');
}

//查看受理学员详情
//http://192.168.192.132:3000/project/193/interface/api/24461
export async function _getPreSignUpDetail(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/selectByKey`, 'GET', query);
}

//学员受理预报名车型
//http://192.168.192.132:3000/project/193/interface/api/24601
export async function _getPreSignUpTrainCar() {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/getStuAcceptTrainType`, 'GET');
}

//审核学员
//http://192.168.192.132:3000/project/193/interface/api/24419
export async function _checkStudent(query: { checkmemo: string; checkstatus: string; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/checkStudent`, 'POST', query, {
    withFeedback: true,
  });
}

//http://192.168.192.132:3000/project/193/interface/api/24454
// 转正受理学员为正式学员
export async function _confirmStudent(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/saveStudent`, 'POST', query, {
    withFeedback: true,
  });
}

// 查看学员申请表
// http://192.168.192.132:3000/project/193/interface/api/24895
export async function _getDriveTrainApplyReport(query: any) {
  return await request(`${CORE_PREFIX}/v1/student/getDriveTrainApplyReport`, 'GET', query);
}

// 学员电子教学日志报表访问地址接口
// http://192.168.192.132:3000/project/193/interface/api/24881
export async function _getTrainClassReport(query: {
  id: string; // 学员编码sid
  subject: string; // subject	科目编码 ， 1-科目1、2-科目2、3-科目3、4-科目
}) {
  return await request(`${CORE_PREFIX}/v1/student/getTrainClassReport`, 'GET', query);
}
