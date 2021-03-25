// 学时申报
import React from 'react';
import { _getStudentTableList, _getApplyResult } from './_api';
import { _getStudentList } from 'api';
import { useTablePro, useOptions, useHash } from 'hooks';
import { Table, Button } from 'antd';
import { Search } from 'components';
import AddOrEdit from './AddOrEdit';
import { _get } from 'utils';

export default function PhaseDeclare() {
  const {
    tableProps,
    search,
    _handleSearch,
    _refreshTable,
    currentId,
    _handleEdit,
    currentRecord,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    isEdit,
    _handleOk,
    _handleAdd,
  } = useTablePro({
    request: _getStudentTableList,
    extraParams: {
      traintimeApplyQueryType: 1, //查询类型
      studenttype: 1, //转入学员
    },
  });
  const traintimeApplyStatusTypeHash = useHash('traintime_apply_status_type'); // 申报状态

  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    { title: '证件号码', dataIndex: 'idcard' },
    { title: '车型', dataIndex: 'traintype' },
    { title: '申报时间', dataIndex: 'trainTimeApplyTime' },
    {
      title: '申报状态',
      dataIndex: 'trainTimeApplyStatus',
      render: (trainTimeApplyStatus: any) => traintimeApplyStatusTypeHash[trainTimeApplyStatus],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <Button
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                _handleEdit(record, _get(record, 'sid', ''));
              }}
            >
              编辑
            </Button>
            <Button
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={async () => {
                const res = await _getApplyResult({ sid: _get(record, 'sid', '') });
                if (_get(res, 'code') === 200) {
                  _refreshTable();
                }
              }}
            >
              获取申报结果
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          currentRecord={currentRecord}
          isEdit={isEdit}
        />
      )}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['trainTimeApplyTimeBegin', 'trainTimeApplyTimeEnd'],
            placeholder: ['申报日期开始', '申报日期结束'],
          },
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
            field: 'trainTimeApplyStatus',
            options: [
              { label: '申报状态(全部)', value: '' },
              ...useOptions('traintime_apply_status_type', false, '-1', ['0']),
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customRequest={_getStudentList}
      />

      <Button type="primary" className="mb20" onClick={_handleAdd}>
        学时申报
      </Button>

      <Table {...tableProps} columns={columns} rowKey="sid" />
    </>
  );
}
