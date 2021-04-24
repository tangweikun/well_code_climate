import React from 'react';
import { Modal, Form, Input } from 'antd';
import { _cancelOrder } from './_api';
import { _get } from 'utils';
import { RULES } from 'constants/rules';

export default function CancelOrder(props: any) {
  const { onCancel, onOk, skuId, selectedData } = props;
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        visible
        width={600}
        title={'取消预约'}
        maskClosable={false}
        onCancel={onCancel}
        onOk={() => {
          form.validateFields().then(async (values) => {
            let res = await _cancelOrder({
              skuIds: skuId,
              cancelNote: _get(values, 'cancelNote'),
              sid: _get(selectedData, '0.sid'),
              traincode: _get(selectedData, '0.traincode'),
              skuschoolid: _get(selectedData, '0.schoolid'),
              stuschoolid: _get(selectedData, '0.stuschoolid'),
            });
            if (_get(res, 'code') === 200) {
              onOk();
            }
          });
        }}
      >
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 8 }}>
          <Form.Item
            label="取消原因"
            name="cancelNote"
            rules={[{ whitespace: true, required: true, message: '请输入取消原因' }, RULES.CANCEL_NOTE]}
          >
            <Input.TextArea></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
