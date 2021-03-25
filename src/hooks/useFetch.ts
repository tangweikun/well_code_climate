import { useState, useEffect } from 'react';
import { _get } from 'utils';

export const useFetch = ({
  request = (query: any) => {},
  query = {} as any,
  depends = [] as any[],
  callback = (data: any) => {},
  requiredFields = [] as any[],
  forceCancel = false as boolean, // 取消请求
}) => {
  const [fetchStore, setFetchStore] = useState({ res: null, isLoading: true, isError: false, finished: false } as any);

  useEffect(() => {
    let didCancel = false;
    // 如果没有传入必填字段则不触发请求 | 主动取消请求
    if (requiredFields.some((field: string) => query[field] == null) || forceCancel) {
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
        setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: false, finished: true }));
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
