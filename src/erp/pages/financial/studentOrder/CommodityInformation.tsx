// 商品信息
import React from 'react';
import { _querySkuBy } from './_api';
import { Table } from 'antd';
import { _get } from 'utils';
import { useFetch } from 'hooks';

export default function CommodityInformation(props: any) {
  const { orderitemids } = props;
  const { data, isLoading } = useFetch({
    query: {
      orderitemids: orderitemids,
    },
    request: _querySkuBy,
  });
  const columns = [
    {
      title: '商品',
      dataIndex: 'productName',
    },
    {
      title: '规格属性',
      dataIndex: 'subject',
    },
    {
      title: '数量',
      dataIndex: 'productNum',
    },
    {
      title: '价格',
      dataIndex: 'price',
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        bordered
        dataSource={data}
        loading={isLoading}
        rowKey={(record) => _get(record, 'productId')}
        pagination={false}
      />
    </div>
  );
}
