import React, { useState } from 'react';
import { Modal } from 'antd';
import { _addCard } from './_api';
import { _get } from 'utils';
import { Loading } from 'components';
import CoachInfo from '../coachCard/CoachInfo';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentRecord: object | null;
  setInputCardVisible(): void;
  cardInfo: any; // TODO 不清楚业务需求
  cardID?: string;
  isReissue: boolean;
  loading: boolean;
}

export default function AddCard(props: IProps) {
  const { onCancel, onOk, currentRecord, setInputCardVisible, cardInfo, cardID, isReissue, loading } = props;
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
      onOk={async () => {
        if (!cardID) {
          setInputCardVisible();
          return;
        }
        const query = {
          barcode: cardID,
          cardData: cardInfo,
          cid: _get(currentRecord, 'cid'),
          makeType: isReissue ? '2' : '1', //制卡类型 1：制卡 2：补卡
          type: '1',
        };
        let elementId = isReissue ? 'coach/coachCard:btn2' : 'coach/coachCard:btn1';
        setBtnLoading(true);
        const res = await _addCard(query, elementId);
        if (_get(res, 'code') === 200) {
          onOk();
        }
        setBtnLoading(false);
      }}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>制卡前请将IC卡放置于维尔读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && <CoachInfo cid={_get(currentRecord, 'cid')} />}
    </Modal>
  );
}
