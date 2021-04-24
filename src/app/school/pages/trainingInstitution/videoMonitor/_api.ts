import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// http://192.168.192.132:3000/project/183/interface/api/25875
// 车辆监控树
export async function _getTreeData(query: {
  pid: number; // 父级节点
  ptype: number; // 节点类型    0-city  1-area   2-school   3-car  4-camera
  page: number;
  limit: number;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/monitorTree`, 'GET', query);
}

// http://192.168.192.132:3000/project/183/interface/api/25882
// 监控树搜索关键字接口-支持 1-车牌； 2-驾校名称
export async function _getSearchText(query: {
  searchType: any; // 搜索类别  1-车牌； 2-驾校名称
  searchText: string; // 搜索关键字
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/searchText`, 'GET', query);
}

// http://192.168.192.132:3000/project/183/interface/api/25721
// 车辆视频监控播放地址
export async function _getCarVideo(query: {
  carId: string;
  cameraNum: number; // 摄像头序号   1-内置； 2-外置
  carSchoolId: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/carVideo`, 'GET', query);
}

//http://192.168.192.132:3000/project/183/interface/api/25805
// 车辆视频监控播放地址
export async function _stopCarVideo(query: {
  carId: string;
  cameraNum: number; // 摄像头序号   1-内置； 2-外置
  carSchoolId: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/carVideoStop`, 'GET', query);
}
