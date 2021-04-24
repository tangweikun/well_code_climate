// 学员推送记录

import React, { useState } from 'react';
import { Table } from 'antd';
import { _getInfo, _sendSync } from './_api';
import { _getStudentList } from 'api';
import { useTablePro, useOptions, useHash, useRequest } from 'hooks';
import { AuthButton, Search } from 'components';
import { generateIdForDataSource, _get } from 'utils';

export default function StudentPushRecord() {
  const sendFlagHash = useHash('student_send_status');
  const [currentRecord, setCurrentRecord] = useState(null);
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getInfo,
    dataSourceFormatter: (dataSource: any[]) => generateIdForDataSource(dataSource),
  });

  const { loading: pushLoading, run } = useRequest(_sendSync, {
    onSuccess: _refreshTable,
    onFail: _refreshTable,
  });

  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    { title: '证件号', dataIndex: 'idcard' },
    { title: '推送状态', dataIndex: 'sendflag', render: (sendflag: any) => sendFlagHash[sendflag] },
    { title: '推送描述', dataIndex: 'sendmemo' },
    { title: '推送时间', dataIndex: 'createtime' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <AuthButton
          authId="pushManagement/studentPushRecord:btn1"
          loading={_get(currentRecord, 'sid') === _get(record, 'sid') && pushLoading}
          onClick={async () => {
            setCurrentRecord(record);
            run({ id: _get(record, 'sid') });
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          推送
        </AuthButton>
      ),
    },
  ];

  return (
    <div>
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
          {
            type: 'Select',
            field: 'sendflag',
            options: [{ label: '推送状态(全部)', value: '' }, ...useOptions('student_send_status')], // 推送状态
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customRequest={_getStudentList}
      />
      <Table {...tableProps} columns={columns} rowKey="id" />
    </div>
  );
}
