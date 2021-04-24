// 商品信息
import React from 'react';
import { _getInfo } from './_api';
import { Table } from 'antd';
import { useFetch } from 'hooks';
import { generateIdForDataSource, _get } from 'utils';

export default function TransactionRecordsTable(props: any) {
  const { query, ignore, pagination, setPagination, tablePagination } = props;
  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const columns = [
    {
      title: '交易号',
      dataIndex: 'payFlowId',
    },
    {
      title: '订单号',
      dataIndex: 'orderId',
    },
    {
      title: '账户类型',
      dataIndex: 'payFactoryName',
    },
    {
      title: '对方信息',
      dataIndex: 'targetAccountEntity',
      render: (targetAccountEntity: any, record: any, index: number) => {
        if (targetAccountEntity) {
          let settle = JSON.parse(targetAccountEntity);
          let arr = [];
          if (settle.bandCardBankName) {
            arr.push(settle.bandCardBankName);
          }
          if (settle.acctNo) {
            arr.push(settle.acctNo);
          }

          return arr.join('-');
        }
        return '';
      },
    },
    {
      title: '金额',
      dataIndex: 'awaitAmount',
      render: (awaitAmount: any, record: any) => {
        if (String(_get(record, 'status', '')) === '交易成功') {
          return <span style={{ color: '#009900' }}>{Number(awaitAmount).toFixed(2)}</span>;
        }
        if (String(_get(record, 'status', '')) === '交易失败') {
          return <span style={{ color: '#FF0000' }}>{Number(awaitAmount).toFixed(2)}</span>;
        }
        return awaitAmount || awaitAmount === 0 ? Number(awaitAmount).toFixed(2) : '';
      },
    },
    {
      title: '交易状态',
      dataIndex: 'statusName',
    },
    {
      title: '入账状态',
      dataIndex: 'settleStatusName',
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
    },
    {
      title: '交易类型',
      dataIndex: 'transTypeName',
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'memo',
    },
    {
      title: '交易时间',
      dataIndex: 'transTime',
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
