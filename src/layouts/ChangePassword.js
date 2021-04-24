import React from 'react';
import { message, Input, Form, Modal } from 'antd';
import { Auth, _get } from 'utils';
import { _updatePassword } from './_api';
import { RULES } from 'constants/rules';

export default function Edit(props) {
  const [form] = Form.useForm();
  const { title, onOk, onCancel } = props;

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <Modal
      maskClosable={false}
      title={title}
      visible
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (values.newPassword === values.confirmPassword) {
            const res = await _updatePassword({
              id: Auth.get('userId'),
              newPassword: _get(values, 'newPassword'),
              oldPassword: _get(values, 'oldPassword'),
            });
            if (_get(res, 'code') === 200) {
              onOk();
            } else {
              message.error(_get(res, 'message'));
            }
          } else {
            message.error('新密码与确认新密码必须保持一致');
          }
        });
      }}
      onCancel={onCancel}
    >
      <Form form={form} {...layout}>
        <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入原密码!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入新密码!',
            },
            RULES.CHANGE_PASSWORD,
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入确认密码!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
}
