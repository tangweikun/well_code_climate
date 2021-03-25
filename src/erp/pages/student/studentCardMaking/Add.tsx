import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import { _addCard } from './_api';
import { Loading } from 'components';
import { Auth, _get } from 'utils';
import StudentInfo from './StudentInfo';

export default function Add(props: any) {
  const { onCancel, onOk, currentRecord, cardInfo, cardID, isReissue, loading, setInputCardVisible } = props;
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  let text = isReissue ? '补卡' : '制卡';

  return (
    <Modal
      visible
      width={800}
      title={text}
      maskClosable={false}
      okText={'制卡'}
      confirmLoading={btnLoading}
      onCancel={onCancel}
      onOk={() => {
        if (!cardID) {
          setInputCardVisible();
          return;
        }
        form.validateFields().then(async (values) => {
          const query = {
            barcode: cardID,
            cardData: cardInfo,
            makeType: isReissue ? '2' : '1', //制卡类型 1：制卡 2：补卡
            sid: _get(currentRecord, 'sid'),
            operator_id: Auth.get('userId'),
            stu_idcard: _get(currentRecord, 'idcard'),
            stu_name: _get(currentRecord, 'name'),
          };
          setBtnLoading(true);
          let customHeader = isReissue
            ? { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn4' }
            : { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn3' };
          const res = await _addCard(query, customHeader);
          if (_get(res, 'code') === 200) {
            onOk();
          }

          setBtnLoading(false);
        });
      }}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>制卡前请将IC卡放置于维尔读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && <StudentInfo sid={_get(currentRecord, 'sid')} />}
    </Modal>
  );
}
