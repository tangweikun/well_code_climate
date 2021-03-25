// 交易记录
import React, { useState } from 'react';
import { _get } from 'utils';
import { useTablePagination, useSearch, useForceUpdate, useOptions } from 'hooks';
import { Search } from 'components';
import TransactionRecordsTable from './TransactionRecordsTable';
import moment from 'moment';
import { message } from 'antd';

function TransactionRecords() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [dateArr, setDateArr] = useState<any>({
    startDate: moment().startOf('month'),
    endDate: moment(),
  });

  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    payFlowId: _get(search, 'payFlowId'),
    orderId: _get(search, 'orderId'),
    status: _get(search, 'status'),
    transType: _get(search, 'transType'),
    startDate: _get(search, 'startDate'),
    endDate: _get(search, 'endDate'),
  };

  return (
    <div>
      {
        <Search
          filters={[
            { type: 'Input', field: 'payFlowId', placeholder: '交易号' },
            { type: 'Input', field: 'orderId', placeholder: '订单号' },
            {
              type: 'Select',
              field: 'status',
              // placeholder: '交易状态',
              options: [{ label: '交易状态(全部)', value: '' }, ...useOptions('trade_list_page_trade_status')],
            },
            {
              type: 'Select',
              field: 'transType',
              placeholder: '交易类型',
              options: [{ label: '交易类型(全部)', value: '' }, ...useOptions('transaction_type')],
            },
            {
              type: 'RangePicker',
              field: ['startDate', 'endDate'],
              placeholder: ['创建日期起', '创建日期止'],
              otherProps: {
                allowClear: false,
                value: [_get(dateArr, 'startDate'), _get(dateArr, 'endDate')],
                onCalendarChange: (date: any) => {
                  if (_get(date, '0') && _get(date, '1')) {
                    if (_get(date, '0').year() === _get(date, '1').year()) {
                      setDateArr({ startDate: _get(date, '0'), endDate: _get(date, '1') });
                    } else {
                      message.error('选择日期不能跨年');
                      setDateArr({ startDate: '', endDate: '' });
                    }
                  } else {
                    setDateArr({ startDate: '', endDate: '' });
                  }
                },
              },
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      }
      <TransactionRecordsTable
        query={query}
        ignore={ignore}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
      ></TransactionRecordsTable>
    </div>
  );
}

export default TransactionRecords;
