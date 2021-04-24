// 学员退学管理
import React, { useState } from 'react';
import {
  useOptions,
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useConfirm,
  useHash,
  useVisible,
  useRequest,
} from 'hooks';
import { _getInfo, _reviewStudentRetire, _cancelStuLation } from './_api';
import { _getStudentList } from 'api';
import { Table } from 'antd';
import { AuthButton, Search } from 'components';
import { _get } from 'utils';
import ApplyDropped from './ApplyDropped';

function StudentDropped() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [_showConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [agreeLoading, setAgreeLoading] = useState(false);
  const [refuseLoading, setRefuseLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const isapplyDropHash = useHash('isapply_drop'); // 申请状态
  const [currentRecord, setCurrentRecord] = useState(null);

  const { loading: cancelationLoading, run } = useRequest(_cancelStuLation, {
    onSuccess: forceUpdate,
  });
  const columns = [
    { title: '学号', dataIndex: 'studentnum' },
    { title: '学员姓名', dataIndex: 'name' },
    { title: '证件号码', dataIndex: 'idcard' },
    { title: '申请日期', dataIndex: 'applytime' },
    { title: '申请状态', dataIndex: 'isapply', render: (isapply: any) => isapplyDropHash[isapply] },
    { title: '退学理由', dataIndex: 'applymemo' },
    { title: '经办人', dataIndex: 'applyname' },
    { title: '核实时间', dataIndex: 'resptime1' },
    { title: '审核人', dataIndex: 'checkname' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          {_get(record, 'isapply') === '0' && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && agreeLoading}
              authId="student/studentDropped:btn2"
              onClick={() => {
                setCurrentRecord(record);

                function retire() {
                  _showConfirm({
                    title: '退学后，将注销相关学员备案信息，是否继续同意学员退学？',
                    handleOk: async () => {
                      setAgreeLoading(true);
                      const res = await _reviewStudentRetire(
                        { id: _get(record, 'said'), isapply: '2' },
                        { menuId: 'studentDropped', elementId: 'student/studentDropped:btn2' },
                      );
                      if (_get(res, 'code') === 200) {
                        setPagination({ ...pagination, current: 1 });
                        forceUpdate();
                      }
                      setAgreeLoading(false);
                    },
                  });
                }

                if (
                  (_get(record, 'stuchargemode') === '1' || _get(record, 'stuchargemode') === '2') &&
                  _get(record, 'bankaccount')
                ) {
                  _showConfirm({
                    title: '退学前将先完成资金结算，并注销学员资金账户，是否继续？',
                    handleOk: retire,
                  });
                  return;
                }

                if (_get(record, 'stuchargemode') === '4' && _get(record, 'bankaccount')) {
                  _showConfirm({
                    title: '退学前将先完成资金结算，是否继续？',
                    handleOk: retire,
                  });
                  return;
                }

                retire();
              }}
              className="operation-button"
            >
              同意
            </AuthButton>
          )}
          {_get(record, 'isapply') === '0' && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && refuseLoading}
              authId="student/studentDropped:btn3"
              onClick={async () => {
                setCurrentRecord(record);
                setRefuseLoading(true);
                const res = await _reviewStudentRetire(
                  { id: _get(record, 'said'), isapply: '3' },
                  { menuId: 'studentDropped', elementId: 'student/studentDropped:btn3' },
                );
                if (_get(res, 'code') === 200) {
                  setPagination({ ...pagination, current: 1 });
                  forceUpdate();
                }

                setRefuseLoading(false);
              }}
              className="operation-button"
            >
              拒绝
            </AuthButton>
          )}
          {_get(record, 'isapply') === '0' && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelLoading}
              authId="student/studentDropped:btn4"
              onClick={() =>
                _showDeleteConfirm({
                  handleOk: async () => {
                    setCurrentRecord(record);
                    setCancelLoading(true);
                    const res = await _reviewStudentRetire(
                      { id: _get(record, 'said'), isapply: '4' },
                      { menuId: 'studentDropped', elementId: 'student/studentDropped:btn4' },
                    );
                    if (_get(res, 'code') === 200) {
                      setPagination({ ...pagination, current: 1 });
                      forceUpdate();
                    }
                    setCancelLoading(false);
                  },
                })
              }
              className="operation-button"
            >
              撤销
            </AuthButton>
          )}
          {_get(record, 'isapply') === '2' && ( //同意时显示
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelationLoading}
              authId="student/studentDropped:btn5"
              onClick={() => {
                setCurrentRecord(record);
                run({ id: _get(record, 'said') });
              }}
              className="operation-button"
            >
              监管注销
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      applydatebegin: _get(search, 'applydatebegin'),
      applydateend: _get(search, 'applydateend'),
      idcard: _get(search, 'idcard'),
      isapply: _get(search, 'isapply'),
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      {visible && (
        <ApplyDropped
          onCancel={() => {
            _switchVisible();
          }}
          onOk={() => {
            _switchVisible();
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
        />
      )}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['applydatebegin', 'applydateend'],
            placeholder: ['申请日期起', '申请日期止'],
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
            field: 'isapply',
            options: [{ value: '', label: '审核状态(全部)' }, ...useOptions('isapply_drop', false, '-1', ['1'])], // 1:已提交，此处要排除已提交
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

      <AuthButton
        authId="student/studentDropped:btn1"
        type="primary"
        onClick={() => {
          _switchVisible();
        }}
        style={{ marginBottom: 20 }}
      >
        退学申请
      </AuthButton>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'said')}
        pagination={tablePagination}
      />
    </>
  );
}

export default StudentDropped;
