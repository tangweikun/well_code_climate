// 账务明细
import React, { useState } from 'react';
import { Radio, message } from 'antd';
import { _get } from 'utils';
import { _getStudentList } from 'api';
import { useTablePagination, useSearch, useForceUpdate, useOptions } from 'hooks';
import { Search } from 'components';
import AccountDetailsTable from './AccountDetailsTable';

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

function AccountDetails() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [data, setData] = useState([]);
  const [incomeMoney, setIncomeMoney] = useState(0);
  const [payoutMoney, setPayoutMoney] = useState(0);
  const [flowType, setFlowType] = useState('');
  const [dateArr, setDateArr] = useState<any>({}); //创建日期

  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    startDate: _get(search, 'startDate'),
    endDate: _get(search, 'endDate'),
    busiType: _get(search, 'busiType'),
    targetAcctNo: _get(search, 'targetAcctNo'),
    sid: _get(search, 'sid'),
    flowType: _get(search, 'flowType'),
  };

  function setMoneyCallback(data: any) {
    //设置收入、结算笔数
    setData(data);
    setIncomeMoney(_get(data, 'incomeAmount', '0'));
    setPayoutMoney(_get(data, 'expandAmount', '0'));
  }

  return (
    <div>
      {
        <Search
          filters={[
            {
              type: 'RangePicker',
              field: ['startDate', 'endDate'],
              placeholder: ['创建日期起', '创建日期止'],
              otherProps: {
                value: [_get(dateArr, 'startDate'), _get(dateArr, 'endDate')],
                onCalendarChange: (date: any) => {
                  if (_get(date, '0') && _get(date, '1')) {
                    if (_get(date, '0').year() === _get(date, '1').year()) {
                      setDateArr({ startDate: _get(date, '0'), endDate: _get(date, '1') });
                    } else {
                      message.error('选择日期不能跨年');
                      setDateArr({ startDate: '', endDate: '' });
                    }
                  } else {
                    setDateArr({ startDate: '', endDate: '' });
                  }
                },
              },
            },
            {
              type: 'Select',
              field: 'busiType',
              options: [{ label: '账务类型(全部)', value: '' }, ...useOptions('transaction_type')], //交易类型
            },
            {
              type: 'CustomSelect',
              field: 'sid',
              placeholder: '学员姓名',
              options: [{ label: '学员姓名', value: 'name' }],
            },
            { type: 'Input', field: 'targetAcctNo', placeholder: '对方电子账号' },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
          customRequest={_getStudentList}
        />
      }

      {_get(data, 'rows.length', 0) > 0 && ( //如果列表没有数据，不显示收入栏目
        <div
          style={{
            border: 1,
            borderStyle: 'solid',
            borderColor: '#d9d9d9',
            display: 'flex',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, margin: 10 }}>
            <div>收入</div>
            <div style={{ fontSize: 25, color: 'green' }}>{incomeMoney}元</div>
          </div>
          <div style={{ flex: 1, margin: 10 }}>
            <div>支出</div>
            <div style={{ fontSize: 25, color: 'red' }}>{payoutMoney}元</div>
          </div>
        </div>
      )}

      <div>
        <Radio.Group
          defaultValue=""
          buttonStyle="solid"
          onChange={(e: any) => {
            _handleSearch('flowType', e.target.value);
            setFlowType(e.target.value);
          }}
          style={{ marginBottom: 20 }}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="1">收入</Radio.Button>
          <Radio.Button value="2">支出</Radio.Button>
        </Radio.Group>
      </div>
      <AccountDetailsTable
        query={query}
        setMoneyCallback={setMoneyCallback}
        ignore={ignore}
        flowType={flowType}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
      />
    </div>
  );
}

export default AccountDetails;
