import React from 'react';
import { Table } from 'antd';
import { useOptions, useTablePro } from 'hooks';
import { _get } from 'utils';
import { _getTestResultList } from './_api';
import { Search } from 'components';
import { _getCoachList } from 'api';
interface IProps {
  period: string;
}

export default function TestResultList(props: IProps) {
  const { period } = props;
  const { tableProps, search, _refreshTable, _handleSearch, _data } = useTablePro({
    request: _getTestResultList,
    extraParams: {
      period: period,
    },
  });

  const columns = [
    { title: '账号', dataIndex: 'phone' },
    { title: '姓名', dataIndex: 'studentName' },
    { title: '证件号', dataIndex: 'idNumber' },
    { title: '性别', dataIndex: 'sex' },
    { title: '车型', dataIndex: 'testCarModel' },
    { title: '报名日期', dataIndex: 'applyDateTime' },
    { title: '班级', dataIndex: 'sex' }, //TODO
    { title: '教练', dataIndex: 'coaName' },
    { title: '考试科目', dataIndex: 'testSubject' },
    { title: '考出日期', dataIndex: 'testDateTime' },
  ];
  return (
    <>
      <Search
        filters={[
          {
            type: 'Select',
            field: 'testSubject',
            options: [{ label: '科目(全部)', value: '' }, ...useOptions('trans_part_type')],
          },
          {
            type: 'CustomSelectOfCoach',
            field: 'cid',
            placeholder: '教练姓名',
            options: [
              { label: '教练姓名', value: 'coachname' },
              { label: '教练证件', value: 'idcard' },
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customCoachRequest={_getCoachList}
      />

      <div style={{ marginBottom: 10, fontSize: 16 }}>
        {'日期区间：' + _get(_data, 'startDate', '') + ' - ' + _get(_data, 'endDate', '')}
      </div>
      <Table {...tableProps} columns={columns} rowKey={() => Math.random()} />
    </>
  );
}
