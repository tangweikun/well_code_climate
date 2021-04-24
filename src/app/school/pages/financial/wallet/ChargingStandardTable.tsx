import React from 'react';
import { Table } from 'antd';
import { generateIdForDataSource, _get } from 'utils';

export default function ChargingStandardTable(props: any) {
  const { record } = props;
  const columns = [
    {
      title: '提现金额',
      dataIndex: 'withdrawFeeMin',
      render: (withdrawFeeMin: number, record: any) => {
        if (withdrawFeeMin === null && _get(record, 'withdrawFeeMax')) {
          return Math.ceil(_get(record, 'withdrawFeeMax', 0) / 10000) + '万元以下';
        }
        if (_get(record, 'withdrawFeeMax') === null && withdrawFeeMin) {
          return Math.ceil(withdrawFeeMin / 10000) + '万元以上';
        }
        return Math.ceil(withdrawFeeMin / 10000) + '-' + Math.ceil(_get(record, 'withdrawFeeMax', 0) / 10000) + '万元';
      },
    },
    {
      title: '信息服务费',
      dataIndex: 'fee',
    },
  ];
  return (
    <Table columns={columns} bordered dataSource={generateIdForDataSource(record)} rowKey="id" pagination={false} />
  );
}
