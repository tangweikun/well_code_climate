// 用户中心地址
export const USER_CENTER_URL = window.REACT_APP_USER_CENTER_URL || process.env.REACT_APP_USER_CENTER_URL;

// 部署时的上下文路径
export const PUBLIC_URL = window.REACT_APP_PUBLIC_URL || process.env.REACT_APP_PUBLIC_URL;

// 用户中心client_id
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || '1603500352454';

// 用户中心client_secret
export const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || '6d437f855f0af2c1b2c32c084ba5a2ac';

// 前端地址
export const LOCAL_URL = window.location.origin;

// 接口地址
export const API_URL = window.REACT_APP_API_URL || process.env.REACT_APP_API_URL;

// 非核心业务接口前缀
export const NOT_CORE_PREFIX = '/api/jp-train-noncore-svc';

// 核心业务接口前缀
export const CORE_PREFIX = '/api/jp-train-core-svc';

// 王腾
export const TEST_CORE_PREFIX = '/api/jp-train-core-svc-front';

// 考试
export const EXAM_PREFIX = '/api/jp-train-statistic-svc';

// 用户中心接口前缀
export const USER_CENTER_PREFIX = '/api/usercenter';

// 支付中心接口前缀
export const ORDER_PAY_PREFIX = '/api/orderpay-service';

//
export const VIDEO_FACE = '/api/video-face';

export const STATISTIC_PREFIX = '/api/jp-train-statistic-svc';

// 数据交互服务前缀
export const DATA_EXCHANGE_PREFIX = '/api/data-exchange';
