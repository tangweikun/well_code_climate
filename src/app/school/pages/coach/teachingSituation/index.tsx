import React, { useState } from 'react';
import { useSearch, useTablePagination, useFetch, useForceUpdate, useHash, useVisible } from 'hooks';
import { _getFinalAssess } from './_api';
import { _getStudentList } from 'api';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Search } from 'components';
import { _get } from 'utils';
import Details from 'app/school/pages/student/teachingJournal/Details';

function TeachingSituation() {
  const [search, _handleSearch]: any = useSearch({
    signstarttime_start: moment().subtract(30, 'day'),
    signstarttime_end: moment(),
  });
  const [visible, _switchVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    { title: '学员证件号', dataIndex: 'stu_idcard' },
    { title: '培训部分', dataIndex: 'subjectcode', render: (subjectcode: any) => subjectcodeHash[subjectcode] },
    { title: '课程方式', dataIndex: 'traincode', render: (traincode: any) => traincodeHash[traincode] },
    { title: '签到时间', dataIndex: 'signstarttime' },
    { title: '签退时间', dataIndex: 'signendtime' },
    { title: '有效训练时长', dataIndex: 'validtime' },
    { title: '有效训练里程', dataIndex: 'validmileage' },
    { title: '车牌号', dataIndex: 'licnum' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <Button
            onClick={() => {
              setCurrentRecord(record);
              _switchVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </Button>
        </div>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getFinalAssess,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      signstarttime_start: _get(search, 'signstarttime_start')
        ? moment(_get(search, 'signstarttime_start')).format('YYYY-MM-DD')
        : '',
      signstarttime_end: _get(search, 'signstarttime_end')
        ? moment(_get(search, 'signstarttime_end')).format('YYYY-MM-DD')
        : '',
      stuid: _get(search, 'stuid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      {visible && <Details onCancel={_switchVisible} currentRecord={currentRecord} />}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['signstarttime_start', 'signstarttime_end'],
            placeholder: ['训练日期起', '训练日期止'],
            otherProps: { allowClear: false, defaultValue: [search.signstarttime_start, search.signstarttime_end] },
          },
          {
            type: 'CustomSelect',
            field: 'stuid',
            placeholder: '学员姓名',
            options: [
              { label: '学员姓名', value: 'name' },
              { label: '学员证件', value: 'idcard' },
            ],
          },
          // { type: 'Input', field: 'stu_idcard', placeholder: '学员证件' },//1
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
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'classid')}
        pagination={tablePagination}
      />
    </>
  );
}

export default TeachingSituation;
