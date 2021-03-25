import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { _addStudentRetire } from './_api';
import { _get } from 'utils';
import { useRequest } from 'hooks';

export default function Reason(props: any) {
  const { onCancel, onOk, selectedRowKeys } = props;
  const [reason, setReason] = useState('');

  function _handleChange(e: any): any {
    setReason(e.target.value);
  }

  const { loading: confirmLoading, run } = useRequest(_addStudentRetire, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      title={'退学原因'}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        if (!reason.trim()) {
          message.error('请输入失败原因');
          return;
        }
        run({ sid: _get(selectedRowKeys, '0'), reason: reason });
      }}
    >
      <Input placeholder={'请输入退学原因'} onChange={_handleChange} />
    </Modal>
  );
}
