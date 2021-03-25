import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;

export function useDeleteConfirm() {
  return [_showDeleteConfirm];

  function _showDeleteConfirm({ handleOk }) {
    confirm({
      title: '确定要删除这条数据吗？',
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        handleOk && handleOk();
      },
    });
  }
}
