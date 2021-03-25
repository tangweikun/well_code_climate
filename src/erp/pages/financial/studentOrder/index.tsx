// 学员订单
import React, { useState } from 'react';
import { _getInfo } from './_api';
import { Table, Radio, message } from 'antd';
import { _get } from 'utils';
import { useFetch, useTablePagination, useSearch, useVisible, useForceUpdate, useOptions, useHash } from 'hooks';
import { AuthButton, Search } from 'components';
import Details from './Details';
import UpdatePrice from './UpdatePrice';
import { _getStudentList } from 'api';

function StudentOrder(props: any) {
  const { sid, isFromStudentInfo = false } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const businessTypeHash = useHash('business_type'); // 业务类型
  const orderTypeHash = useHash('order_type'); // 订单类型
  const payTypeHash = useHash('pay_type'); // 支付方式
  const payStatusHash = useHash('pay_status'); // 订单状态
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [bustype, setBustype] = useState();
  const [updatePriceVisible, _switchUpdatePriceVisible] = useVisible();
  const [dateArr, setDateArr] = useState<any>({}); //创建日期
  const orderType = useOptions('order_type');
  const payStatus = useOptions('pay_status');

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'sname',
    },
    {
      title: '证件号',
      dataIndex: 'stuidnum',
    },
    {
      title: '业务类型',
      dataIndex: 'bustype', //1:报名缴费  2: 课程预约
      render: (bustype: any) => businessTypeHash[bustype],
    },
    {
      title: '订单号',
      dataIndex: 'ordercode',
    },
    {
      title: '交易号',
      dataIndex: 'payordercode',
    },
    {
      title: '订单类型',
      dataIndex: 'ordertype', //1:冻结支付  2：到账支付  3：线下支付
      render: (ordertype: any) => orderTypeHash[ordertype],
    },
    {
      title: '支付方式',
      dataIndex: 'payaccouttype',
      render: (payaccouttype: any) => payTypeHash[payaccouttype],
    },
    {
      title: '订单金额',
      dataIndex: 'payprice',
      render: (payprice: any, record: any) => {
        return payprice || payprice === 0 ? Number(payprice).toFixed(2) : '';
      },
    },
    {
      title: '已结算金额',
      dataIndex: 'settlementamout',
      render: (settlementamout: any, record: any) => {
        return settlementamout || settlementamout === 0 ? Number(settlementamout).toFixed(2) : '';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
    },
    {
      title: '订单状态',
      dataIndex: 'paystatus',
      render: (paystatus: any) => payStatusHash[paystatus],
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="financial/studentOrder:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'id'));
              setCurrentRecord(record);
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </AuthButton>
          {_get(record, 'paystatus', '') === 0 &&
            _get(record, 'bustype', '') === '1' && ( //报名缴费同时待支付才允许改价
              <AuthButton
                authId="financial/studentOrder:btn2"
                onClick={() => {
                  setCurrentRecord(record);
                  _switchUpdatePriceVisible();
                }}
                className="operation-button"
                type="primary"
                ghost
                size="small"
              >
                改价
              </AuthButton>
            )}
        </div>
      ),
    },
  ];

  const commonQuery = {
    page: pagination.current,
    limit: pagination.pageSize,
    sid: isFromStudentInfo ? sid : _get(search, 'sid'),
  };
  const query = isFromStudentInfo
    ? commonQuery
    : {
        ...commonQuery,
        paystatus: _get(search, 'paystatus'),
        bustype: _get(search, 'bustype'),
        ordercode: _get(search, 'ordercode'),
        payordercode: _get(search, 'payordercode'),
        sname: _get(search, 'sname'),
        stuidnum: _get(search, 'stuidnum'),
        payaccouttype: _get(search, 'payaccouttype'),
        ordertype: _get(search, 'ordertype'),
        datebegin: _get(search, 'datebegin'),
        dateend: _get(search, 'dateend'),
      };

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize, bustype],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentId={currentId} currentRecord={currentRecord} />
      )}
      {updatePriceVisible && (
        <UpdatePrice
          onOk={() => {
            _switchUpdatePriceVisible();
            forceUpdate();
          }}
          onCancel={_switchUpdatePriceVisible}
          currentRecord={currentRecord}
        />
      )}
      {!isFromStudentInfo && (
        <div>
          <Search
            filters={[
              { type: 'Input', field: 'ordercode', placeholder: '订单号' },
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
                type: 'Select',
                field: 'ordertype',
                options: [{ label: '订单类型(全部)', value: '' }, ...orderType],
              },
              {
                type: 'Select',
                field: 'paystatus',
                options: [{ label: '订单状态(全部)', value: '' }, ...payStatus],
              },
              {
                type: 'RangePicker',
                field: ['datebegin', 'dateend'],
                placeholder: ['创建日期起', '创建日期止'],
                otherProps: {
                  value: [_get(dateArr, 'datebegin'), _get(dateArr, 'dateend')],
                  onCalendarChange: (date: any) => {
                    if (_get(date, '0') && _get(date, '1')) {
                      if (_get(date, '0').year() === _get(date, '1').year()) {
                        setDateArr({ datebegin: _get(date, '0'), dateend: _get(date, '1') });
                      } else {
                        message.error('选择日期不能跨年');
                        setDateArr({ datebegin: '', dateend: '' });
                      }
                    } else {
                      setDateArr({ datebegin: '', dateend: '' });
                    }
                  },
                },
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
          <div className="mb20">
            <Radio.Group
              defaultValue=""
              buttonStyle="solid"
              onChange={(e: any) => {
                _handleSearch('bustype', e.target.value);
                setBustype(e.target.value);
                setPagination({ ...pagination, current: 1 });
                forceUpdate();
              }}
            >
              <Radio.Button value="">全部</Radio.Button>
              <Radio.Button value="1">报名缴费</Radio.Button>
              <Radio.Button value="2">课程预约</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="id"
        pagination={tablePagination}
      />
    </div>
  );
}

export default StudentOrder;
