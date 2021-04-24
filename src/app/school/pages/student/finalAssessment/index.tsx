// 结业考核管理
import React, { useContext } from 'react';
import { _getFinalAssess, _getSchoolSubjectExamCombo } from './_api';
import { _getStudentList } from 'api';

import { AuthButton, Search } from 'components';
import AddOrEdit from './AddOrEdit';
import { useHash, useTablePro, useFetch } from 'hooks';
import { message, Table } from 'antd';
import { _get } from 'utils';
import GlobalContext from 'globalContext';

function FinalAssessment() {
  const examResultHash = useHash('appraisalresult_type'); // 考核结果
  const { $elementAuthTable } = useContext(GlobalContext);

  // 考核科目下拉数据
  const { data: schoolSubject = [] } = useFetch({
    request: _getSchoolSubjectExamCombo,
  });
  const schoolSubjectOptions = schoolSubject.map((item: any) => {
    return { label: item.text, value: item.value };
  });

  // 考核科目（报审科目）HASH
  const subjectCodeHash: any = {};
  schoolSubject.forEach((x: any) => {
    subjectCodeHash[x.value] = x.text;
  });

  const {
    tableProps,
    search,
    isAddOrEditVisible,
    currentId,
    currentRecord,
    isEdit,
    _refreshTable,
    _handleSearch,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({ request: _getFinalAssess });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'studentname',
    },
    {
      title: '证件号码',
      dataIndex: 'stuidcard',
    },
    {
      title: '考核科目',
      dataIndex: 'subjectcode',
      render: (subjectcode: any) => subjectCodeHash[subjectcode],
    },
    {
      title: '考核员',
      dataIndex: 'appraisername',
    },
    {
      title: '考核时间',
      dataIndex: 'appraisaltime',
    },
    {
      title: '考核结果',
      dataIndex: 'appraisalresult',
      render: (appraisalresult: any) => examResultHash[appraisalresult],
    },
    {
      title: '考核成绩',
      dataIndex: 'achievement',
    },
    {
      title: '操作人',
      dataIndex: 'operatorname',
    },
    {
      title: '操作时间',
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="student/finalAssessment:btn2"
            onClick={() => {
              // 当考试科目subjectcode：5是从业资格，且没有配置相关权限，不展示弹框
              if (_get(record, 'subjectcode') === '5' && !$elementAuthTable['student/finalAssessment:btn3']) {
                message.error('没有权限,请联系管理员');
                return;
              }
              _handleEdit(record, _get(record, 'id', ''));
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <>
      <AuthButton
        authId="student/finalAssessment:btn1"
        type="primary"
        onClick={() => {
          _handleAdd();
        }}
        className="mb20"
      >
        新增
      </AuthButton>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={'结业考核信息'}
          isVisibleWorkTab={$elementAuthTable['student/finalAssessment:btn3']}
        />
      )}
      <Search
        filters={[
          // { type: 'Input', field: 'studentname', placeholder: '学员姓名' },
          // { type: 'Input', field: 'stuidcard', placeholder: '证件号码' },
          {
            type: 'CustomSelect',
            field: 'stuid',
            placeholder: '学员姓名',
            options: [
              { label: '学员姓名', value: 'name' },
              { label: '学员证件', value: 'idcard' },
            ],
          },
          { type: 'Input', field: 'appraisername', placeholder: '考核员姓名' },
          {
            type: 'Select',
            field: 'subjectcode',
            options: [{ label: '考核科目(全部)', value: '' }, ...schoolSubjectOptions],
          },
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['考核开始日期', '考核结束日期'],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customRequest={_getStudentList}
      />
      <Table {...tableProps} columns={columns} rowKey="id" />
    </>
  );
}

export default FinalAssessment;
