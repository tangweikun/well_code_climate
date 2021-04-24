/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useReducer, useEffect } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Steps, Alert } from 'antd';
import { sendSMS, _bindBankCard, checkAmount, _queryApplyingBankCard, _getBaseInfo } from './_api';
import { RULES } from 'constants/rules';
import { useCountdown, useFetch, useOptions, useVisible } from 'hooks';
import { Auth, _get } from 'utils';
import { IF, Loading } from 'components';

function BindBankCard(props: any) {
  const { onCancel, bankChannelId, bankAccount, acctNo, onOK } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [bindApplicationId, setBindApplicationId] = useState('');
  const [accName, setAccName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNo, setBankNo] = useState('');
  const [accMobile, setAccMobile] = useState('');
  const [accId, setAccId] = useState('');
  const [reprName, setReprName] = useState('');
  const cardTypeOptions = useOptions('binding_card_cert_type'); // 证件类型
  const [idCardRules, setIdCardRules] = useState(RULES.ID_CARD);
  const { Step } = Steps;
  const [time, dispatch] = useReducer((x) => x - 1, 3);
  const [errorVisible, setErrorVisible] = useVisible();

  const { count, isCounting, setIsCounting } = useCountdown(60);
  const steps = [
    {
      title: '绑定账户',
      content: 'First-content',
    },
    {
      title: '小额验证',
      content: 'Second-content',
    },
  ];
  useEffect(() => {
    if (time === 0) {
      setErrorVisible();
    }
  }, [time]);

  const { isLoading: bankStatusLoading } = useFetch({
    request: _queryApplyingBankCard,
    query: {
      bankAccount,
      bankChannelId,
    },
    callback: (data) => {
      if (Object.keys(data).length === 0) {
        setCurrent(0);
      } else {
        setCurrent(1);
        setAccName(_get(data, 'accName', ''));
        setBankName(_get(data, 'bankName', ''));
        setBankNo(_get(data, 'bankNo', ''));
        setBindApplicationId(_get(data, 'bindApplicationId', ''));
        setAccMobile(_get(data, 'accMobile', ''));
      }
    },
  });
  // 驾校基本信息详情
  const { data: schoolData, isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data) => {
      setAccName(_get(data, 'name', ''));
      setAccId(_get(data, 'socialCredit', ''));
      setReprName(_get(data, 'legalPerson', ''));
    },
  });

  //获取中间四位隐藏的手机号，例如：130****9970
  function getPhoneNum(str: any) {
    if (!str.match(RULES.TEL_11.pattern)) return '';
    const result = str
      .match(/(\d{3})(\d{4})(\d{4})/)
      .slice(1)
      .reduce(function (value: any, item: any, index: any) {
        return index === 1 ? value + '****' : value + item;
      });
    return result;
  }

  return (
    <Modal visible width={800} title={'绑定银行卡'} maskClosable={false} onCancel={onCancel} footer={null}>
      {errorVisible && (
        <Modal visible width={800} title={'验证失败'} maskClosable={false} onCancel={setErrorVisible} footer={null}>
          <Alert
            message={<span style={{ color: '#F56C6C' }}>审核不通过：打款金额或序号有误！</span>}
            type="error"
            className="mb20"
            style={{ textAlign: 'center' }}
          />
          <div className="ml20 mr20 flex-box" style={{ flexDirection: 'column' }}>
            <Row className="mb20">银行账户类型：对公银行账户</Row>
            <Row className="mb20">银行开户名：{accName}</Row>
            <Row className="mb20">开户银行：{bankName}</Row>
            <Row className="mb20">银行账号：{bankNo}</Row>
            <Row className="mb20">手机号码：{accMobile}</Row>
            <Button
              type="primary"
              onClick={() => {
                setErrorVisible();
                setCurrent(0);
              }}
            >
              重新绑定
            </Button>
          </div>
        </Modal>
      )}
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div>
        <IF
          condition={bankStatusLoading || schoolDataLoading}
          then={<Loading />}
          else={
            <Form
              form={form}
              autoComplete="off"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValues={{
                accName: _get(schoolData, 'name'),
                accId: _get(schoolData, 'socialCredit'),
                reprName: _get(schoolData, 'legalPerson'), //回显驾校全称、信用代码、法人名称
                reprGlobalType: '1', //证件类型默认身份证
              }}
            >
              {current === 0 && (
                <>
                  <Form.Item
                    label="银行开户名"
                    name="accName"
                    rules={[{ whitespace: true, required: true, message: '请输入银行开户名' }, RULES.BANK_ACCOUNT]}
                  >
                    <Input onChange={(e: any) => setAccName(e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label="社会信用代码（注册号）"
                    name="accId"
                    rules={[
                      { whitespace: true, required: true, message: '如:91888888M000000BFCJ8L' },
                      RULES.SOCIAL_CREDIT_CODE,
                    ]}
                  >
                    <Input onChange={(e: any) => setAccId(e.target.value)} />
                  </Form.Item>

                  <Form.Item
                    label="法人姓名"
                    name="reprName"
                    rules={[{ whitespace: true, required: true, message: '请输入法人姓名' }]}
                  >
                    <Input onChange={(e: any) => setReprName(e.target.value)} />
                  </Form.Item>

                  <Form.Item
                    label="法人证件类型"
                    name="reprGlobalType"
                    rules={[{ whitespace: true, required: true, message: '请选择证件类型' }]}
                  >
                    <Select
                      options={cardTypeOptions}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      onChange={(value: string) => {
                        if (value === '1') {
                          setIdCardRules(RULES.ID_CARD); //身份证号 根据身份证号校验
                        } else {
                          setIdCardRules(RULES.OTHER_IDCARD); //身份证号 根据身份证号校验
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="reprGlobalId"
                    label="法人证件号码"
                    rules={[{ whitespace: true, required: true, message: '请输入证件号码' }, idCardRules]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item label="银行账户类型">对公银行账户</Form.Item>

                  <Form.Item
                    label="开户银行"
                    name="bankName"
                    rules={[{ whitespace: true, required: true, message: '请输入开户银行' }, RULES.BANK_NAME]}
                  >
                    <Input onChange={(e) => setBankName(e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label="银行账号"
                    name="bankNo"
                    rules={[{ whitespace: true, required: true, message: '请输入银行账号' }, RULES.BANK_CARD]}
                  >
                    <Input onChange={(e) => setBankNo(e.target.value)} />
                  </Form.Item>
                  <Row>
                    <Col span={12} offset={3}>
                      <Form.Item
                        label="手机号码"
                        name="accMobile"
                        rules={[{ whitespace: true, required: true, message: '请输入手机号码' }, RULES.TEL_11]}
                      >
                        <Input
                          onChange={(e) => {
                            setAccMobile(e.target.value);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        loading={loading}
                        disabled={isCounting}
                        style={{ marginLeft: 10 }}
                        onClick={async (e: any) => {
                          form
                            .validateFields(['accName', 'accId', 'bankName', 'bankNo', 'accMobile'])
                            .then(async () => {
                              setLoading(true);
                              await sendSMS({
                                mobilePhone: accMobile,
                              });
                              setLoading(false);
                              setIsCounting(true);
                            });
                        }}
                      >
                        {isCounting ? `重新获取(${count})` : '获取验证码'}
                      </Button>
                    </Col>
                  </Row>

                  <Form.Item
                    label="验证码"
                    name="captcha"
                    rules={[{ whitespace: true, required: true, message: '请输入验证码' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Row justify={'end'}>
                    <Button
                      type="primary"
                      loading={confirmLoading}
                      onClick={() => {
                        form.validateFields().then(async (values) => {
                          setConfirmLoading(true);
                          const res = await _bindBankCard({
                            accId,
                            accMobile,
                            accName,
                            acctNo,
                            bankChannelId,
                            bankName,
                            bankNo,
                            credentType: 73,
                            captcha: _get(values, 'captcha', ''),
                            reprGlobalId: _get(values, 'reprGlobalId', ''),
                            reprGlobalType: _get(values, 'reprGlobalType', ''),
                            reprName,
                          });
                          if (_get(res, 'code') === 200) {
                            setCurrent(1);
                            setBindApplicationId(_get(res, 'data.bindApplicationId'));
                          }
                          setConfirmLoading(false);
                        });
                      }}
                    >
                      确认
                    </Button>
                  </Row>
                </>
              )}

              {current === 1 && (
                <>
                  <Alert
                    message={`请输入银行转账金额及手机号{${getPhoneNum(accMobile)}，中间四位脱敏}接受短信的鉴权序号。`}
                    type="warning"
                    style={{ margin: 10, textAlign: 'center' }}
                  />
                  <Form.Item
                    label="打款金额"
                    name="receiveAmt"
                    rules={[{ whitespace: true, required: true, message: '请输入打款金额' }, RULES.WITHDRAWAL_AMOUNT]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="鉴权序号"
                    name="orderNo"
                    rules={[{ whitespace: true, required: true, message: '请输入鉴权序号' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 6 }}>
                    <Button
                      type="primary"
                      style={{ marginRight: 20 }}
                      loading={loading}
                      onClick={() => {
                        form.validateFields().then(async ({ receiveAmt, orderNo }) => {
                          let cardType = '1';
                          const res = await checkAmount({
                            bankChannelId,
                            bankName,
                            bankNo,
                            bindApplicationId,
                            cardType,
                            receiveAmt,
                            orderNo,
                          });
                          if (_get(res, 'code') === 200) {
                            onOK();
                          } else {
                            dispatch(); //计数报错三次进入验证失败页面
                          }
                        });
                      }}
                    >
                      确认
                    </Button>
                  </Form.Item>
                  <Form.Item label="银行账户类型">对公银行账户</Form.Item>
                  <Form.Item label="银行开户名">{accName}</Form.Item>
                  <Form.Item label="开户银行">{bankName}</Form.Item>
                  <Form.Item label="银行账号">{bankNo}</Form.Item>
                  <Form.Item label="手机号码">{accMobile}</Form.Item>
                </>
              )}
            </Form>
          }
        />
      </div>
    </Modal>
  );
}

export default BindBankCard;
