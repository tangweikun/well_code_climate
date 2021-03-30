// 分支机构管理
import React from 'react';
import { _getBranchMechanism, _deleteTeBranchMechanism } from './_api';
import AddOrEdit from './AddOrEdit';
import { AuthButton, Search } from 'components';
import { useConfirm, useRequest, useTablePro } from 'hooks';
import { _get } from 'utils';
import { Table } from 'antd';

export default function BranchMechanism() {
  const [_showDeleteConfirm] = useConfirm();

  const {
    tableProps,
    search,
    currentRecord,
    isAddOrEditVisible,
    currentId,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getBranchMechanism });

  const { loading: deleteLoading, run } = useRequest(_deleteTeBranchMechanism, {
    onSuccess: _refreshTable,
  });

  const columns = [
    {
      title: '分支机构名称',
      dataIndex: 'branchname',
    },
    {
      title: '分支机构地址',
      dataIndex: 'address',
    },
    {
      title: '联系人',
      dataIndex: 'contact',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="trainingInstitution/branchMechanism:btn2"
            loading={_get(currentRecord, 'bid') === _get(record, 'bid') && deleteLoading}
            onClick={() => {
              _showDeleteConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'bid') });
                },
              });
            }}
            className="operation-button"
          >
            删除
          </AuthButton>

          <AuthButton
            authId="trainingInstitution/branchMechanism:btn3"
            onClick={() => {
              _handleEdit(record, _get(record, 'bid', ''));
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <>
      <AuthButton
        authId="trainingInstitution/branchMechanism:btn1"
        type="primary"
        onClick={() => {
          _handleAdd();
        }}
        style={{ marginBottom: 20 }}
      >
        新增
      </AuthButton>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={'分支机构'}
        />
      )}
      <Search
        filters={[{ type: 'Input', field: 'branchname', placeholder: '分支机构' }]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <Table {...tableProps} columns={columns} rowKey="bid" />
    </>
  );
}
