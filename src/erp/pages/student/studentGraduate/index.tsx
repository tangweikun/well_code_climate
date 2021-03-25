// 学员结业管理
import React, { useState } from 'react';
import {
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useHash,
  useVisible,
  useOptions,
  useRequest,
} from 'hooks';
import { _getStudentFace, _getFileUrl, _upload, _exportGraduatesListBefore, _export } from './_api';
import { _getStudentList } from 'api';
import { Table, message } from 'antd';
import { AuthButton, Search } from 'components';
import Add from './Add';
import ReviewResult from './ReviewResult';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../../student/studentInfo/Details';
import GraduateReview from './GraduateReview';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { downloadFile, _get } from 'utils';

function StudentGraduate() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const [graduateVisible, _switchGraduateVisible] = useVisible();
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState({});
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');

  const isApplyStuHAsh = useHash('isapply_stu');

  const { loading: uploadLoading, run: uploadRun } = useRequest(_upload, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      render: (name: string, record: any) => {
        return (
          <div
            className="pointer"
            style={{ color: PRIMARY_COLOR }}
            onClick={() => {
              _switchDetailsVisible();
              setSid(_get(record, 'sid'));
            }}
          >
            {name}
          </div>
        );
      },
    },
    { title: '学员证件号', dataIndex: 'idcard' },
    { title: '车型', dataIndex: 'traintype' },
    { title: '申请人', dataIndex: 'applyname' },
    { title: '申请时间', dataIndex: 'createtime' },
    { title: '结业证号', dataIndex: 'JYZNUMCODE' },
    { title: '核实状态', dataIndex: 'isapply', render: (isapply: string) => isApplyStuHAsh[isapply] },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          {_get(record, 'isapply') === '1' && (
            <AuthButton
              authId="student/studentGraduate:btn2"
              onClick={async () => {
                const res = await _getFileUrl({ id: _get(record, 'sid') });
                if (_get(res, 'code') === 200) {
                  window.open(_get(res, 'data'));
                }
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              结业证查看
            </AuthButton>
          )}

          {_get(record, 'isapply') === '0' && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && uploadLoading}
              authId="student/studentGraduate:btn3"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setCurrentRecord(record);
                uploadRun({ said: _get(record, 'said') });
              }}
            >
              上传
            </AuthButton>
          )}
          {/* {_get(record, 'isapply') !== '2' && ( // isapply审核状态  2：同意
            <AuthButton
              authId="student/studentGraduate:btn4"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setCurrentRecord(record);
                _switchReviewVisible();
              }}
            >
              结业审核
            </AuthButton>
          )} */}
        </div>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getStudentFace,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sdate: _get(search, 'sdate'),
      edate: _get(search, 'edate'),
      idcard: _get(search, 'idcard'),
      name: _get(search, 'name'),
      isapply: _get(search, 'isapply'),
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <>
      {visible && <Add onCancel={_switchVisible} onOk={_handleOk} />}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} />}

      {/* 结业审核 */}
      {graduateVisible && <GraduateReview onCancel={_switchGraduateVisible} />}

      {reviewVisible && (
        <ReviewResult
          onCancel={_switchReviewVisible}
          currentRecord={currentRecord}
          onOk={() => {
            _switchReviewVisible();
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['申请日期开始', '申请日期结束'],
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
            options: [{ value: '', label: '核实状态(全部)' }, ...useOptions('isapply_stu')],
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
        authId="student/studentGraduate:btn1"
        type="primary"
        className="mr20 mb20"
        onClick={() => {
          _switchVisible();
        }}
      >
        结业申请
      </AuthButton>

      <AuthButton
        authId="student/studentGraduate:btn4"
        type="primary"
        className="mr20 mb20"
        onClick={() => {
          _switchGraduateVisible();
        }}
      >
        结业审核
      </AuthButton>

      <AuthButton
        authId="student/studentGraduate:btn5"
        icon={<DownloadOutlined />}
        onClick={async () => {
          if (!_get(search, 'sdate') || !_get(search, 'edate')) {
            message.error('请选择申请日期');
            return;
          }

          if (
            _get(search, 'sdate') &&
            _get(search, 'edate') &&
            moment(_get(search, 'edate')).diff(moment(_get(search, 'sdate')), 'day') > 92
          ) {
            message.error('时间跨度不能超过3个月');
            return;
          }

          const query = {
            sdate: _get(search, 'sdate'),
            edate: _get(search, 'edate'),
          };

          const res = await _exportGraduatesListBefore(query);

          if (_get(res, 'code') === 200) {
            _export(query).then((res: any) => {
              downloadFile(res, '结业名单', 'application/vnd.ms-excel', 'xlsx');
            });
          } else {
            message.error(_get(res, 'message'));
          }
        }}
      >
        导出
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

export default StudentGraduate;
