import React, { useState } from 'react';
import { Table, Button } from 'antd';
import { AuthButton, Search } from 'components';
import { _getList } from './_api';
import { _getListAssociated } from '../studentInfo/_api';
import { useTablePro, useHash, useOptions, useVisible, useFetch } from 'hooks';
import AddOrEdit from '../studentInfo/AddOrEdit';
import Details from '../forecastReview/Details';
import { _getTeachInfo } from 'api';
import { Auth, _get } from 'utils';

export default function ForecastExpected(props: any) {
  const { isChecked = false } = props; //是否预报名审核
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [confirmation, setConfirmation] = useState(false); // 是否转正
  const {
    tableProps,
    search,
    _refreshTable,
    setCurrentRecord,
    currentRecord,
    _handleSearch,
    _handleAdd,
    isEdit,
    _handleEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getList,
    extraParams: isChecked ? { checkerschoolid: Auth.get('schoolId') } : {},
  });
  const businessTypeHash = useHash('businessType'); // 业务类型
  const checkstatusSign = useHash('checkstatus_sign'); // 审核状态
  const { data: schoolData = [] } = useFetch({
    request: _getListAssociated,
  });
  const schoolOption = _get(schoolData, 'rows', []).map((x: any) => {
    return { label: x.text, value: x.value };
  });
  // 教学信息接口
  const { data: teachData } = useFetch({
    request: _getTeachInfo,
    query: {
      id: Auth.get('schoolId'),
    },
  });
  const isTheoryCenter = _get(teachData, 'theoryCenter', false);
  const isPracticeSchool = _get(teachData, 'practice', false);

  const columns = [
    { title: isChecked ? '培训机构' : '驾校名称', dataIndex: 'applyerschoolname' },
    { title: '姓名', dataIndex: 'name' },
    { title: '联系电话', dataIndex: 'phone', hide: !isChecked },
    { title: '证件号', dataIndex: 'idcard' },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      render: (busitype: any) => businessTypeHash[busitype],
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
    },
    {
      title: isChecked ? '申请日期' : '报名日期',
      dataIndex: 'applydate',
    },
    {
      title: '申请来源',
      dataIndex: 'schshortname',
      hide: !isChecked,
    },
    { title: '录入人', dataIndex: 'applyusername', hide: isChecked },
    { title: '审核状态', dataIndex: 'checkstatus', render: (checkstatus: any) => checkstatusSign[checkstatus] },
    { title: '审核日期', dataIndex: 'checktime', hide: !isChecked },
    { title: '审核方', dataIndex: 'checkusername', hide: !isChecked },
    { title: '备注', dataIndex: 'note', hide: isChecked },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="student/forecastExpected:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentRecord(record);
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </AuthButton>
          <AuthButton
            insertWhen={!isChecked && _get(record, 'checkstatus', '') !== '2'} //预报名受理页面显示  审核状态为待审核、审核不同意都可以修改，如果审核通过就不可以修改。
            authId="student/forecastExpected:btn2"
            onClick={() => _handleEdit(record, _get(record, 'sid', ''))}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            编辑
          </AuthButton>

          <AuthButton
            insertWhen={isChecked && _get(record, 'checkstatus', '') === '0'} //预报名审核页面 、未审核状态
            authId="student/forecastChecked:btn1"
            onClick={() => _handleEdit(record, _get(record, 'sid', ''))}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            审核
          </AuthButton>

          <AuthButton
            insertWhen={
              isPracticeSchool &&
              !isChecked &&
              _get(record, 'checkstatus', '') === '2' &&
              !_get(record, 'package_id', '')
            } //转正 ：1、预报名受理页面 2、实操驾校3、没有班级 4、审核通过才显示
            authId="student/forecastExpected:btn3"
            onClick={() => {
              _handleEdit(record, _get(record, 'sid', ''));
              setConfirmation(true);
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            转正
          </AuthButton>
        </>
      ),
    },
  ];
  const lastColumns: any = columns.filter((index: any) => {
    return index.hide !== true;
  });
  return (
    <>
      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          currentId={_get(currentRecord, 'sid', '')}
          isPreSignUpDetails={true}
        />
      )}
      <Search
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'checkstatus',
            options: [{ value: '', label: '审核状态(全部)' }, ...useOptions('checkstatus_sign')],
          },
          {
            type: 'Select',
            field: 'applyerschoolid',
            options: [{ value: '', label: '培训机构(全部)' }, ...schoolOption],
          },
          {
            type: 'RangePicker',
            field: ['applytimeStart', 'applytimeEnd'],
            placeholder: ['申请日期起', '申请日期止'],
          },
          {
            type: 'RangePicker',
            field: ['checktimeStart', 'checktimeEnd'],
            placeholder: ['审核日期起', '审核日期止'],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      {!isChecked && (
        <Button type="primary" className="mr20 mb20" onClick={_handleAdd}>
          新增
        </Button>
      )}

      <Table {...tableProps} columns={lastColumns} rowKey="sid" />

      {isAddOrEditVisible && (
        <AddOrEdit
          isPreSignUp={true}
          isChecked={isChecked}
          isTheoryCenter={isTheoryCenter}
          isEdit={isEdit}
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentRecord={currentRecord}
          isConfirmation={confirmation}
        />
      )}
    </>
  );
}
