// 已预约记录
import React, { useState } from 'react';
import { _get } from 'utils';
import moment from 'moment';
import { _getCoachList, _getBusinessOutlet, _getClassList } from './_api';
import { _getStudentList } from 'api';
import { useOptions, useSearch, useFetch, useTablePagination, useForceUpdate, useVisible } from 'hooks';
import { Search, AuthButton } from 'components';
import OrderRecordTable from './OrderRecordTable';
import CancelOrder from './CancelOrder';

export default function OrderList(props: any) {
  const { sid, isFromStudentInfo = false } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [cancelVisible, _switchCancelVisible] = useVisible();
  const [skuId, setSkuId] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [search, _handleSearch]: any = useSearch({
    beginDate: moment().subtract(30, 'day'),
    endDate: moment().add(30, 'day'),
  });
  const [coachData, setOptionCoachData] = useState<any>([]); // 教练下拉数据

  const commonQuery = {
    page: pagination.current,
    limit: pagination.pageSize,
    sid: isFromStudentInfo ? sid : _get(search, 'sid', ''),
    order_mode: _get(search, 'order_mode', ''),
    order_status: _get(search, 'order_status', ''),
    traincode: _get(search, 'traincode', ''),
    cid: _get(search, 'cid'),
    classroom: _get(search, 'classroom'),
    plan_id: _get(search, 'skuId'),
    order_appoint_status: _get(search, 'order_appoint_status', ''),
  };
  const query = isFromStudentInfo
    ? commonQuery
    : {
        ...commonQuery,
        beginDate: _get(search, 'beginDate') ? moment(_get(search, 'beginDate')).format('YYYY-MM-DD') : '',
        endDate: _get(search, 'endDate') ? moment(_get(search, 'endDate')).format('YYYY-MM-DD') : '',
        beginHour: _get(search, 'beginHour', ''),
        endHour: _get(search, 'endHour', ''),
      };

  // 营业网点列表
  const { data: businessData = [] } = useFetch({
    request: _getBusinessOutlet,
  });
  const businessOptionData = businessData.map((x: any) => ({ value: x.sbnid, label: x.branchname }));

  // 教室列表
  const { data: classData = [] } = useFetch({
    request: _getClassList,
    query: {
      sbnid: _get(search, 'sbnid', ''),
    },
    depends: [_get(search, 'sbnid', '')],
  });
  const classOptionData = classData.map((x: any) => ({ value: x.classid, label: x.classroom }));
  const filter = isFromStudentInfo
    ? []
    : ([
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
          type: 'RangePicker',
          field: ['beginDate', 'endDate'],
          placeholder: ['课程日期起', '课程日期止'],
          otherProps: { allowClear: false, defaultValue: [search.beginDate, search.endDate] },
        },
        {
          type: 'TimeRangePicker',
          field: ['beginHour', 'endHour'],
          placeholder: ['课程时段起', '课程时段止'],
          otherProps: { allowClear: false, format: 'HH' },
        },
      ] as any);

  return (
    <div>
      {cancelVisible && (
        <CancelOrder
          skuId={skuId}
          selectedData={selectedData}
          onCancel={_switchCancelVisible}
          onOk={() => {
            _switchCancelVisible();
            forceUpdate();
          }}
        />
      )}
      <Search
        filters={[
          ...filter,
          {
            type: 'Select',
            field: 'order_mode',
            options: [{ value: '', label: '约课类型(全部)' }, ...useOptions('order_mode')],
          },
          {
            type: 'Select',
            field: 'order_appoint_status',
            options: [{ value: '', label: '预约状态(全部)' }, ...useOptions('order_appoint_status')],
          },
          {
            type: 'Select',
            field: 'traincode',
            options: [{ value: '', label: '课程类型(全部)' }, ...useOptions('combo')],
            onChangeCallback: (field, value) => {
              if (value === '1') {
                _handleSearch('sbnid', '');
                _handleSearch('classroom', '');
              } else if (value === '2' || value === '3') {
                _handleSearch('cid', '');
              } else {
                _handleSearch('sbnid', '');
                _handleSearch('classroom', '');
                _handleSearch('cid', '');
              }
            },
          },
          {
            type: 'Select',
            field: 'cid',
            show: `${_get(search, 'traincode')}` === '1', // 实操
            options: [{ label: '教练(全部)', value: '' }, ...coachData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: any) => {
                const res = await _getCoachList({ coachname: value });
                const carData = _get(res, 'data', []).map((x: any) => {
                  return {
                    label: x.coachname,
                    value: x.cid,
                  };
                });
                setOptionCoachData(carData);
              },
            },
          },
          {
            type: 'Select',
            field: 'sbnid',
            show: `${_get(search, 'traincode')}` === '3' || `${_get(search, 'traincode')}` === '2', // 模拟 | 理论
            options: [{ label: '营业网点(全部)', value: '' }, ...businessOptionData],
            onChangeCallback: () => _handleSearch('classroom', ''),
          },
          {
            type: 'Select',
            field: 'classroom',
            show: `${_get(search, 'traincode')}` === '3' || `${_get(search, 'traincode')}` === '2', // 模拟 | 理论
            options: [{ label: '教室(全部)', value: '' }, ...classOptionData],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        customRequest={_getStudentList}
      />
      <AuthButton
        disabled={skuId.length < 1}
        authId="teach/orderRecord:btn1"
        onClick={_switchCancelVisible}
        style={{ marginBottom: 10, fontSize: 12 }}
        type="primary"
      >
        取消预约
      </AuthButton>
      <OrderRecordTable
        query={query}
        ignore={ignore}
        forceUpdate={forceUpdate}
        isNeedRowSelect={true}
        setSkuId={setSkuId}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        setSelectedData={setSelectedData}
      />
    </div>
  );
}
