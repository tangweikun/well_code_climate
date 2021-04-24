// 商品信息
import React, { useState } from 'react';
import { _getInfo, _getTotalMoney } from './_api';
import { Table } from 'antd';
import { _get } from 'utils';
import { useHash, useFetch, useVisible } from 'hooks';
import Detail from '../../teach/orderRecord/Detail';

export default function SettlementRecordsTable(props: any) {
  const {
    query,
    setMoneyCallback,
    ignore,
    pagination,
    setPagination,
    tablePagination,
    sid,
    isFromStudentInfo = false,
  } = props;

  const settlementTypeHash = useHash('settlement_type'); // 结算类型
  const settlementStatusHash = useHash('settlement_status'); // 结算状态
  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });

      let res = isFromStudentInfo ? await _getTotalMoney({ studentId: sid }) : await _getTotalMoney(query);
      if (_get(res, 'code') === 200 && setMoneyCallback) {
        setMoneyCallback(res, data);
      }
    },
  });

  const [visible, setVisible] = useVisible();
  const [currentId, setCurrentId] = useState();

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
    },
    {
      title: '证件号',
      dataIndex: 'idNumber',
    },
    {
      title: '学员电子账户',
      dataIndex: 'studentBankAccount',
    },
    {
      title: '订单号',
      dataIndex: 'orderCode',
    },
    {
      title: '交易号',
      dataIndex: 'payFlowId',
    },
    {
      title: '结算方式',
      dataIndex: 'settleType',
      render: (settleType: any) => settlementTypeHash[settleType],
    },
    {
      title: '结算依据',
      dataIndex: 'settleNote',
      render: (settleNote: any, record: any) => {
        if (String(record.settleType) === '3') {
          //结算方式按课程时，点击可跳转到预约详情页
          return (
            <span
              className="color-primary pointer"
              onClick={() => {
                setVisible();
                setCurrentId(_get(record, 'orderId'));
              }}
            >
              {settleNote}
            </span>
          );
        }
        return settleNote;
      },
    },
    {
      title: '结算金额',
      dataIndex: 'settleAmout',
      render: (settleAmout: any, record: any) => {
        return settleAmout || settleAmout === 0 ? Number(settleAmout).toFixed(2) : '';
      },
    },
    {
      title: '结算状态',
      dataIndex: 'status',
      render: (status: any) => settlementStatusHash[status],
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '结算完成时间',
      dataIndex: 'finishedSettleTime',
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
  ];

  return (
    <div>
      {visible && <Detail currentId={currentId} onCancel={setVisible} />}
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'id')}
        pagination={tablePagination}
      />
    </div>
  );
}
