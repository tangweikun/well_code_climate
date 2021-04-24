// 签到复位
import React, { useState } from 'react';
import { useSearch, useTablePagination, useFetch, useForceUpdate, useHash, useVisible, useOptions } from 'hooks';
import { _getTraStuSignList } from './_api';
import { Table } from 'antd';
import { AuthButton, Search } from 'components';
import { _get } from 'utils';
import AddOrEdit from './addOrEdit';
import ChangeReset from './ChangeReset';

function SignReset() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const [changeVisible, _switchChangeVisible] = useVisible();
  const [idCard, setIdCard] = useState<string>();
  const [type, setType] = useState<any>();

  const personTypeHash = useHash('human_type');

  const columns = [
    { title: '人员类别', dataIndex: 'type', render: (type: any) => personTypeHash[type] },
    { title: '人员姓名', dataIndex: 'name' },
    { title: '人员证件证号', dataIndex: 'idcard' },
    { title: '签到时间', dataIndex: 'signintime' },
    { title: '签到车牌号', dataIndex: 'licnum' },
    { title: '签到设备号', dataIndex: 'termcode' },
    { title: '复位人', dataIndex: 'operateuser' },
    { title: '复位时间', dataIndex: 'operatetime' },
  ];

  const { isLoading, data } = useFetch({
    request: _getTraStuSignList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      operatetimestart: _get(search, 'operatetimestart'),
      operatetimeend: _get(search, 'operatetimeend'),
      type: _get(search, 'type'),
      name: _get(search, 'name'),
      licnum: _get(search, 'licnum'),
      termcode: _get(search, 'termcode'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            _switchChangeVisible();
          }}
          setIdCard={setIdCard}
          idCard={idCard}
          type={type}
        />
      )}

      {changeVisible && (
        <ChangeReset
          onCancel={_switchChangeVisible}
          onOk={() => {
            _switchChangeVisible();
            forceUpdate();
          }}
          idCard={idCard}
          type={type}
        />
      )}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['operatetimestart', 'operatetimeend'],
            placeholder: ['复位时间起', '复位时间止'],
          },
          {
            type: 'Select',
            field: 'type',
            placeholder: '人员类别',
            options: [{ value: '', label: '人员类别(全部)' }, ...useOptions('human_type')],
          },
          { type: 'Input', field: 'name', placeholder: '人员姓名' },
          { type: 'Input', field: 'licnum', placeholder: '车牌号' },
          { type: 'Input', field: 'termcode', placeholder: '设备号' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton
        authId="teach/signReset:btn1"
        type="primary"
        style={{ margin: '0 20px 20px 0' }}
        onClick={() => {
          _switchVisible();
          setType('1');
          setIdCard('');
        }}
      >
        学员复位
      </AuthButton>

      <AuthButton
        authId="teach/signReset:btn2"
        type="primary"
        style={{ margin: '0 20px 20px 0' }}
        onClick={() => {
          _switchVisible();
          setType('2');
          setIdCard('');
        }}
      >
        教练复位
      </AuthButton>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'id')}
        pagination={tablePagination}
      />
    </>
  );
}

export default SignReset;
