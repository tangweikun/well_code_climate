// 银行对账单
import React from 'react';
import { Table, message } from 'antd';
import { useTablePagination, useSearch, useForceUpdate, useFetch } from 'hooks';
import { _getInfo, _getDownLoadAddress } from './_api';
import { AuthButton, Search } from 'components';
import { formatTime, _get } from 'utils';

function BankStatement() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  const columns = [
    { title: '日期', dataIndex: 'date' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="financial/bankStatement:btn1"
            type="primary"
            ghost
            size="small"
            onClick={() => {
              _getDownLoadAddress({
                id: _get(record, 'id', ''),
              }).then((res) => {
                if (!_get(res, 'data')) {
                  message.error('当前银行没有对账单');
                  return;
                }
                window.open(_get(res, 'data', ''));
              });
            }}
          >
            下载
          </AuthButton>
        </>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      begin: formatTime(_get(search, 'begin'), 'BEGIN'),
      end: formatTime(_get(search, 'end'), 'END'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['begin', 'end'],
            placeholder: ['日期起', '日期止'],
            otherProps: {
              allowClear: false,
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      ></Search>
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'id')}
        pagination={tablePagination}
      />
    </>
  );
}

export default BankStatement;
