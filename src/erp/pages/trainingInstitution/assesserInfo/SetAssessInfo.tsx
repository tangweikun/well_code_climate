import React, { useState } from 'react';
import { Modal, Form, Select } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { _getDefaultAssess, _addDefaultAssess, _getAssessList } from './_api';
import { _get } from 'utils';
import { Loading } from 'components';
interface IProps {
  onCancel(): void;
  onOk(): void;
}

export default function AddOrEdit(props: IProps) {
  const { onCancel, onOk } = props;
  const [form] = Form.useForm();
  const [trainsOptionData, setTrainsOptionData] = useState([] as any[]); // 默认培训考核员
  const [examsOptionData, setExamsOptionData] = useState([] as any[]); // 默认结业考核员

  const { data, isLoading } = useFetch({
    request: _getDefaultAssess,
  });

  useFetch({
    request: _getAssessList,
    query: {
      coachname: '',
    },
    callback: (data: any) => {
      const assessListData = _get(data, 'rows', []).map((x: any) => {
        return { label: _get(x, 'coachname'), value: _get(x, 'cid') };
      });
      setTrainsOptionData(assessListData);
      setExamsOptionData(assessListData);
    },
  });

  const { loading: confirmLoading, run } = useRequest(_addDefaultAssess, {
    onSuccess: onOk,
  });

  const combinedTrainsOptionData = [...trainsOptionData];
  if (
    !trainsOptionData.find((x) => x.value === _get(data, 'isexaminer_trains.0.cid')) &&
    _get(data, 'isexaminer_trains.0.cid')
  ) {
    combinedTrainsOptionData.unshift({
      label: _get(data, 'isexaminer_trains.0.coachname'),
      value: _get(data, 'isexaminer_trains.0.cid'),
    });
  }

  const combinedExamsOptionData = [...examsOptionData];
  if (
    !examsOptionData.find((x) => x.value === _get(data, 'isexaminer_exams.0.cid')) &&
    _get(data, 'isexaminer_exams.0.cid')
  ) {
    combinedExamsOptionData.unshift({
      label: _get(data, 'isexaminer_exams.0.coachname'),
      value: _get(data, 'isexaminer_exams.0.cid'),
    });
  }

  return (
    <Modal
      visible
      title={'考核员设置'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then((values: any) => {
          run({ examinerExamId: _get(values, 'examinerExamId'), examinertrainId: _get(values, 'examinertrainId') });
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            examinertrainId: _get(data, 'isexaminer_trains.0.cid'),
            examinerExamId: _get(data, 'isexaminer_exams.0.cid'),
          }}
        >
          <Form.Item label="默认培训考核员" name="examinertrainId" rules={[{ required: true }]}>
            <Select
              showSearch
              filterOption={false}
              onSearch={(value) => {
                _getAssessList({ coachname: value }).then((res: any) => {
                  setTrainsOptionData(
                    _get(res, 'data.rows', []).map((x: any) => ({
                      value: _get(x, 'cid', ''),
                      label: _get(x, 'coachname', ''),
                    })),
                  );
                });
              }}
              options={combinedTrainsOptionData}
            />
          </Form.Item>
          <Form.Item label="默认结业考核员" name="examinerExamId">
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={(value) => {
                _getAssessList({ coachname: value }).then((res: any) => {
                  setExamsOptionData(
                    _get(res, 'data.rows', []).map((x: any) => ({
                      value: _get(x, 'cid', ''),
                      label: _get(x, 'coachname', ''),
                    })),
                  );
                });
              }}
              options={combinedExamsOptionData}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
