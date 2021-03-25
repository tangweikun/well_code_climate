// 班级信息管理
import React, { useState } from 'react';
import { _get } from 'utils';
import { Switch, Table } from 'antd';
import {
  useOptions,
  useRequest,
  useHash,
  useTablePagination,
  useSearch,
  useFetch,
  useForceUpdate,
  useVisible,
  useConfirm,
} from 'hooks';
import { _getClassList, _updateStatusCD, _deleteClass, _registerClass } from './_api';
import { Search, AuthButton } from 'components';
import AddOrEdit from './AddOrEdit';

export default function ClassInfo() {
  const { loading, run } = useRequest(_updateStatusCD);
  const [visible, _switchVisible] = useVisible();
  const [search, _handleSearch] = useSearch();
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [_showConfirm] = useConfirm();

  const registerHash = useHash('stu_record_status_type');
  const studentTypeHash = useHash('student_type');
  const { isLoading, data } = useFetch({
    request: _getClassList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      packlabel: _get(search, 'packlabel'),
      traintype: _get(search, 'traintype'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  // 注销
  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteClass, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 备案
  const { loading: recordLoading, run: recordRun } = useRequest(_registerClass, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleAdd() {
    setCurrentId(null);
    _switchVisible();
    setIsEdit(false);
  }

  const columns = [
    {
      title: '班级名称',
      dataIndex: 'packlabel',
    },
    {
      title: '车型',
      dataIndex: 'traintype',
    },
    {
      title: '班级分类',
      dataIndex: 'studenttype',
      render: (studenttype: any) => studentTypeHash[studenttype],
    },
    {
      title: '班费',
      dataIndex: 'train_price',
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
    {
      // 1: 未启用；2: 启用；
      title: '启用状态',
      dataIndex: 'status_cd',
      render: (status_cd: string, record: any) => (
        <Switch
          loading={_get(currentRecord, 'packid') === _get(record, 'packid') && loading}
          defaultChecked={status_cd === '2'}
          onChange={(checked) => {
            setCurrentRecord(record);
            run({ packid: _get(record, 'packid'), status_cd: checked ? '2' : '1' });
          }}
        />
      ),
    },
    {
      title: '备案状态',
      dataIndex: 'registered_flag',
      render: (registered_flag: any) => registerHash[registered_flag],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <AuthButton
              authId="trainingInstitution/classInfo:btn3"
              className="operation-button"
              onClick={() => {
                _switchVisible();
                setCurrentId(_get(record, 'packid'));
                setIsEdit(true);
              }}
              type="primary"
              ghost
              size="small"
            >
              编辑
            </AuthButton>
            <AuthButton
              loading={_get(currentRecord, 'packid') === _get(record, 'packid') && deleteLoading}
              authId="trainingInstitution/classInfo:btn2"
              onClick={() =>
                _showConfirm({
                  title: '确定要注销这条数据吗',
                  handleOk: async () => {
                    setCurrentRecord(record);
                    deleteRun({ id: _get(record, 'packid') });
                  },
                })
              }
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              注销
            </AuthButton>
            {_get(record, 'registered_flag') !== '1' && (
              <AuthButton
                loading={_get(currentRecord, 'packid') === _get(record, 'packid') && recordLoading}
                authId="trainingInstitution/classInfo:btn4"
                className="operation-button"
                onClick={() => {
                  recordRun({ id: _get(record, 'packid') });
                }}
                type="primary"
                ghost
                size="small"
              >
                备案
              </AuthButton>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑班级信息' : '新增班级信息'}
        />
      )}

      <Search
        filters={[
          { type: 'Input', field: 'packlabel', placeholder: '班级名称' },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '准教车型(全部)' }, ...useOptions('business_scope')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton authId="trainingInstitution/classInfo:btn1" type="primary" onClick={_handleAdd} className="mb20">
        新增
      </AuthButton>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'packid')}
        pagination={tablePagination}
      />
    </>
  );
}
