import React from 'react';
import { Row } from 'antd';
import { _get } from 'utils';
import { useFetch } from 'hooks';
import { _queryAccountInfo } from '../_api';
import { IF, Loading } from 'components';

export default function AccountInfo(props: any) {
  const { sid } = props;
  const { data, isLoading } = useFetch({
    request: _queryAccountInfo,
    query: { sid },
  });
  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <div className="flex-box mb20 mt20 ml20 mr20">
              <div className="flex1">
                套餐总额<Row className="fz20 bold">{_get(data, 'packageAmount', 0)}元</Row>
              </div>
              <div className="flex1">
                充值总额<Row className="fz20 bold">{_get(data, 'rechargeAmount', 0)}元</Row>
              </div>
              <div className="flex1">
                当前余额<Row className="fz20 bold">{_get(data, 'currentBalance', 0)}元</Row>
              </div>
            </div>
            <div className="flex-box ml20 mr20">
              <div className="flex1">
                已结算金额<Row className="fz20 bold">{_get(data, 'settledAmount', 0)}元</Row>
              </div>
              <div className="flex1">
                待结算金额<Row className="fz20 bold">{_get(data, 'toBeSettledAmount', 0)}元</Row>
              </div>
              <div className="flex1"></div>
            </div>
          </div>
        }
      />
    </div>
  );
}
