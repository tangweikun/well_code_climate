import React from 'react';
import { Input, Modal, Form, Row, Alert, message, Col } from 'antd';
import { _get } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { _queryAccountInfo, _accountFund } from './_api';
import { IF, Loading } from 'components';
import { RULES } from 'constants/rules';

export default function Recharge(props: any) {
  const { onCancel, currentRecord } = props;
  const [form] = Form.useForm();
  const { data, isLoading } = useFetch({
    request: _queryAccountInfo,
    query: { sid: _get(currentRecord, 'sid', '') },
  });

  const { loading: confirmLoading, run } = useRequest(_accountFund, {
    onSuccess: onCancel,
  });

  return (
    <Modal
      visible
      width={800}
      confirmLoading={confirmLoading}
      maskClosable={false}
      okText={'确定'}
      onCancel={onCancel}
      title="充值"
      onOk={() => {
        const amount = form.getFieldValue('operAmount'); //输入金额
        const packageAmount = _get(data, 'packageAmount', 0); //套餐总额
        const rechargeAmount = _get(data, 'rechargeAmount', 0); //充值总额
        // 当充值总额+输入金额>套餐金额时
        if (Number(rechargeAmount) + Number(amount) > Number(packageAmount)) {
          return message.error('充值总额不可大于套餐金额');
        }

        form.validateFields().then(async (values) => {
          run({
            sid: _get(currentRecord, 'sid', ''),
            operAmount: _get(values, 'operAmount', 0),
          });
        });
      }}
    >
      <div>
        <IF
          condition={isLoading}
          then={<Loading />}
          else={
            <Form form={form} autoComplete="off">
              <Row className="mb20">
                <Col span={8}>姓名：{_get(currentRecord, 'name', '')}</Col>
                <Col span={8}>证件号码：{_get(currentRecord, 'idcard', '')}</Col>
                <Col span={8}></Col>
              </Row>
              <Row className="mb20">
                <Col span={8}>套餐总额：{_get(data, 'packageAmount', 0)}元</Col>
                <Col span={8}>充值总额：{_get(data, 'rechargeAmount', 0)}元</Col>
                <Col span={8}>当前余额：{_get(data, 'currentBalance', 0)}元</Col>
              </Row>
              <Form.Item
                label="请输入充值金额"
                name="operAmount"
                rules={[{ whitespace: true, required: true, message: '请输入充值金额' }, RULES.WITHDRAWAL_AMOUNT]}
              >
                <Input />
              </Form.Item>
              <Alert style={{ width: 300 }} message="充值总额不可大于套餐金额" type="warning" />
            </Form>
          }
        />
      </div>
    </Modal>
  );
}
