// 教练投诉管理
import React from 'react';
import { useSearch, useTablePagination, useOptions, useFetch, useForceUpdate, useVisible, useHash } from 'hooks';
import { _getEvaluationList } from './_api';
import { Table, Rate } from 'antd';
import Add from './Add';
import { AuthButton, Search } from 'components';
import { generateIdForDataSource, _get } from 'utils';

export default function CoachEvaluation(props: any) {
  const { isTrainingInstitution = false } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const partHash = useHash('trans_part_type');
  const columns = [
    {
      title: '评价人',
      dataIndex: 'name',
    },
    {
      title: '评价对象',
      dataIndex: 'coachname',
      hide: isTrainingInstitution,
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
      hide: isTrainingInstitution,
    },
    {
      title: '车牌号码',
      dataIndex: 'licnum',
      hide: isTrainingInstitution,
    },
    {
      title: '准教证号',
      dataIndex: 'occupationno',
      hide: isTrainingInstitution,
    },
    {
      title: '评价对象类型',
      dataIndex: 'type', //评价类型 1：教练员 2：评价机构
      render: (type: any) => {
        return Number(type) === 1 ? '教练员' : '培训机构';
      },
    },
    {
      title: '总体满意度',
      dataIndex: 'overall', //总体满意度 1：一星 2：二星 3：三星 4：四星 5：五星（最满意）
      render: (overall: any) => {
        return <Rate disabled value={overall} />;
      },
    },
    {
      title: '培训部分',
      dataIndex: 'part', //培训部分 1：第一部分 2：第二部分 3：第三部分 4：第四部分
      render: (part: any) => partHash[part],
    },
    {
      title: '评价时间',
      dataIndex: 'evaluatetime',
    },
    {
      title: '评价用语列表',
      dataIndex: 'srvmanner',
    },
    {
      title: '个性化评价',
      dataIndex: 'teachlevel',
    },
  ];
  const lastColumns: any = columns.filter((index: any) => {
    return index.hide !== true;
  });
  const coachFilters: any = isTrainingInstitution //培训机构页面没有如下几个过滤项
    ? []
    : [
        { type: 'Input', field: 'occupationno', placeholder: '准教证号' },
        { type: 'Input', field: 'licnum', placeholder: '车牌号码' },
        { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
        { type: 'Input', field: 'idcard', placeholder: '证件号码' },
      ];
  const { isLoading, data } = useFetch({
    request: _getEvaluationList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      licnum: _get(search, 'licnum'),
      occupationno: _get(search, 'occupationno'),
      teachpermitted: _get(search, 'teachpermitted'),
      evaluatetimeStart: _get(search, 'evaluatetimeStart'),
      evaluatetimeEnd: _get(search, 'evaluatetimeEnd'),
      overall: _get(search, 'overall'),
      part: _get(search, 'part'),
      type: isTrainingInstitution ? 2 : 1,
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
  let authId = isTrainingInstitution
    ? 'trainingInstitution/trainingInstitutionEvaluation:btn1'
    : 'coach/coachEvaluation:btn1';

  return (
    <>
      {visible && <Add onCancel={_switchVisible} onOk={_handleOk} isTrainingInstitution={isTrainingInstitution} />}

      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['evaluatetimeStart', 'evaluatetimeEnd'],
            placeholder: ['评价时间(起)', '评价时间(止)'],
          },
          ...coachFilters,
          {
            type: 'Select',
            field: 'part',
            options: [{ value: '', label: '培训部分(全部)' }, ...useOptions('trans_part_type')],
          }, //培训部分
          {
            type: 'Select',
            field: 'overall',
            options: [{ value: '', label: '总体满意度(全部)' }, ...useOptions('overall_type')],
          }, //总体满意度
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton
        authId={authId}
        type="primary"
        className="mr20 mb20"
        onClick={() => {
          _switchVisible();
        }}
      >
        新增
      </AuthButton>

      <Table
        columns={lastColumns}
        loading={isLoading}
        bordered
        dataSource={generateIdForDataSource(_get(data, 'rows', []))}
        rowKey="id"
        pagination={tablePagination}
      />
    </>
  );
}
