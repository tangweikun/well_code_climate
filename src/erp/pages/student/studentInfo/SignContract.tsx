/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Modal, message, Row, Button } from 'antd';
import {
  _openHanDev,
  _initHanDev,
  _closeHanDev,
  _getSign,
  _clearDev,
  _quitHWProc,
  _getConfirm,
  base64ConvertFile,
} from 'utils';
import { _uploadImg } from 'api';
import { useInterval, useVisible } from 'hooks';
import { _previewContract, _submitStuSignature } from './_api';
import { isForceUpdatePlugin, _get, previewPdf } from 'utils';
import { UpdatePlugin } from 'components';

interface TProps {
  onCancel(): void;
  onOk(): void;
  data: any;
  schContractTempitemList: any;
  currentRecord: any;
}

export default function SignContract(props: TProps) {
  const { onCancel, onOk, data, schContractTempitemList, currentRecord } = props;
  const [sign, setSign] = useState('');
  const [delay, setDelay] = useState(0);
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();

  const getSign = async () => {
    const res = await _getSign();
    if (_get(res, 'return', '') !== -1) {
      setSign(_get(res, 'result', ''));
      const res2 = await _getConfirm();
      if (_get(res2, 'return', '') === 0) {
        setDelay(0);
      }
    } else {
      message.error('请确认写字板是否连接');
    }
  };
  const closeDev = async () => {
    await _closeHanDev();
    await _quitHWProc();
  };

  useInterval(getSign, delay); //轮训获取写字板上的签字

  useEffect(() => {
    async function openDev() {
      const update: any = await isForceUpdatePlugin();
      if (update) {
        return setUpdatePluginVisible();
      }
      const res = await _openHanDev();
      if (_get(res, 'result', '') === false) {
        message.error('请确认插件是否开启或已下载最新插件');
        return;
      }
      if (_get(res, 'return', '') !== -1) {
        const res2 = await _initHanDev();
        if (_get(res2, 'return', '') === 0) {
          await getSign();
          setDelay(800);
        } else {
          message.error('请确认写字板是否连接');
        }
      } else {
        message.error('请确认写字板是否连接');
      }
    }
    openDev();
  }, []);

  return (
    <Modal
      visible
      width={630}
      title={'签字板'}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        setDelay(0);
        closeDev();
        onCancel();
      }}
    >
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法在线签字" />}

      <div style={{ width: 600, height: 300 }}>
        <img src={sign} alt="" />
      </div>
      <Row justify="end">
        <Button
          onClick={() => {
            setDelay(0);
            closeDev();
            onCancel();
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: 20 }}
          onClick={() => {
            if (Object.keys(data).length === 0) {
              message.error('当前没有该车型的合同内容项模板');
              return false;
            }
            _previewContract({
              sid: _get(currentRecord, 'sid'),
              cartype: _get(currentRecord, 'traintype'),
              schContractTempitemList,
              tempid: _get(data, 'tempid'),
            }).then((res: any) => {
              previewPdf([res]);
            });
          }}
        >
          预览合同
        </Button>
        <Button
          style={{ marginLeft: 20 }}
          type="primary"
          onClick={async () => {
            if (!sign) {
              return message.error('未获取到签名');
            }
            setDelay(0);
            await _clearDev();

            const file = base64ConvertFile(sign);
            let formData = new FormData();
            formData.append('file', file);
            const imgRes = await _uploadImg(formData); // 上传
            closeDev();
            const res = await _submitStuSignature({
              sid: _get(currentRecord, 'sid'),
              fileid: _get(imgRes, 'data.id', ''),
            });
            if (_get(res, 'code') === 200) {
              onOk();
            }
          }}
        >
          确认签订合同
        </Button>
      </Row>
    </Modal>
  );
}
