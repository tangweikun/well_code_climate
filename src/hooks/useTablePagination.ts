import { useState, useMemo } from 'react';

interface TPagination {
  pageSize?: number;
  total?: number;
  current?: number;
  isSimplePagination?: boolean;
}

// FIXME: TS-允许不传参数
export function useTablePagination({
  pageSize = 10,
  total = 0,
  current = 1,
  isSimplePagination = false,
}: TPagination): [Required<Omit<TPagination, 'isSimplePagination'>>, (arg: any) => void, any] {
  const [pagination, setPagination] = useState({
    pageSize,
    total,
    current,
  });

  const tablePagination = useMemo(
    () => ({
      showSizeChanger: !isSimplePagination,
      showQuickJumper: !isSimplePagination,
      showTotal: !isSimplePagination ? (total: number) => `共 ${total} 条` : null,
      ...pagination,
      onShowSizeChange: (_: any, pageSize: number) => {
        setPagination({ ...pagination, current: 1, pageSize });
      },
      onChange: (page: number) => {
        setPagination((pagination) => ({ ...pagination, current: page }));
      },
    }),
    [isSimplePagination, pagination],
  );

  return [pagination, setPagination, tablePagination];
}
