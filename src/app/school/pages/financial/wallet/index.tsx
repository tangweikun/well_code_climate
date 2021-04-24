// 钱包管理
import React, { useState } from 'react';
import { Card, Space, Modal, message } from 'antd';
import { useFetch, useVisible, useForceUpdate, useRequest } from 'hooks';
import { _get } from 'utils';
import {
  _getBankList,
  _openSchoolAccount,
  _getAccountInfo,
  _queryBankCard,
  _isAllowedOpenClassTwoBankAccount,
} from './_api';
import { AuthButton, Loading, IF } from 'components';
import BindBankCard from './BindBankCard';
import Withdrawal from './Withdrawal';
import CardInfo from './CardInfo';
import AddCard from './AddCard';
import OpenAccount from './OpenAccount';
import OpenClassTwoAccount from './OpenClassTwoAccount';

function Wallet() {
  const { confirm } = Modal;
  const [bankChannelId, setBankChannelId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [acctNo, setAcctNo] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [accMobile, setAccMobile] = useState('');
  const [cashAmt, setCashAmt] = useState(''); //可提现余额
  const [loading, setLoading] = useState(false);
  const [ignore, forceUpdate] = useForceUpdate();
  const commonMargin = { marginBottom: 30 };
  const [bankCardVisible, setBankCardVisible] = useVisible();
  const [withDrawalVisible, setWithDrawalVisible] = useVisible();
  const [cardInfoVisible, setCardInfoVisible] = useVisible();
  const [addCardVisible, setAddCardVisible] = useVisible();
  const [openAccountVisible, setOpenAccountVisible] = useVisible();
  const [bankChannelType, setBankChannelType] = useState('pa_bank'); // TODO:
  const [dataSource, setDataSource] = useState([]);
  const [twoBankAccountVisible, setTwoBankAccountVisible] = useState(false);

  const { loading: withdrawalLoading, run } = useRequest(_queryBankCard, {
    onSuccess: (res) => {
      if (!res || Number(_get(res, 'status', 0)) === 0) {
        //未绑卡
        //res为空或status=0时，均提示未绑卡
        message.warning('你还没有绑定银行卡');
        setAddCardVisible();
      } else {
        setAccMobile(_get(res, 'accMobile'));
        setWithDrawalVisible();
      }
    },
  });

  const { loading: cardInfoLoading, run: cardInfoRun } = useRequest(_queryBankCard, {
    onSuccess: (res) => {
      if (!res || Number(_get(res, 'status', 0)) === 0) {
        //data为空或status=0时，均提示未绑卡
        //未绑卡
        setAddCardVisible();
      } else {
        setCardInfoVisible();
        setBankInfo(res);
      }
    },
  });

  const { isLoading } = useFetch({
    request: _getBankList,
    depends: [ignore],
    callback: async (data) => {
      formatData(data);
    },
  });

  // 是否允许有二类户
  const { data: isAllowedOpenClassTwoBankAccount = true } = useFetch({
    request: _isAllowedOpenClassTwoBankAccount,
  });
  console.log(isAllowedOpenClassTwoBankAccount);
  const formatData = async (data: any) => {
    await Promise.all(
      data.map(async (item: any) => {
        if (_get(item, 'openedAccount', false)) {
          const accData = await _getAccountInfo({
            bankChannelId: item.bankChannelId,
            bankAccount: item.bankAccount,
          });
          return { ...item, ..._get(accData, 'data', {}) };
        }
        return item;
      }),
    ).then((res: any) => {
      setDataSource(res);
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap' }}>
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          {openAccountVisible && (
            <OpenAccount
              onCancel={setOpenAccountVisible}
              bankChannel={bankChannelId}
              setBankAccount={setBankAccount}
              setAcctNo={setAcctNo}
              setCashAmt={setCashAmt}
              setAddCardVisible={setAddCardVisible}
              onOk={() => {
                setOpenAccountVisible();
                forceUpdate();
              }}
            />
          )}
          {bankCardVisible && ( //绑卡
            <BindBankCard
              onCancel={setBankCardVisible}
              bankChannelId={bankChannelId}
              acctNo={acctNo}
              bankAccount={bankAccount}
              onOK={() => {
                forceUpdate();
                setBankCardVisible();
              }}
            />
          )}
          {withDrawalVisible && ( //提现
            <Withdrawal
              onCancel={setWithDrawalVisible}
              accMobile={accMobile}
              bankChannelId={bankChannelId}
              acctNo={acctNo}
              cashAmount={cashAmt}
              onOk={() => {
                setWithDrawalVisible();
                forceUpdate();
              }}
            />
          )}
          {cardInfoVisible && ( //展示卡信息
            <CardInfo
              onCancel={setCardInfoVisible}
              onOk={() => {
                setCardInfoVisible();
                forceUpdate();
              }}
              setWithDrawalVisible={setWithDrawalVisible}
              bankInfo={bankInfo}
              bankAccount={bankAccount}
              bankChannelId={bankChannelId}
              getMobile={(num: any) => {
                setAccMobile(num);
              }}
            />
          )}
          {addCardVisible && ( //未绑卡，需要添加银行卡
            <AddCard
              onCancel={setAddCardVisible}
              onClick={() => {
                setAddCardVisible();
                setBankCardVisible();
              }}
            />
          )}

          {/* 二类户钱包开通申请 */}
          {twoBankAccountVisible && <OpenClassTwoAccount onCancel={setTwoBankAccountVisible} />}

          {dataSource.map((item: any, index: number) => {
            if (_get(item, 'openedAccount', false)) {
              return (
                <Card
                  title={_get(item, 'bankName', '')}
                  bordered={true}
                  style={{ width: 400, height: 300 }}
                  className="mt10 mr10"
                  key={index}
                >
                  <p style={commonMargin}>
                    {(_get(item, 'bankChannelType', '') === 'pa_bank' ? '电子账号：' : '监管户账号：') +
                      _get(item, 'acctNo', '')}
                  </p>
                  <p style={commonMargin}>
                    {_get(item, 'bankChannelType', '') === 'pa_bank'
                      ? '账户余额：' + _get(item, 'availBal', '')
                      : '监管户余额：' + _get(item, 'assureAmt', '')}
                  </p>
                  {_get(item, 'bankChannelType', '') === 'pa_bank' && (
                    <p style={commonMargin}>{'可提现金额：' + _get(item, 'cashAmt', '')}</p>
                  )}
                  {_get(item, 'bankChannelType', '') === 'pa_bank' && (
                    <Space size="small">
                      <AuthButton
                        authId="financial/wallet:btn2"
                        loading={withdrawalLoading}
                        type="primary"
                        onClick={() => {
                          setBankChannelId(_get(item, 'bankChannelId', ''));
                          setBankAccount(_get(item, 'bankAccount', ''));
                          setAcctNo(_get(item, 'acctNo', ''));
                          run({
                            bankChannelId: _get(item, 'bankChannelId', ''),
                            bankAccount: _get(item, 'bankAccount', ''),
                          });
                        }}
                      >
                        提现
                      </AuthButton>
                      <AuthButton
                        authId="financial/wallet:btn3"
                        loading={cardInfoLoading}
                        onClick={() => {
                          setBankChannelId(_get(item, 'bankChannelId', ''));
                          setBankAccount(_get(item, 'bankAccount', ''));
                          setAcctNo(_get(item, 'acctNo', ''));
                          cardInfoRun({
                            bankChannelId: _get(item, 'bankChannelId', ''),
                            bankAccount: _get(item, 'bankAccount', ''),
                          });
                        }}
                      >
                        绑卡信息
                      </AuthButton>
                    </Space>
                  )}
                  <div style={{ textAlign: 'right' }}>实际金额以银行为准</div>
                </Card>
              );
            }
            return (
              <Card
                title={_get(item, 'bankName', '')}
                bordered={true}
                style={{ width: 400, height: 300 }}
                className="mt10 mr10"
                bodyStyle={{ textAlign: 'center', paddingTop: 80 }}
                key={index}
              >
                <AuthButton
                  // loading={loading}
                  authId="financial/wallet:btn1"
                  type="primary"
                  onClick={() => {
                    let bankChannel = _get(item, 'bankChannelId', '');
                    setBankChannelId(bankChannel);
                    if (_get(item, 'bankChannelType', '') !== 'pa_bank') {
                      confirm({
                        title: `是否确定开户？`,
                        content: '',
                        okText: '确定',
                        okType: 'danger',
                        cancelText: '取消',
                        async onOk() {
                          let bankChannel = _get(item, 'bankChannelId', '');
                          setBankChannelId(bankChannel);
                          setLoading(true);
                          const res = await _openSchoolAccount({
                            bankChannelId: bankChannel,
                            bankChannelType: _get(item, 'bankChannelType', ''),
                          });

                          if (_get(res, 'code') === 200) {
                            let bankAcc = _get(res, 'data.bankAccount', '');
                            setBankAccount(bankAcc);
                          }
                          forceUpdate();
                          setLoading(false);
                        },
                      });
                    } else {
                      setOpenAccountVisible();
                    }
                  }}
                >
                  开通账户
                </AuthButton>
              </Card>
            );
          })}

          {/* 二类户逻辑 */}
          {isAllowedOpenClassTwoBankAccount && (
            <IF
              condition={false}
              then={
                <Card
                  title="中国平安银行"
                  bordered={true}
                  style={{ width: 400, height: 300 }}
                  className="mt10 mr10"
                  extra={<>审核中</>}
                >
                  <p style={commonMargin}>{'监管户账号：' + '123123123'}</p>
                  <p style={commonMargin}>{'开通状态：' + '审核中'}</p>
                  <Space size="small"></Space>
                  <div style={{ textAlign: 'right' }}>
                    <AuthButton style={{ textAlign: 'right' }} authId="financial/wallet:btn3" loading={cardInfoLoading}>
                      绑卡信息
                    </AuthButton>

                    <div>仅用于收款</div>
                  </div>
                </Card>
              }
              else={
                <Card
                  title="平安互联网账户"
                  bordered={true}
                  style={{ width: 400, height: 300 }}
                  className="mt10 mr10"
                  bodyStyle={{ textAlign: 'center' }}
                  extra={<>HOT</>}
                >
                  <p style={commonMargin}>简介</p>

                  <Space size="small"></Space>

                  <AuthButton
                    type="primary"
                    onClick={() => {
                      setTwoBankAccountVisible(true);
                    }}
                    style={{ textAlign: 'right' }}
                    authId="financial/wallet:btn3"
                    loading={cardInfoLoading}
                  >
                    开通账户
                  </AuthButton>
                </Card>
              }
            />
          )}
        </>
      )}
    </div>
  );
}

export default Wallet;
