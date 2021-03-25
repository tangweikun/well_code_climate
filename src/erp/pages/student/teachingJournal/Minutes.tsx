import React, { useState } from 'react';
import { Table } from 'antd';
import { _get } from 'utils';
import { useFetch, useHash, useTablePagination, useVisible, useForceUpdate } from 'hooks';
import { _getMinutes, _setMinState } from './_api';
import Reason from './Reason';
import { AuthButton, PopoverImg } from 'components';

export default function AddOrEdit(props: any) {
  const { currentRecord, isTrainingDetail = false } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [visible, _switchVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [rowKeys, setRowKeys] = useState<any>([]);
  const traincodeHash = useHash('subject_type'); // 签到状态
  const crstateMinutesHash = useHash('min_crstate_type'); // 是否有效
  const subjectcodeHash = useHash('trans_part_type'); // 培训阶段
  const reviewTypeHash = useHash('review_type'); // 培训阶段

  const commonColumns = [
    { title: '培训时间', dataIndex: 'dev_time' },
    {
      title: '培训照片',
      dataIndex: 'photos',
      render: (photos: any) => {
        return photos.map((x: any) => (
          <PopoverImg src={_get(x, 'url', '')} imgStyle={{ width: 60, height: 60, margin: '0 20px 20px 0' }} />
        ));
      },
    },
    { title: '照片数', dataIndex: 'photos', render: (photos: any) => photos.length },
    { title: '培训阶段', dataIndex: 'subjectcode', render: (crstate: any) => subjectcodeHash[crstate] },
    { title: '培训类型', dataIndex: 'traincode', render: (traincode: any) => traincodeHash[traincode] },
    { title: '是否有效', dataIndex: 'crstate', render: (crstate: any) => crstateMinutesHash[crstate] },
    { title: '无效原因', dataIndex: 'reason' },
    { title: '发动机转速', dataIndex: 'rpm' },
    { title: '培训里程（公里）', dataIndex: 'mileage' },
    { title: '最高时速', dataIndex: 'maxspeed' },
    { title: '平均时速', dataIndex: 'avgspeed' },
    { title: '经度', dataIndex: 'longitude' },
    { title: '纬度', dataIndex: 'latitude' },
    { title: '采集时间', dataIndex: 'create_date' },
    { title: '审核类型', dataIndex: 'review_type', render: (review_type: any) => reviewTypeHash[review_type] },
  ];

  const rowIndex = {
    title: '序号',
    width: 200,
    dataIndex: 'index',
    render: (_: any, record: any, index: number) => {
      let color = (index + 1) % 15 === 0 ? { color: 'red' } : {}; //对应15的倍数的序号，显示颜色标红
      return <div style={color}>{index + 1}</div>;
    },
  };

  const columns = isTrainingDetail ? [rowIndex, ...commonColumns] : commonColumns;

  const { isLoading, data } = useFetch({
    request: _getMinutes,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime', ''),
    },
    depends: [ignore, pagination.current, pagination.pageSize, currentRecord],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      const rowKeysArr: any[] = [];
      for (let i = 0; i < _get(data, 'rows.length', 0); i++) {
        rowKeysArr.push(data.rows[i].trainid);
      }
      setRowKeys(rowKeysArr);
      setSelectedRowKeys([]);
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  async function _handleEffective() {
    const query = {
      classid: _get(currentRecord, 'classid'),
      crstate: '1',
      signstarttime: _get(currentRecord, 'signstarttime'),
      subjectcode: _get(currentRecord, 'subjectcode'),
      trainids: selectedRowKeys.join(','),
    };
    const res = await _setMinState(query, {
      menuId: 'trainingDetailReview',
      elementId: 'student/trainingDetailReview:btn4',
    });
    if (_get(res, 'code') === 200) {
      forceUpdate();
      setSelectedRowKeys([]);
    }
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setSelectedRowKeys([]);
  }

  return (
    <>
      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={_handleOk}
          query={{
            classid: _get(currentRecord, 'classid'),
            crstate: '2',
            signstarttime: _get(currentRecord, 'signstarttime'),
            subjectcode: _get(currentRecord, 'subjectcode'),
            trainids: selectedRowKeys.join(','),
          }}
          invalidReasonWay={'section'}
        />
      )}
      {_get(currentRecord, 'checkstatus_jg') === '0' && (
        <>
          <AuthButton
            authId="student/trainingDetailReview:btn4"
            disabled={selectedRowKeys.length === 0}
            type="primary"
            style={{ margin: '0 20px 20px 0' }}
            onClick={() => {
              _handleEffective();
            }}
          >
            设为有效
          </AuthButton>
          <AuthButton
            authId="student/trainingDetailReview:btn5"
            disabled={selectedRowKeys.length === 0}
            type="primary"
            style={{ margin: '0 20px 20px 0' }}
            onClick={() => {
              _switchVisible();
            }}
          >
            设为无效
          </AuthButton>
        </>
      )}

      {isTrainingDetail && (
        <AuthButton
          authId="student/trainingDetailReview:btn6"
          disabled={selectedRowKeys.length === 0}
          type="primary"
          style={{ margin: '0 20px 20px 0' }}
          onClick={() => {
            let newSelect: any[] = [];
            rowKeys.forEach((item: any) => {
              if (!selectedRowKeys.includes(item)) {
                newSelect.push(item);
              }
            });
            setSelectedRowKeys(newSelect);
          }}
        >
          反选
        </AuthButton>
      )}

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        scroll={isTrainingDetail ? { x: 800, y: 500 } : undefined}
        rowSelection={
          _get(currentRecord, 'checkstatus_jg') === '0'
            ? {
                type: 'checkbox',
                ...rowSelection,
                selections: [
                  Table.SELECTION_ALL, //全选
                  Table.SELECTION_INVERT, //反选
                ],
              }
            : undefined
        }
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'trainid')}
        pagination={tablePagination}
      />
    </>
  );
}
