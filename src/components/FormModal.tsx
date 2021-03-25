// FIXME: REMOVE

import React from 'react';
import { Modal, Form } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { _get } from 'utils';
import { Loading } from 'components';

export default function FormModal(props: any) {
  const {
    queryFields,
    idField,
    children,
    onCancel,
    currentId,
    isEdit,
    title,
    onOk,
    fetchDetailData,
    addRequest,
    updateRequest,
  } = props;
  const [form] = Form.useForm();

  const { loading: confirmLoading, run } = useRequest(isEdit ? updateRequest : addRequest, { onSuccess: onOk });

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: fetchDetailData,
  });

  const initialValues = {};
  queryFields.forEach((x: any) => {
    Object.assign(initialValues, { [x]: _get(data, x) });
  });

  return (
    <Modal
      visible
      width={800}
      confirmLoading={confirmLoading}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {};
          queryFields.forEach((x: any) => {
            Object.assign(query, { [x]: _get(values, x) });
          });
          run(isEdit ? { ...query, [idField]: currentId } : query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={initialValues}
        >
          {children}
        </Form>
      )}
    </Modal>
  );
}
