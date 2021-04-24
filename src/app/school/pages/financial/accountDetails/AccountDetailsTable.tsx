// 账务明细表格
import React from 'react';
import { _getInfo } from './_api';
import { Table } from 'antd';
import { useFetch } from 'hooks';
import { generateIdForDataSource, _get } from 'utils';

export default function AccountDetailsTable(props: any) {
  const { query, setMoneyCallback, ignore, flowType = '', pagination, setPagination, tablePagination } = props;

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize, flowType],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      if (setMoneyCallback) {
        setMoneyCallback(data);
      }
    },
  });

  const columns = [
    {
      title: '交易号',
      dataIndex: 'platTradeNo',
    },
    {
      title: '账户类型',
      dataIndex: 'bankChannelName',
    },
    {
      title: '账务类型',
      dataIndex: 'busiType',
    },
    {
      title: '对方信息',
      dataIndex: 'targetAcctNo',
      render: (targetAcctNo: any, record: any) => {
        return _get(record, 'targetAcctName', '')
          ? targetAcctNo + '-' + _get(record, 'targetAcctName', '')
          : targetAcctNo;
      },
    },
    {
      title: '收支/冻结/解冻 金额',
      dataIndex: 'tradeAmount',
      render: (tradeAmount: any, record: any) => {
        let style = { color: 'black' };
        if (record.flowType === '支出') {
          style = { color: 'red' };
        } else if (record.flowType === '收入') {
          style = { color: 'green' };
        }
        return <span style={style}>{tradeAmount}</span>;
      },
    },
    {
      title: '收支类型',
      dataIndex: 'flowType',
    },
    {
      title: '账户余额',
      dataIndex: 'allAmount',
      render: (allAmount: any, record: any) => {
        return allAmount || allAmount === 0 ? Number(allAmount).toFixed(2) : '';
      },
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'memo',
    },
    {
      title: '入账时间',
      dataIndex: 'successTime',
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={generateIdForDataSource(_get(data, 'rows', []))}
        rowKey="id"
        pagination={tablePagination}
      />
    </div>
  );
}
