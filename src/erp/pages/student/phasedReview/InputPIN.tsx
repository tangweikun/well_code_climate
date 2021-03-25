import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { Auth, _checkPassword, _get } from 'utils';

export default function InputPIN(props: any) {
  const { onOk, onCancel, currentId, uKeyReport, index = 0, errorCount = 0, batch = false } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <Modal
      visible
      title="请输入PIN"
      confirmLoading={loading}
      onCancel={() => {
        onCancel();
      }}
      onOk={() => {
        form.validateFields().then(async (values) => {
          setLoading(true);
          const res = await _checkPassword({
            PassWord: _get(values, 'pin', ''),
          });
          if (_get(res, 'return', '') === 0) {
            Auth.set('pin', _get(values, 'pin', ''));
            uKeyReport(currentId, index, errorCount, batch);
            onOk();
          } else {
            message.error('PIN不正确');
          }
          setLoading(false);
        });
      }}
    >
      <Form form={form} autoComplete="off">
        <Form.Item name="pin" label="PIN" rules={[{ whitespace: true, required: true, message: '请输入PIN' }]}>
          <Input placeholder="请输入PIN码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
