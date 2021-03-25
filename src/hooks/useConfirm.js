import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;

export function useConfirm() {
  return [_showConfirm];

  function _showConfirm({
    handleOk,
    title = '',
    content = '',
    icon = <ExclamationCircleOutlined />,
    okText = '确定',
    okType = 'danger',
    cancelText = '取消',
  }) {
    confirm({
      title,
      icon,
      content,
      okText,
      okType,
      cancelText,
      async onOk() {
        handleOk && handleOk();
      },
    });
  }
}
