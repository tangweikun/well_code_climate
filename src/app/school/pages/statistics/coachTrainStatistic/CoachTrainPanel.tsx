import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { _get } from 'utils';
import { _getInfo } from './_api';
import { useHash, useTablePro, useVisible } from 'hooks';
import { Search } from 'components';
import CoachClassRecord from './CoachClassRecord';
import { _getCoachList } from 'api';

interface IProps {
  statisticType: number;
}

function CoachTrainPanel(props: IProps) {
  const { statisticType } = props;
  const genderHash = useHash('gender_type');
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getInfo,
    extraParams: {
      statisticType,
    },
  });
  const [classRecordVisible, setClassRecordVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState(null);
  const columns = [
    { title: '教练员', dataIndex: 'cname' },
    { title: '性别', dataIndex: 'sex', render: (sex: any) => genderHash[sex] },
    { title: '证件号', dataIndex: 'idCardNo' },
    { title: '联系电话', dataIndex: 'phone' },
    { title: '准教车型', dataIndex: 'trainCarType' },
    // { title: '科目', dataIndex: 'createtime' },
    { title: '车牌号', dataIndex: 'licNum' },
    { title: '带教人数', dataIndex: 'statisticStuNum' },
    { title: '科目二', dataIndex: 'statisticSubject2StuNum' },
    { title: '科目三', dataIndex: 'statisticSubject3StuNum' },
    { title: '总时长', dataIndex: 'statisticTimeSum' },
    { title: '总里程', dataIndex: 'statisticMileSum' },
    { title: '日均时长', dataIndex: 'statisticTimeDay' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <Button
          // authId="pushManagement/studentPushRecord:btn1"
          // loading={_get(currentRecord, 'sid') === _get(record, 'sid') && pushLoading}
          onClick={() => {
            setCurrentRecord(record);
            setClassRecordVisible();
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          明细
        </Button>
      ),
    },
  ];

  return (
    <>
      {classRecordVisible && <CoachClassRecord onCancel={setClassRecordVisible} currentRecord={currentRecord} />}
      <Search
        filters={[
          {
            type: 'CustomSelectOfCoach',
            field: 'cid',
            placeholder: '教练姓名',
            options: [
              { label: '教练姓名', value: 'coachname' },
              { label: '教练证件', value: 'idcard' },
            ],
          },
          { type: 'Input', field: 'phone', placeholder: '联系电话' },
          {
            type: 'Select',
            field: 'subjectCode',
            options: [
              { label: '科目(全部)', value: '' },
              { label: '科目二', value: '2' }, // 此处仅需要科二科三，与乙元商量，前端写死，不走数据字典。
              { label: '科目三', value: '3' },
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customCoachRequest={_getCoachList}
      />

      {_get(tableProps, 'dataSource.length', 0) > 0 && (
        <div style={{ marginBottom: 10, fontSize: 16 }}>
          {'日期区间：' +
            _get(tableProps, 'dataSource.0.statisticStartTime', '') +
            ' - ' +
            _get(tableProps, 'dataSource.0.statisticEndTime', '')}
        </div>
      )}

      <Table {...tableProps} columns={columns} rowKey="cid" />
    </>
  );
}

export default CoachTrainPanel;
