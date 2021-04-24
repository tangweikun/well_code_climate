import { useState, useEffect } from 'react';
import { _get } from 'utils';
import { AxiosResponse } from 'axios';

// TODO: twk-监听request的参数类型
interface IParams<T = { [key: string]: any }> {
  request(query?: T): Promise<AxiosResponse | undefined | void>;
  query?: T;
  depends?: any[];
  callback?(data: any): void;
  requiredFields?: string[];
  forceCancel?: boolean;
}

interface IReturn {
  res: any;
  isLoading: boolean;
  finished: boolean;
  isError: boolean;
  data: any;
}

export const useFetch = <T>({
  request = () => Promise.resolve(),
  query,
  depends = [],
  callback = () => {},
  requiredFields = [],
  forceCancel = false, // 取消请求
}: IParams<T>): IReturn => {
  const [fetchStore, setFetchStore] = useState({ res: null, isLoading: true, isError: false, finished: false } as any);
  const _query: any = query;
  useEffect(() => {
    let didCancel = false;
    // 如果没有传入必填字段则不触发请求 | 主动取消请求
    if (requiredFields.some((field: string) => typeof _query === 'object' && _query[field] == null) || forceCancel) {
      setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: false }));
      return;
    }

    const fetchData = async () => {
      setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: true, isError: false, finished: false }));
      try {
        const res: any = await request(query);
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({
            ...fetchStore,
            isError: false,
            res,
            isLoading: false,
            finished: true,
          }));
          _get(res, 'data') && callback(_get(res, 'data'));
        }
      } catch (error) {
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({ ...fetchStore, isError: true, isLoading: false, finished: true }));
        }
      } finally {
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: false, finished: true }));
        }
      }
    };

    fetchData();
    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depends);

  return {
    res: _get(fetchStore, 'res'),
    isLoading: fetchStore.isLoading,
    finished: fetchStore.finished,
    isError: fetchStore.isError,
    data: _get(fetchStore, 'res.data'),
  };
};
