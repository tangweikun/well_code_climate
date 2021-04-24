import React, { useState } from 'react';
import { message, Modal, Table } from 'antd';
import { _get } from 'utils';
import { useFetch, useHash } from 'hooks';
import { _updateTraSign, _noResetList } from './_api';

export default function ChangeReset(props: any) {
  const { onCancel, onOk, idCard, type } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);

  const traincodeHash = useHash('subject_type'); // 签到状态
  const signTypeHash = useHash('signType', true); // 课程方式

  const columns = [
    { title: '签到状态', dataIndex: 'signType', render: (signType: any) => signTypeHash[signType] },
    { title: '签到设备类型', dataIndex: 'traincode', render: (traincode: any) => traincodeHash[traincode] },
    { title: '签到设备编号', dataIndex: 'termcode' },
    { title: '签到时间', dataIndex: 'signintime' },
  ];

  const { isLoading, data } = useFetch({
    request: _noResetList,
    query: {
      idcard: idCard,
      type,
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  const TYPE: any = {
    '1': '学员',
    '2': '教练',
  };

  return (
    <Modal
      visible
      title={TYPE[type] + _get(data, 'title')}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        if (selectedRowKeys.length < 1) {
          message.error('请至少选择一条数据');
          return false;
        }
        const res = await _updateTraSign({ ids: selectedRowKeys, type });
        if (_get(res, 'code') === 200) {
          onOk();
        }
      }}
    >
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        dataSource={_get(data, 'traSignDevDtos', [])}
        rowKey={(record) => _get(record, 'id')}
      />
    </Modal>
  );
}
