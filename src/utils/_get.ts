import { get } from 'lodash';

export function _get(object: any, path: string | string[], defaultValue?: any) {
  const res = get(object, path, defaultValue);

  // eslint-disable-next-line eqeqeq
  return res == undefined ? defaultValue : res;
}
