import React, { useState } from 'react';
import { message, Table } from 'antd';
import { useFetch, useTablePagination, useSearch, useOptions, useHash, useForceUpdate, useAuth } from 'hooks';
import { _getStudent, _addReview } from './_api';
import { _getStudentList } from 'api';
import { Search, IModal } from 'components';
import { insertWhen, _get } from 'utils';

function Review(props: any) {
  const { onCancel, title, onOk, currentRecord } = props;
  const [search, _handleSearch] = useSearch({ sid: _get(currentRecord, 'sid', '') });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [loading, setLoading] = useState(false);

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getStudent,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      subject: _get(search, 'subject'),
      sid: _get(search, 'sid'),
      status: _get(search, 'status'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([]);
    },
  });

  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型
  const reportStatusHash = useHash('report_status_type'); // 报审状态

  // FIXME:改部分根据老倪提出，更改了排序及展示字段
  const columns = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
    },
    {
      title: '评判描述',
      dataIndex: 'msg',
      // 接口侧要求以 ; 作为分隔换行显示
      render: (msg: any) => (
        <div>
          {(msg || '').split(';').map((x: any, index: number) => (
            <div key={index}>{x}</div>
          ))}
        </div>
      ),
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
    },
    {
      title: '可报审学时/分钟',
      dataIndex: 'traintime',
      render: (traintime: any) => (traintime ? `${traintime}分钟` : ''),
    },
    {
      title: '可报审里程/分钟',
      dataIndex: 'mileage',
      render: (mileage: any) => (mileage ? `${mileage}公里` : ''),
    },
    ...insertWhen(useAuth('student/phasedReview:traincerttime'), [
      {
        title: (
          <>
            <div>已训学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'traincerttime',
      },
    ]),
    ...insertWhen(useAuth('student/phasedReview:outlineCertTotaltime'), [
      {
        title: (
          <>
            <div>额定学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'outlineCertTotaltime',
      },
    ]),
    {
      title: '学驾车型',
      dataIndex: 'traintype',
    },
    {
      title: '大纲规定学时',
      dataIndex: 'outlineTotaltime',
      render: (outlineTotaltime: any) => (outlineTotaltime ? `${outlineTotaltime}分钟` : ''),
    },
    {
      title: '大纲规定里程',
      dataIndex: 'outlineMileage',
      render: (outlineMileage: any) => (outlineMileage ? `${outlineMileage}公里` : ''),
    },
    {
      title: '报审状态',
      dataIndex: 'status',
      render: (status: any) => reportStatusHash[status],
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
      <IModal
        spinning={isLoading || loading}
        visible
        width={1100}
        title={title}
        confirmLoading={loading}
        okButtonProps={{
          disabled: selectedRowKeys.length === 0,
        }}
        maskClosable={false}
        onCancel={onCancel}
        onOk={async () => {
          let errCount = 0;
          setLoading(true);
          for (let i = 0; i < selectedRowKeys.length; i++) {
            const res = await _addReview({ applyPrestepId: selectedRowKeys[i] });
            if (_get(res, 'code') !== 200) {
              errCount++;
            }
          }
          setLoading(false);

          if (errCount === 0) {
            onOk();
            message.success('全部报审成功');
          } else {
            message.error(`有${errCount}条记录报审失败`);
            forceUpdate();
          }
        }}
      >
        <Search
          studentOptionData={
            currentRecord
              ? [
                  {
                    value: _get(currentRecord, 'sid'),
                    label: _get(currentRecord, 'name') + '-' + _get(currentRecord, 'idcard'),
                  },
                ]
              : []
          }
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
              field: 'subject',
              options: [{ value: '', label: '报审类型(全部)' }, ...useOptions('SchoolSubjectApply')],
            },
            {
              type: 'Select',
              field: 'status',
              options: [{ value: '', label: '报审状态(全部)' }, ...useOptions('report_status_type')],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          customRequest={_getStudentList}
          extraParamsForCustomRequest={{ status: '01' }}
        />
        <Table
          columns={columns}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'id')}
          pagination={tablePagination}
        />
      </IModal>
    </>
  );
}

export default Review;
