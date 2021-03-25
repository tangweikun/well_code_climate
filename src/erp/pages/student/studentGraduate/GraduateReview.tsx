import React, { useState } from 'react';
import { Modal, Table, Button, Select, message } from 'antd';
import { useFetch, useTablePagination, useHash, useForceUpdate, useOptions, useVisible } from 'hooks';
import { _getStudentFace } from './_api';
import { _get } from 'utils';
import ReviewResult from './ReviewResult';

export default function GraduateReview(props: any) {
  const { onCancel } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [isapply, setIsApply] = useState('');
  const [ignore, forceUpdate] = useForceUpdate();
  const [resultVisible, _switchRVisible] = useVisible();

  const { isLoading, data } = useFetch({
    query: { page: pagination.current, limit: pagination.pageSize, isapply },
    request: _getStudentFace,
    depends: [pagination.current, pagination.pageSize, isapply, ignore],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });
  const reviewData = _get(data, 'rows', []).filter((x: any) => x.isapply !== '2');

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  const isApplyStuHAsh = useHash('isapply_stu');

  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    { title: '学员证件号', dataIndex: 'idcard' },
    { title: '车型', dataIndex: 'traintype' },
    { title: '申请人', dataIndex: 'applyname' },
    { title: '申请时间', dataIndex: 'createtime' },
    { title: '结业证号', dataIndex: 'JYZNUMCODE' },
    { title: '核实状态', dataIndex: 'isapply', render: (isapply: string) => isApplyStuHAsh[isapply] },
  ];

  return (
    <>
      {resultVisible && (
        <ReviewResult
          onCancel={_switchRVisible}
          selectedRowKeys={selectedRowKeys}
          onOk={() => {
            _switchRVisible();
            forceUpdate();
            setPagination({ ...pagination, total: _get(data, 'total', 0) });
          }}
        />
      )}

      <Modal visible width={1100} title={'结业审核'} maskClosable={false} onCancel={onCancel} footer={null}>
        <Button
          type="primary"
          style={{ margin: '0 20px 20px 0' }}
          onClick={() => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要审核的记录');
              return;
            }
            _switchRVisible();
          }}
        >
          确定
        </Button>
        <Select
          options={[{ label: '审核状态(全部)', value: '' }, ...useOptions('isapply_stu', false, '-1', ['2'])]}
          value={isapply}
          onChange={(value: any) => setIsApply(value)}
          style={{ width: 180, marginLeft: 20 }}
        />
        <Table
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={reviewData}
          rowKey="said"
          pagination={tablePagination}
        />
      </Modal>
    </>
  );
}
