import { message } from 'antd';
import axios from 'axios';
import { Auth, handleLogout, _get } from 'utils';
import { formatQueryParams } from 'utils/formatQueryParams';
import { USER_CENTER_URL } from 'constants/env';

const service = axios.create({
  baseURL: USER_CENTER_URL,
  withCredentials: true,
  timeout: 60000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Add a request interceptor
service.interceptors.request.use(
  function (config) {
    config.withCredentials = true;
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
service.interceptors.response.use(
  function (response) {
    const status = _get(response, 'status');
    const withFeedback = _get(response, 'config.headers.withFeedback');
    const withFailedFeedback = _get(response, 'config.headers.withFailedFeedback');
    const method = _get(response, 'config.method');

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    if (status === 401) {
      message.error('登录信息过期，请重新登录');
      Auth.del();
      return response.data;
      // window.location.reload();
    }

    if (withFailedFeedback || withFeedback || method === 'delete' || method === 'put') {
      if (_get(response, 'data.code') === 200) {
        !withFailedFeedback && message.success(_get(response, 'data.message'));
      } else {
        message.error(_get(response, 'data.message'));
      }
    }

    return response.data;
  },
  function (error) {
    message.error(_get(error, 'response.data.message'));
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (_get(error, 'response.status') === 401) {
      handleLogout();
    }

    return Promise.reject(error);
  },
);

export function request(path: string, method: any = 'GET', query: object = {}, payload?: object) {
  const withFeedback = _get(payload, 'withFeedback', false); // 是否对接口结果进行反馈
  const withFailedFeedback = _get(payload, 'withFailedFeedback', false); // 是否仅对接口结果进行反馈
  const customHeader = _get(payload, 'customHeader', {}); // 自定义Header
  const responseType = _get(payload, 'responseType', 'json');

  const headers = { withFeedback, withFailedFeedback };
  if (Auth.isAuthenticated()) {
    Object.assign(headers, {
      Authorization: 'bearer' + Auth.get('token'),
      username: Auth.get('username'),
      companyId: Auth.get('companyId'),
      schoolId: Auth.get('schoolId'),
      userId: Auth.get('userId'),
      operatorName: encodeURIComponent(Auth.get('operatorName') || ''),
      sysId: 'ERP',
      ...customHeader,
    });
  }

  const mustAuthenticated = _get(payload, 'mustAuthenticated', true); // 接口是否必须在授权后才可以调用

  // TODO:可能还需要其他处理
  if (mustAuthenticated && (!Auth.isAuthenticated() || !Auth.get('schoolId'))) {
    return;
  }

  if (method === 'GET') {
    return service({
      url: path,
      method: method.toLowerCase(),
      params: trimStr(query),
      headers,
      responseType,
    });
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return service({
      url: path,
      method: method.toLowerCase(),
      data: trimStr(query),
      headers,
      responseType,
    });
  }
}

// 用于trim字符串参数
// TODO: 支持trim数组对象类型里面的成员
function trimStr(query: any) {
  const newQuery: any = query;
  for (let key of Object.keys(newQuery)) {
    if (typeof newQuery[key] === 'string') {
      newQuery[key] = newQuery[key].trim();
    }
  }

  return newQuery;
}

function parseJSON(response: any) {
  return response.json();
}

export async function postRequestTemp(path: string, query: object = {}) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (Auth.isAuthenticated()) {
    Object.assign(headers, { token: Auth.get('token') });
  }

  const options = {
    method: 'POST',
    headers,
  };

  return fetch(USER_CENTER_URL + path + formatQueryParams(query), options)
    .then(parseJSON)
    .catch((error) => {});
}
