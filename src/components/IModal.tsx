import React from 'react';
import { Modal, Spin } from 'antd';

export default function IModal(props: any) {
  const { spinning = false, ...rest } = props;

  return (
    <Modal {...rest}>
      <Spin spinning={spinning}>{props.children}</Spin>
    </Modal>
  );
}
