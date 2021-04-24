import React, { useState } from 'react';
import { _getTransfer } from './_api';
import { useFetch, useVisible } from 'hooks';
import { Modal, Button } from 'antd';
import AddOrEdit from './AddOrEdit';
import { _get } from 'utils';

export default function Transfer(props: any) {
  const { onCancel, onOk } = props;
  const [visible, _switchVisible] = useVisible();
  const [stutransareatype, setStutransareatype] = useState();

  // 转入类型数据
  const { data = [] } = useFetch({
    request: _getTransfer,
  });

  return (
    <>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={() => {
            onCancel();
            _switchVisible();
            onOk();
          }}
          currentRecord={{}}
          isEdit={false}
          title={'新增学员信息'}
          studenttype={'1'}
          stutransareatype={stutransareatype}
        />
      )}
      <Modal visible title={'选择转入类型'} onCancel={onCancel} footer={null}>
        {(data || []).map((item: any) => {
          return (
            <Button
              type="primary"
              style={{ marginRight: 20 }}
              key={_get(item, 'stutransareatype')}
              onClick={() => {
                _switchVisible();
                setStutransareatype(_get(item, 'stutransareatype'));
              }}
            >
              {item.transferName}
            </Button>
          );
        })}
      </Modal>
    </>
  );
}
