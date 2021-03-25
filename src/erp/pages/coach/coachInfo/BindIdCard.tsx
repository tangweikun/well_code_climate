import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { _bindCard } from './_api';
import { getIdCardId, getIdCardInfo, _get } from 'utils';
import { Loading } from 'components';
import CoachInfo from '../coachCard/CoachInfo';

export default function BindIdCard(props: any) {
  const { onCancel, onOk, currentId, currentRecord, idCardId, certNum, loading, setNoSoftWareVisible, type } = props;
  let physicId = idCardId; //物理卡号
  let certId = certNum; //身份证号
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <Modal
      visible
      width={800}
      confirmLoading={btnLoading}
      maskClosable={false}
      okText={'绑定二代证'}
      onCancel={onCancel}
      title="绑定二代身份证"
      onOk={async () => {
        if (!physicId) {
          const cardNoRes = await getIdCardId();
          const certNumRes = await getIdCardInfo();
          if (_get(cardNoRes, 'result') === false) {
            return setNoSoftWareVisible(); //弹出需下载软件提示窗
          }
          physicId = _get(cardNoRes, 'cardNo', '');
          certId = _get(certNumRes, 'idNo', '');
          if (!_get(cardNoRes, 'cardNo', '')) {
            message.info('未检测到身份证');
            return;
          }
        }
        if (String(_get(currentRecord, 'idcard', '')) !== String(certId)) {
          return message.error('身份证信息不一致');
        }
        const query = {
          cid: currentId,
          type: type,
          certCardNum: physicId,
        };

        let customHeader = {};
        if (type === '1') customHeader = { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn5' }; //教练员
        if (type === '2') customHeader = { menuId: 'assesserInfo', elementId: 'coach/assesserInfo:btn5' }; //考核员
        if (type === '3') customHeader = { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn5' }; //安全员
        setBtnLoading(true);
        const res = await _bindCard(query, customHeader);
        if (_get(res, 'code') === 200) {
          onOk();
        }
        setBtnLoading(false);
      }}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>绑定身份证前请将身份证放置于维尔读卡器读卡区</div>
      {loading && <Loading tip={'正在读卡'} />}
      {!loading && <CoachInfo cid={currentId} />}
    </Modal>
  );
}
