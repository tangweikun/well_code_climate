// 钱包管理
import React, { useState } from 'react';
import { Card, Space, Modal, message } from 'antd';
import { useFetch, useVisible, useForceUpdate, useRequest } from 'hooks';
import { _get } from 'utils';
import { _getBankList, _openSchoolAccount, _getAccountInfo, _queryBankCard } from './_api';
import { AuthButton, Loading } from 'components';
import BindBankCard from './BindBankCard';
import Withdrawal from './Withdrawal';
import CardInfo from './CardInfo';
import AddCard from './AddCard';
import OpenAccount from './OpenAccount';

function Wallet() {
  const { confirm } = Modal;
  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const [title, setTitle] = useState('');
  const [accountData, setAccountData] = useState();
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

  const { loading: withdrawalLoading, run } = useRequest(_queryBankCard, {
    onSuccess: (res) => {
      if (!res || Number(_get(res, 'status', 0)) === 0) {
        //未绑卡
        //res为空或status=0时，均提示未绑卡
        message.warning('你还没有绑定银行卡');
        setAddCardVisible();
      } else {
        setAccMobile(_get(res, 'accMobile'));
        setBankChannelId(bankChannelId);
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

  const { data = [], isLoading } = useFetch({
    request: _getBankList,
    depends: [ignore],
    callback: async (data) => {
      let item = data.find((i: any) => {
        return i.openedAccount === true;
      }); //只有一个开户
      if (item) {
        setIsOpenAccount(true);
        setTitle(item.bankName);
        setBankChannelType(_get(item, 'bankChannelType', ''));
        setBankChannelId(_get(item, 'bankChannelId', ''));
        setBankAccount(_get(item, 'bankAccount', ''));
        const res = await _getAccountInfo({
          bankChannelId: item.bankChannelId,
          bankAccount: item.bankAccount,
        });
        setAccountData(_get(res, 'data', {}));
        setAcctNo(_get(res, 'data.acctNo', ''));
        setCashAmt(_get(res, 'data.cashAmt', ''));
      }
    },
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          {openAccountVisible && (
            <OpenAccount
              onCancel={setOpenAccountVisible}
              bankChannel={bankChannelId}
              setIsOpenAccount={setIsOpenAccount}
              setBankAccount={setBankAccount}
              setAccountData={setAccountData}
              setAcctNo={setAcctNo}
              setTitle={setTitle}
              setCashAmt={setCashAmt}
              setAddCardVisible={setAddCardVisible}
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
          {!isOpenAccount && //未开户显示
            data.map((item: any, index: number) => {
              return (
                <Card title={_get(item, 'bankName', '')} bordered={true} style={{ width: 800, margin: 10 }} key={index}>
                  <AuthButton
                    loading={loading}
                    authId="financial/wallet:btn1"
                    type="primary"
                    onClick={() => {
                      let bankChannel = _get(item, 'bankChannelId', '');
                      setBankChannelId(bankChannel);
                      setBankChannelType(_get(item, 'bankChannelType', ''));
                      if (_get(item, 'bankChannelType', '') === 'icbc_lishui_bank') {
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
                              setIsOpenAccount(true);
                              let bankAcc = _get(res, 'data.bankAccount', '');
                              setBankAccount(bankAcc);
                              const accountInfo = await _getAccountInfo({
                                bankChannelId: bankChannel,
                                bankAccount: bankAcc,
                              });

                              setAccountData(_get(accountInfo, 'data', {}));
                              setAcctNo(_get(accountInfo, 'data.acctNo', ''));
                              setCashAmt(_get(accountInfo, 'data.cashAmt', ''));
                            }
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
          {isOpenAccount && ( //已开户显示
            <Card title={title} bordered={true} style={{ width: 400 }}>
              <p style={commonMargin}>
                {(bankChannelType === 'pa_bank' ? '电子账号：' : '监管户账号：') + _get(accountData, 'acctNo', '')}
              </p>
              <p style={commonMargin}>
                {bankChannelType === 'pa_bank'
                  ? '账户余额：' + _get(accountData, 'availBal', '')
                  : '监管户余额：' + _get(accountData, 'assureAmt', '')}
              </p>
              {bankChannelType === 'pa_bank' && (
                <p style={commonMargin}>{'可提现金额：' + _get(accountData, 'cashAmt', '')}</p>
              )}
              {bankChannelType === 'pa_bank' && (
                <Space size="small">
                  <AuthButton
                    authId="financial/wallet:btn2"
                    loading={withdrawalLoading}
                    type="primary"
                    onClick={async () => {
                      run({ bankChannelId, bankAccount });
                    }}
                  >
                    提现
                  </AuthButton>
                  <AuthButton
                    authId="financial/wallet:btn3"
                    loading={cardInfoLoading}
                    onClick={async () => {
                      cardInfoRun({ bankChannelId, bankAccount });
                    }}
                  >
                    绑卡信息
                  </AuthButton>
                </Space>
              )}
              <div style={{ textAlign: 'right' }}>实际金额以银行为准</div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default Wallet;
