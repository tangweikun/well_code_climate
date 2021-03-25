import React, { useState } from 'react';
import { _get } from 'utils';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Modal } from 'antd';
import { _addContinueEdu, _getFinalAssess } from './_api';
import { useFetch } from 'hooks';
import { RULES } from 'constants/rules';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AddOrEdit(props: any) {
  const { title, onCancel, onOk } = props;
  const [form] = Form.useForm();
  const [timeRange, setTimeRange] = useState<any>([]);
  const { data = [] } = useFetch({
    request: _getFinalAssess,
  });
  const coachList: any = data;

  return (
    <Modal
      visible
      width={600}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            coachname: _get(values, 'coachname'),
            cid: _get(values, 'cid'),
            edudept: _get(values, 'edudept'),
            remark: _get(values, 'remark'),
            starttime: moment(_get(values, 'date.0')).format('YYYY-MM-DD'),
            endtime: moment(_get(values, 'date.1')).format('YYYY-MM-DD'),
          };

          const res = await _addContinueEdu(query);
          if (_get(res, 'code') === 200) {
            onOk();
          }
        });
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="带教教练" name="cid" rules={[{ required: true }]}>
          <Select style={{ width: '100%' }} placeholder="请选择教练">
            {coachList.map((x: any, index: number) => (
              <Option key={index} value={x.cid}>
                {x.coachname}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="继续教育时间" name="date" rules={[{ required: true }]}>
          <RangePicker
            style={{ width: '100%' }}
            defaultValue={timeRange}
            onChange={(dates: any) => {
              setTimeRange(dates);
            }}
          />
        </Form.Item>
        <Form.Item label="备注" name="remark" rules={[{ message: '请输入备注' }, RULES.MEMO]}>
          <Input.TextArea style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
