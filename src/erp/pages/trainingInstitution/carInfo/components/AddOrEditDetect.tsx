import React from 'react';
import { _get } from 'utils';
import { Modal, Form, DatePicker } from 'antd';
import { _addDetect, _updateDetect } from '../_api';
import moment from 'moment';

export default function AddDetectProtect(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title, carid } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      visible
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            carid,
            detectdate: moment(_get(values, 'detectdate')).format('YYYY-MM-DD'),
          };
          const res = isEdit
            ? await _updateDetect({ ...query, id: _get(currentRecord, 'id') })
            : await _addDetect(query);
          if (_get(res, 'code') === 200) {
            onOk();
          }
        });
      }}
    >
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          detectdate: moment(_get(currentRecord, 'detectdate')),
        }}
      >
        <Form.Item label="检测时间" name="detectdate">
          <DatePicker allowClear={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
