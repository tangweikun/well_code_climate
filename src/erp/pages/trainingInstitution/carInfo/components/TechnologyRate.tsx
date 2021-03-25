import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { _get } from 'utils';
import { useFetch, useTablePagination, useForceUpdate, useDeleteConfirm, useVisible } from 'hooks';
import { _getTechnologyRate, _deleteTechnologyRate } from '../_api';
import AddTechnologyRate from './AddTechnologyRate';

export default function TechnologyRate(props: any) {
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useDeleteConfirm();
  const [visible, _switchVisible] = useVisible();
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const columns = [
    {
      title: '技术等级证书编号',
      dataIndex: 'techlevelcode',
    },
    {
      title: '技术等级',
      dataIndex: 'techlevel',
    },
    {
      title: '评定时间',
      dataIndex: 'auditdate',
    },
    {
      title: '评定单位',
      dataIndex: 'auditdept',
    },
    {
      title: '评定到期时间',
      dataIndex: 'auditenddate',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <Button onClick={() => _handleEdit(record)} className="operation-button" type="primary" ghost size="small">
            编辑
          </Button>
          <Button
            onClick={() =>
              _showDeleteConfirm({
                handleOk: async () => {
                  const res = await _deleteTechnologyRate({ id: _get(record, 'id') });
                  if (_get(res, 'code') === 200) {
                    setPagination({ ...pagination, current: 1 });
                    forceUpdate();
                  }
                },
              })
            }
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  function _handleEdit(record: any) {
    _switchVisible();
    setIsEdit(true);
    setCurrentRecord(record);
  }

  function _handleAdd() {
    _switchVisible();
    setIsEdit(false);
    setCurrentRecord(null);
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  const { data, isLoading } = useFetch({
    request: _getTechnologyRate,
    query: { carid: props.carid, page: pagination.current, limit: pagination.pageSize },
    requiredFields: ['carid'],
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      {visible && (
        <AddTechnologyRate
          currentRecord={currentRecord}
          onCancel={_switchVisible}
          onOk={_handleOk}
          title={isEdit ? '编辑车辆技术等级评定' : '新增车辆技术等级评定'}
          carid={props.carid}
          isEdit={isEdit}
        />
      )}

      <Button type="primary" style={{ marginBottom: 20 }} onClick={() => _handleAdd()}>
        新增
      </Button>

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
