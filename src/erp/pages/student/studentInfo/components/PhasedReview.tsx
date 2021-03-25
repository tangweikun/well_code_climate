import React from 'react';
import { Table, Button } from 'antd';
import Review from '../../phasedReview/Review';
import { useFetch, useTablePagination, useVisible, useForceUpdate, useHash } from 'hooks';
import { _getFinalAssess, _getReport } from '../../phasedReview/_api';
import { previewPdf, _get } from 'utils';

function AssesserInfo(props: any) {
  const { sid } = props;
  const [visible, _switchVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  const subjectHash = useHash('subject'); // 报审类型

  const { isLoading, data } = useFetch({
    request: _getFinalAssess,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sid,
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const SubjectApplyStatusHash = useHash('SubjectApplyStatus'); // 报审类型
  const genderHash = useHash('gender_type'); //性别

  const columns = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
    },
    {
      title: '申请日期',
      dataIndex: 'createtime',
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (subject: any) => genderHash[subject],
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
    },
    {
      title: '学驾车型',
      dataIndex: 'traintype',
    },
    {
      title: '核实状态',
      dataIndex: 'isapply',
      render: (isapply: any) => SubjectApplyStatusHash[isapply],
    },
    {
      title: '提交人',
      dataIndex: 'applyname',
    },
    {
      title: '提交时间',
      dataIndex: 'applytime',
    },
    {
      title: '核实日期',
      dataIndex: 'resptime',
    },
    {
      title: '备注',
      dataIndex: 'respmsg',
    },
    {
      title: '三联单显示',
      dataIndex: 'preivewFlag',
      render: (preivewFlag: string, record: any) =>
        // preivewFlag (string)  0-不展示三联单  1-展示三联单
        preivewFlag === '1' && (
          <span
            className="color-primary pointer"
            onClick={async () => {
              const res = await _getReport({ id: _get(record, 'said') });
              previewPdf(_get(res, 'data'), false);
            }}
          >
            查看三联单
          </span>
        ),
    },
  ];

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <div>
      {visible && <Review onCancel={_switchVisible} onOk={_handleOk} title="初审信息" />}

      <Button type="primary" onClick={() => _switchVisible()} style={{ marginBottom: 20 }}>
        去报审
      </Button>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'said')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default AssesserInfo;
