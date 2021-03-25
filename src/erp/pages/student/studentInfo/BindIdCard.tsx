import React from 'react';
import { Modal, message } from 'antd';
import { _bindCard } from './_api';
import { getIdCardId, getIdCardInfo } from 'utils';
import { Loading } from 'components';
import { Auth, _get } from 'utils';
import StudentInfo from '../studentCardMaking/StudentInfo';

export default function BindIdCard(props: any) {
  const { onCancel, onOk, currentRecord, idCardId, certNum, loading, setNoSoftWareVisible } = props;
  let physicId = idCardId; //物理卡号
  let certId = certNum; //身份证号
  return (
    <Modal
      visible
      width={800}
      maskClosable={false}
      okText={'绑定二代证'}
      onCancel={onCancel}
      title="绑定二代身份证"
      onOk={async () => {
        if (!physicId || !certId) {
          const cardNoRes = await getIdCardId();
          const certNumRes = await getIdCardInfo();
          if (_get(cardNoRes, 'result') === false || _get(certNumRes, 'result') === false) {
            return setNoSoftWareVisible(); //弹出需下载软件提示窗
          }
          physicId = _get(cardNoRes, 'cardNo', '');
          certId = _get(certNumRes, 'idNo', '');
          if (!_get(cardNoRes, 'cardNo', '') || !_get(certNumRes, 'idNo', '')) {
            message.info('未检测到身份证');
            return;
          }
        }

        if (_get(currentRecord, 'idcard', '') !== certId) {
          return message.error('身份证信息不一致');
        }
        const query = {
          sid: _get(currentRecord, 'sid'),
          certCardNum: physicId,
          userid: Auth.get('userId'),
          certNum: certId,
        };
        const res = await _bindCard(query);
        if (_get(res, 'code') === 200) {
          onOk();
        }
      }}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>绑定身份证前请将身份证放置于维尔读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && <StudentInfo sid={_get(currentRecord, 'sid')} />}
    </Modal>
  );
}
