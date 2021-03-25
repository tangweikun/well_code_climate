import React, { useImperativeHandle } from 'react';
import { Table } from 'antd';
import { _get } from 'utils';
import { useFetch, useForceUpdate, usePagination } from 'hooks';
import { AxiosResponse } from 'axios';

type TProps = {
  columns: { title: string; dataIndex: string; render?: any }[];
  request: (query?: any) => Promise<AxiosResponse<any> | undefined>;
  query?: object;
  requiredFields?: any;
  rowKey: string;
};

// FIXME: rename TablePro -> PageTable
const TablePro = React.forwardRef((props: TProps, ref) => {
  const { columns, query, request, requiredFields, rowKey } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination] = usePagination();

  const { data, isLoading } = useFetch({
    request,
    query: { ...query, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize, ignore],
    requiredFields,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useImperativeHandle(ref, () => ({
    refreshTable() {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  }));

  return (
    <Table
      rowKey={rowKey}
      bordered
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onShowSizeChange: (_: any, pageSize: number) => {
          setPagination({ ...pagination, current: 1, pageSize });
        },
        onChange: (page, pageSize) => {
          setPagination({ ...pagination, current: page, pageSize });
        },
      }}
      loading={isLoading}
      columns={columns}
      dataSource={_get(data, 'rows', [])}
    />
  );
});

export default TablePro;
