// 电子教学日志管理
import React, { useState } from 'react';
import moment from 'moment';
import { useTablePagination, useSearch, useForceUpdate, useOptions, useVisible, useAuth } from 'hooks';
import { Search, AuthButton } from 'components';
import { formatTime, insertWhen, _get } from 'utils';
import TeachingJournalTable from './teachingJournalTable';
import { _getCoachList, _getCarList } from './_api';
import { _getStudentList } from 'api';
import UploadArr from './UploadArr';

function TeachingJournal() {
  const [search, _handleSearch] = useSearch({
    signstarttime_start: moment().startOf('month'),
    signstarttime_end: moment(),
  });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [optionCarData, setOptionCarData] = useState<any>([]); // 车牌号下拉数据
  const [visible, _switchVisible] = useVisible();

  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    signstarttime_start: formatTime(_get(search, 'signstarttime_start'), 'DATE'),
    signstarttime_end: formatTime(_get(search, 'signstarttime_end'), 'DATE'),
    create_date_start: formatTime(_get(search, 'create_date_start'), 'DATE'),
    create_date_end: formatTime(_get(search, 'create_date_end'), 'DATE'),
    coachname: _get(search, 'coachname'),
    coa_idcard: _get(search, 'coa_idcard'),
    carid: _get(search, 'carid'),
    stu_status: _get(search, 'stu_status'),
    subjectcode: _get(search, 'subjectcode'),
    checkstatus_jx: _get(search, 'checkstatus_jx'),
    checkstatus_jg: _get(search, 'checkstatus_jg'),
    crstate: _get(search, 'crstate'),
    stuid: _get(search, 'sid'),
    coachid: _get(search, 'cid'),
    iscyzg: _get(search, 'iscyzg'),
  };

  return (
    <>
      {visible && <UploadArr signstarttime_start={_get(search, 'signstarttime_start')} onCancel={_switchVisible} />}

      <Search
        filters={[
          {
            type: 'RangePickerDisable',
            field: ['signstarttime_start', 'signstarttime_end'],
            placeholder: ['签到日期起', '签到日期止'],
            crossYear: true,
            rangeAllowClear: false,
          },
          {
            type: 'RangePicker',
            field: ['create_date_start', 'create_date_end'],
            placeholder: ['上传监管日期起', '上传监管日期止'],
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
            type: 'CustomSelectOfCoach',
            field: 'cid',
            placeholder: '教练姓名',
            options: [
              { label: '教练姓名', value: 'coachname' },
              { label: '教练证件', value: 'idcard' },
            ],
          },
          {
            type: 'Select',
            field: 'carid',
            options: [{ label: '车牌号(全部)', value: '' }, ...optionCarData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: any) => {
                const res = await _getCarList({ licnum: value });
                const carData = _get(res, 'data', []).map((x: any) => {
                  return {
                    label: x.text,
                    value: x.value,
                  };
                });
                setOptionCarData(carData);
              },
            },
          },
          {
            type: 'Select',
            field: 'subjectcode',
            options: [{ value: '', label: '培训部分(全部)' }, ...useOptions('trans_part_type')],
          },
          {
            type: 'Select',
            field: 'checkstatus_jx',
            options: [{ value: '', label: '计时审核状态(全部)' }, ...useOptions('checkstatus_jx_type')],
          },
          {
            type: 'Select',
            field: 'checkstatus_jg',
            options: [{ value: '', label: '监管审核状态(全部)' }, ...useOptions('checkstatus_jg_type')],
          },
          {
            type: 'Select',
            field: 'crstate',
            options: [{ value: '', label: '是否有效(全部)' }, ...useOptions('crstate_type')],
          },
          ...(insertWhen(useAuth('student/teachingJournal:iscyzg'), [
            {
              type: 'Select',
              field: 'iscyzg',
              options: [{ value: '', label: '从业资格学时(全部)' }, ...useOptions('iscyzg_type', false, '-1', ['0'])], // '0'代表否(排除了否)，下拉只需展示全部和是
            },
          ]) as any),
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        customRequest={_getStudentList}
        customCoachRequest={_getCoachList}
      />

      <AuthButton
        authId="student/teachingJournal:btn5"
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={_switchVisible}
      >
        批量上传
      </AuthButton>

      <TeachingJournalTable
        query={query}
        ignore={ignore}
        forceUpdate={forceUpdate}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
      />
    </>
  );
}

export default TeachingJournal;
