// 结算记录
import React, { useState } from 'react';
import { useTablePagination, useSearch, useForceUpdate, useOptions } from 'hooks';
import { Search } from 'components';
import { formatTime, _get } from 'utils';
import SettlementRecordsTable from './SettlementRecordsTable';
import moment from 'moment';
import { _getStudentList } from 'api';

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

function SettlementRecords(props: any) {
  const { idcard, sid, isFromStudentInfo = false } = props;
  const [search, _handleSearch] = useSearch({
    begin: moment().subtract(30, 'day'),
    end: moment(),
  });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [data, setData] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const settlementStatus = useOptions('settlement_status');

  const commonQuery = {
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
    idNumber: isFromStudentInfo ? idcard : _get(search, 'idNumber'),
  };
  const query = isFromStudentInfo
    ? commonQuery
    : {
        ...commonQuery,
        studentName: _get(search, 'studentName'),
        payFlowId: _get(search, 'payFlowId'),
        settleType: _get(search, 'settleType'),
        status: _get(search, 'status'),
        orderCode: _get(search, 'orderCode'),
        studentBankAccount: _get(search, 'studentBankAccount'),
        begin: formatTime(_get(search, 'begin'), 'BEGIN'),
        end: formatTime(_get(search, 'end'), 'END'),
        sid: _get(search, 'sid'),
      };

  function setMoneyCallback(res: any, data: any) {
    //设置收入、结算笔数
    setData(data);
    setTotalMoney(_get(res, 'data.income', '0'));
    setTotalCount(_get(res, 'data.total'));
  }

  return (
    <div>
      {!isFromStudentInfo && (
        <Search
          filters={[
            {
              type: 'CustomSelect',
              field: 'sid',
              placeholder: '学员姓名',
              options: [
                { label: '学员姓名', value: 'name' },
                { label: '学员证件', value: 'idcard' },
              ],
            },
            { type: 'Input', field: 'orderCode', placeholder: '订单号' },
            { type: 'Input', field: 'payFlowId', placeholder: '交易号' },
            {
              type: 'Select',
              field: 'status',
              options: [{ label: '结算状态(全部)', value: '' }, ...settlementStatus],
            },
            {
              type: 'RangePickerDisable',
              field: ['begin', 'end'],
              placeholder: ['创建日期起', '创建日期止'],
              crossYear: true,
              rangeAllowClear: false,
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={forceUpdate}
          customRequest={_getStudentList}
        />
      )}

      {_get(data, 'total', 0) > 0 && ( //如果列表没有数据，不显示收入栏目
        <div style={{ border: 1, borderStyle: 'solid', borderColor: '#d9d9d9', display: 'flex', marginBottom: 20 }}>
          <div style={{ flex: 1, margin: 10 }}>
            <div>收入</div>
            <div style={{ fontSize: 25, color: 'green' }}>+{totalMoney}元</div>
          </div>
          <div style={{ flex: 1, margin: 10 }}>
            <div>结算笔数</div>
            <div style={{ fontSize: 25 }}>{totalCount}笔</div>
          </div>
        </div>
      )}
      <SettlementRecordsTable
        query={query}
        sid={sid}
        isFromStudentInfo={isFromStudentInfo}
        setMoneyCallback={setMoneyCallback}
        ignore={ignore}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
      ></SettlementRecordsTable>
    </div>
  );
}

export default SettlementRecords;
