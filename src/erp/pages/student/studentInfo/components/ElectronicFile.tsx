import React, { useState } from 'react';
import { Button, Card, message, Select } from 'antd';
import { useFetch, useOptions } from 'hooks';
import {
  _getSchContractTemp,
  _getDetails,
  _trainExam,
  _getFileUrl,
  _getContractFile,
  _getDriveTrainApplyReport,
  _getTrainClassReport,
} from '../_api';
import { _get } from 'utils';

export default function Details(props: any) {
  const { sid, currentRecord } = props;
  const [subject, setSubject] = useState('0');

  useFetch({
    query: {
      id: sid,
    },
    request: _getDetails,
  });

  const { data: tempData = {} } = useFetch({
    query: {
      sid: sid,
    },
    request: _getSchContractTemp,
  });

  useFetch({
    query: {
      sid: sid,
    },
    request: _getContractFile,
    callback: (data) => {
      console.log(data);
    },
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      {String(_get(currentRecord, 'contractflag', '')) !== '0' && (
        <Card title="电子合同" style={{ width: 200, textAlign: 'center' }}>
          <Button
            style={{ marginRight: 20 }}
            onClick={() => {
              if (Object.keys(tempData).length === 0) {
                message.error('当前没有该车型的合同内容项模板');
                return;
              }
              _getContractFile({
                sid,
              }).then((res) => {
                window.open(_get(res, 'data'));
              });
            }}
          >
            预览
          </Button>
          <Button
            type="primary"
            onClick={() => {
              _getContractFile({
                sid,
              }).then((res) => {
                if (!res) {
                  message.error('当前没有该车型的合同内容项模板');
                  return;
                }
                const link = document.createElement('a');
                link.href = _get(res, 'data', '');
                link.download = '电子合同.pdf';
                link.click();
              });
            }}
          >
            下载
          </Button>
        </Card>
      )}
      <Card title="培训记录单" style={{ width: 200, textAlign: 'center' }}>
        <Button
          style={{ marginRight: 20 }}
          onClick={async () => {
            const res = await _trainExam({ id: sid });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          预览
        </Button>
        <Button
          onClick={async () => {
            const res = await _trainExam({ id: sid });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
          type="primary"
        >
          下载
        </Button>
      </Card>
      <Card title="结业证书" style={{ width: 200, textAlign: 'center' }}>
        <Button
          style={{ marginRight: 20 }}
          onClick={async () => {
            const res = await _getFileUrl({ id: sid });
            if (!_get(res, 'data')) {
              message.error('当前没有该车型的结业证书');
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          预览
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const res = await _getFileUrl({ id: sid });
            if (!_get(res, 'data')) {
              message.error('当前没有该车型的结业证书');
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          下载
        </Button>
      </Card>

      <Card title="学员申请表" style={{ width: 200 }} className="text-center">
        <Button
          className="mr20"
          onClick={async () => {
            const res = await _getDriveTrainApplyReport({ id: sid });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          预览
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const res = await _getDriveTrainApplyReport({ id: sid });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          下载
        </Button>
      </Card>

      <Card title="电子教学日志" style={{ width: 200 }} className="text-center">
        <Select
          style={{ width: 140 }}
          value={subject}
          options={[{ value: '0', label: '培训部分(全部)' }, ...useOptions('trans_part_type')]}
          onChange={(val: any) => {
            setSubject(val);
          }}
          className="text-center mb20"
        />

        <Button
          className="mr20"
          onClick={async () => {
            const res = await _getTrainClassReport({ id: sid, subject });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          预览
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const res = await _getTrainClassReport({ id: sid, subject });
            if (!_get(res, 'data')) {
              message.error(_get(res, 'message'));
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          下载
        </Button>
      </Card>
    </div>
  );
}
