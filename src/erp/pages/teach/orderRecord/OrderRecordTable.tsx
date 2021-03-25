// 预约记录table

import React, { useState } from 'react';
import { Table, Button } from 'antd';
import { _get } from 'utils';
import moment from 'moment';
import { _getCoaOrderList } from './_api';
import { useFetch, useHash, useVisible } from 'hooks';
import Detail from './Detail';

export default function OrderRecordTable(props: any) {
  const {
    query,
    ignore,
    isNeedRowSelect = false,
    setSkuId,
    pagination,
    setPagination,
    tablePagination,
    setSelectedData,
  } = props;
  const [currentId, setCurrentId] = useState();
  const orderModeHash = useHash('order_mode');
  const subjectcodeHash = useHash('trans_part_type');
  const traincodeHash = useHash('combo'); // 课程类型
  const orderStatusHash = useHash('order_appoint_status');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [visible, _switchVisible] = useVisible();

  const columns = [
    {
      title: '姓名',
      dataIndex: 'stuname',
    },
    {
      title: '证件号',
      dataIndex: 'stuidcard',
    },
    // {
    //   title: '预约号',
    //   dataIndex: 'starttime',
    // },
    {
      title: '预约对象',
      dataIndex: 'orderObject',
    },
    {
      title: '约课类型',
      dataIndex: 'order_mode', // 1预约,2邀请,3 直接安排（随到随签） 新：1-学员自主预约,2-驾校约课, 3- 直接安排
      render: (order_mode: any) => orderModeHash[order_mode],
    },
    {
      title: '约课科目',
      dataIndex: 'subjectcode', // 1-科目一 2-科目二 3-科目三 4- 科目四    0-科二与科三组合)
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '课程日期',
      dataIndex: 'plan_date',
    },
    {
      title: '课程时段',
      dataIndex: '_', // endhourmin
      render: (_: any, record: any) =>
        moment().hour(_get(record, 'begin_hour', 0)).minute(_get(record, 'beginhourmin', 0)).format('HH:mm') +
        '-' +
        moment().hour(_get(record, 'end_hour', 0)).minute(_get(record, 'endhourmin', 0)).format('HH:mm'),
    },
    {
      title: '课程类型',
      dataIndex: 'traincode',
      render: (traincode: any) => traincodeHash[traincode],
    },
    {
      title: '约课时间',
      dataIndex: 'create_date',
    },
    {
      title: '课程价格',
      dataIndex: 'sparring_price',
    },
    {
      title: '实付金额',
      dataIndex: 'real_pay_price',
    },
    {
      title: '预约状态',
      dataIndex: 'order_appoint_status', // 0待支付 1提交, 2已预约, 4(上车), 5(待评价), 6已评价, 7取消中，8已取消,9已删除,10已退款  先学后付:  0 待支付 1提交, 2已预约, 4上车, 5待评价, 6已评价,7取消中，8已取消 ,9已删除,10已退款  预支付模式:  0 待支付 1提交,	 2已预约(预付款已支付), 4(上车-未确认支付), 5(待评价-已确认支付),6已评价, 7取消中，8已取消,9已删除,10已退款
      render: (order_appoint_status: any) => orderStatusHash[order_appoint_status],
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: any, index: any) => (
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => {
            _switchVisible();
            setCurrentId(_get(record, 'orderid', ''));
          }}
        >
          详情
        </Button>
      ),
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedData: any) => {
      setSelectedRowKeys(selectedRowKeys);
      let selectRow = _get(data, 'rows', []).filter((x: any) => selectedRowKeys.includes(x.orderid));
      let planId = selectRow.map((i: any) => {
        return i.plan_id;
      });
      setSkuId(planId);
      setSelectedData(selectedData);
    },
    selectedRowKeys,
  };
  const rowSelect: any = {
    type: 'radio',
    ...rowSelection,
  };
  const { data, isLoading } = useFetch({
    request: _getCoaOrderList,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      {visible && <Detail onCancel={_switchVisible} currentId={currentId} />}
      <Table
        bordered
        pagination={tablePagination}
        columns={columns}
        loading={isLoading}
        rowSelection={isNeedRowSelect ? rowSelect : undefined}
        dataSource={_get(data, 'rows', [])}
        rowKey="orderid"
      />
    </>
  );
}
