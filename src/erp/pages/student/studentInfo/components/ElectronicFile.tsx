import React, { useState } from 'react';
import { Button, Card, message, Select } from 'antd';
import { useAuth, useFetch, useOptions, useVisible } from 'hooks';
import {
  _getSchContractTemp,
  _getDetails,
  _trainExam,
  _getFileUrl,
  _getContractFile,
  _getDriveTrainApplyReport,
  _getTrainClassReport,
  _getStuStageReportStageTaoda,
  _getStuClassRecordReportStageTaoda,
  _getStuClassRecordReportStageTaodaSubject,
} from '../_api';
import { _get } from 'utils';
import { createTrainRecordData, createTeachJournal } from '../_printUtils';
import { AuthButton, UpdatePlugin } from 'components';

export default function ElectronicFile(props: any) {
  const { sid, currentRecord } = props;
  const [subject, setSubject] = useState('0');
  const [noSoftwareVisible, setNoSoftwareVisible] = useVisible();

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
  const isShowTeachJournalPrint = useAuth('student/studentInfo:btn19');

  async function print(subject: any) {
    const res = await _getStuClassRecordReportStageTaodaSubject({ sid, subject });
    const data = _get(res, 'data', {});
    if (Object.keys(data).length === 0) {
      return message.error(_get(res, 'message'));
    }
    const printRes = createTeachJournal(data, subject);
    if (printRes === 'NO_SOFTWARE') {
      setNoSoftwareVisible();
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info="无法调用打印程序" plugin="print_package.zip" />
      )}
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
      <Card title="培训记录单" style={{ width: 300, textAlign: 'center' }}>
        <AuthButton
          insertWhen={_get(currentRecord, 'traintype', '') === 'A2' || _get(currentRecord, 'traintype', '') === 'B2'} //// 只有A2和B2需要套打
          authId="student/studentInfo:btn18"
          className="mr20"
          onClick={async () => {
            const res = await _getStuStageReportStageTaoda({ sid });
            const data = _get(res, 'data', {});
            if (Object.keys(data).length === 0) {
              return message.error(_get(res, 'message'));
            }
            const printRes = createTrainRecordData(data);
            if (printRes === 'NO_SOFTWARE') {
              setNoSoftwareVisible();
            }
          }}
        >
          套打
        </AuthButton>
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

      <Card title="学员申请表" style={{ width: 300 }} className="text-center">
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

      <Card title="电子教学日志" style={{ width: 300 }} className="text-center">
        <Select
          style={{ width: 170 }}
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
      {isShowTeachJournalPrint &&
        (_get(currentRecord, 'traintype', '') === 'A2' || _get(currentRecord, 'traintype', '') === 'B2') && ( // 只有A2和B2需要套打
          <Card title="电子教学日志套打" style={{ width: 300 }} className="text-center mt20">
            <Button
              className="mr20"
              type="primary"
              onClick={() => {
                print(1);
              }}
            >
              科目一
            </Button>
            <Button
              className="mr20"
              type="primary"
              onClick={() => {
                print(2);
              }}
            >
              科目二
            </Button>
            <Button
              className="mr20 mt10"
              type="primary"
              onClick={() => {
                print(3);
              }}
            >
              科目三
            </Button>
            <Button
              className="mr20 mt10"
              type="primary"
              onClick={() => {
                print(4);
              }}
            >
              科目四
            </Button>
          </Card>
        )}
    </div>
  );
}
