// 教练继续教育管理
import React from 'react';
import { _getInfo } from './_api';
import { AuthButton, Search } from 'components';
import AddOrEdit from './AddOrEdit';
import { useTablePro } from 'hooks';
import { Table } from 'antd';

function CoachContinueEducation() {
  const {
    tableProps,
    search,
    isAddOrEditVisible,
    currentId,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getInfo });

  const columns = [
    {
      title: '教练名',
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
    },
    {
      title: '继续教育开始日期',
      dataIndex: 'starttime',
    },
    {
      title: '继续教育结束日期',
      dataIndex: 'endtime',
    },
    {
      title: '本期达标日期',
      dataIndex: 'finallytime',
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  return (
    <>
      <AuthButton
        type="primary"
        onClick={() => {
          _handleAdd();
        }}
        className="mb20"
      >
        新增
      </AuthButton>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={'继续教育管理'}
        />
      )}
      <Search
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'RangePicker',
            field: ['starttime', 'endtime'],
            placeholder: ['继续教育时间(起)', '继续教育时间(止)'],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <Table {...tableProps} columns={columns} rowKey="id" />
    </>
  );
}

export default CoachContinueEducation;
