import React, { useState } from 'react';
import { Modal, Table, Row, Button } from 'antd';
import { useFetch, useTablePagination, useSearch, useHash, useForceUpdate, useVisible } from 'hooks';
import { _getStudentInfo } from './_api';
import { _getStudentList } from 'api';
import { _get } from 'utils';
import { Search } from 'components';
import Reason from './Reason';

function ApplyDropped(props: any) {
  const { onCancel, onOk } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();

  const { isLoading, data } = useFetch({
    request: _getStudentInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      // status: '01',  去掉不传
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([_get(data, 'rows.0.sid')]);
    },
  });

  const cardTypeHash = useHash('card_type'); // 证件类型
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态

  const columns = [
    {
      title: '学号',
      dataIndex: 'stunum',
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '证件类型',
      dataIndex: 'cardtype',
      render: (cardtype: any) => cardTypeHash[cardtype],
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      render: (status: any) => stuStatusHash[status],
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  return (
    <>
      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            onOk();
          }}
          selectedRowKeys={selectedRowKeys}
        />
      )}

      <Modal visible width={1100} title={'退学申请'} maskClosable={false} onCancel={onCancel} footer={null}>
        <Search
          filters={[
            {
              type: 'CustomSelect',
              field: 'sid',
              placeholder: '学员姓名',
              options: [
                { label: '学员姓名', value: 'name' },
                { label: '学员证件', value: 'idcard' },
              ],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          customRequest={_getStudentList}
        />

        <Table
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'radio',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'sid')}
          pagination={tablePagination}
        />

        <Row justify="end">
          <Button onClick={onCancel} style={{ marginRight: 20 }}>
            取消
          </Button>
          <Button type="primary" onClick={_switchVisible}>
            退学
          </Button>
        </Row>
      </Modal>
    </>
  );
}

export default ApplyDropped;
