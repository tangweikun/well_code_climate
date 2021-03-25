import { Button, Modal, Radio, Row } from 'antd';
import { useFetch, useRequest } from 'hooks';
import React, { useState } from 'react';
import { _getAccountInfo, _openSchoolAccount, _getBaseInfo } from './_api';
import { Auth, _get } from 'utils';
import { IF, Loading } from 'components';

interface IProps {
  onCancel(): void;
  bankChannel: any;
  setIsOpenAccount(param: boolean): void;
  setBankAccount(param: string): void;
  setAccountData(param: any): void;
  setAcctNo(param: string): void;
  setTitle(param: string): void;
  setCashAmt(param: string): void;
  setAddCardVisible(): void;
}

export default function OpenAccount(props: IProps) {
  const {
    onCancel,
    bankChannel,
    setIsOpenAccount,
    setBankAccount,
    setAccountData,
    setAcctNo,
    setTitle,
    setCashAmt,
    setAddCardVisible,
  } = props;

  const [disabled, setDisabled] = useState(true);
  const [componyName, setComponyName] = useState('');
  const [idCard, setIdcard] = useState('');
  const { confirm } = Modal;
  // 驾校基本信息详情
  const { isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data: any) => {
      setComponyName(_get(data, 'name', ''));
      setIdcard(_get(data, 'socialCredit', ''));
    },
  });

  const { loading, run } = useRequest(_openSchoolAccount, {
    onSuccess: async (res) => {
      setIsOpenAccount(true);
      let bankAcc = _get(res, 'bankAccount', '');
      setBankAccount(bankAcc);
      const ress = await _getAccountInfo({
        bankChannelId: bankChannel,
        bankAccount: bankAcc,
      });

      setAccountData(_get(ress, 'data', {}));
      setAcctNo(_get(ress, 'data.acctNo', ''));
      setTitle(_get(ress, 'data.bankName', ''));
      setCashAmt(_get(res, 'data.cashAmt', ''));
      onCancel();
      confirm({
        title: `开户成功，立即添加银行账户？`,
        content: '',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          setAddCardVisible();
        },
      });
    },
  });

  return (
    <Modal visible title={'银行开户申请'} onCancel={onCancel} footer={null} width={400}>
      <div>
        <IF
          condition={schoolDataLoading}
          then={<Loading />}
          else={
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 50, lineHeight: '30px' }}>
              <Row>企业名称：{componyName}</Row>
              <Row>证件类型：社会信用代码</Row>
              <Row>证件号码：{idCard}</Row>
              <Radio
                style={{ whiteSpace: 'normal' }}
                onChange={(e) => {
                  e.target.checked ? setDisabled(false) : setDisabled(true);
                }}
              >
                已阅读并同意
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://my.orangebank.com.cn/orgLogin/hd/act/jianzb/jzbxy.html"
                >
                  《平安银行电子商务支付结算服务协议》
                </a>
                、
                <a target="_blank" rel="noopener noreferrer" href="https://auth.orangebank.com.cn/#/m/cDealOne">
                  《平安数字用户服务协议》
                </a>
              </Radio>
            </div>
          }
        />
      </div>

      <Row justify={'end'} style={{ marginTop: 10 }}>
        <Button onClick={onCancel} style={{ marginRight: 20 }}>
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          disabled={disabled}
          onClick={() => {
            run({ bankChannelId: bankChannel });
          }}
        >
          确认
        </Button>
      </Row>
    </Modal>
  );
}
