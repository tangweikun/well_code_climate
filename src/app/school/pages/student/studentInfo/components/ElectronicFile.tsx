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
  _getStuStageReportForLastVersion,
  _getEmploymentApplyReport,
} from '../_api';
import { _get } from 'utils';
import { createTrainRecordData, createTeachJournal } from '../_printUtils';
import { AuthButton, UpdatePlugin, AuthWrapper } from 'components';

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

  const CARD_STYLE: { style: React.CSSProperties; bodyStyle: React.CSSProperties } = {
    style: { width: 290, textAlign: 'center', margin: '0 20px 20px 0', minHeight: 200 },
    bodyStyle: {
      height: 'calc(100% - 57px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info="????????????????????????" plugin="print_package.zip" />
      )}
      {String(_get(currentRecord, 'contractflag', '')) !== '0' && (
        <Card title="????????????" {...CARD_STYLE}>
          <Button
            style={{ marginRight: 20 }}
            onClick={() => {
              if (Object.keys(tempData).length === 0) {
                message.error('?????????????????????????????????????????????');
                return;
              }
              _getContractFile({
                sid,
              }).then((res) => {
                window.open(_get(res, 'data'));
              });
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            onClick={() => {
              _getContractFile({
                sid,
              }).then((res) => {
                if (!res) {
                  message.error('?????????????????????????????????????????????');
                  return;
                }
                const link = document.createElement('a');
                link.href = _get(res, 'data', '');
                link.download = '????????????.pdf';
                link.click();
              });
            }}
          >
            ??????
          </Button>
        </Card>
      )}
      <Card title="???????????????" {...CARD_STYLE}>
        <div>
          <AuthButton
            insertWhen={_get(currentRecord, 'traintype', '') === 'A2' || _get(currentRecord, 'traintype', '') === 'B2'} //// ??????A2???B2????????????
            authId="student/studentInfo:btn18"
            className="mr20"
            onClick={async () => {
              const res = await _getStuStageReportStageTaoda({ sid });
              const data = _get(res, 'data', {});
              if (Object.keys(data).length === 0) {
                return message.error(_get(res, 'message'));
              }
              const printRes = await createTrainRecordData(data);
              if (printRes === 'NO_SOFTWARE') {
                setNoSoftwareVisible();
              }
            }}
          >
            ??????
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
            ??????
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
            ??????
          </Button>
        </div>
      </Card>
      <Card title="????????????" {...CARD_STYLE}>
        <Button
          style={{ marginRight: 20 }}
          onClick={async () => {
            const res = await _getFileUrl({ id: sid });
            if (!_get(res, 'data')) {
              message.error('????????????????????????????????????');
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          ??????
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const res = await _getFileUrl({ id: sid });
            if (!_get(res, 'data')) {
              message.error('????????????????????????????????????');
              return;
            }
            window.open(_get(res, 'data'));
          }}
        >
          ??????
        </Button>
      </Card>

      <Card title="???????????????" {...CARD_STYLE}>
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
          ??????
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
          ??????
        </Button>
      </Card>

      <Card title="??????????????????" {...CARD_STYLE}>
        <div>
          <Select
            style={{ width: 170 }}
            value={subject}
            options={[{ value: '0', label: '????????????(??????)' }, ...useOptions('trans_part_type')]}
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
            ??????
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
            ??????
          </Button>
        </div>
      </Card>
      {isShowTeachJournalPrint &&
        (_get(currentRecord, 'traintype', '') === 'A2' || _get(currentRecord, 'traintype', '') === 'B2') && ( // ??????A2???B2????????????
          <Card title="????????????????????????" {...CARD_STYLE}>
            <div>
              <Button
                className="mr20"
                type="primary"
                onClick={() => {
                  print(1);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20"
                type="primary"
                onClick={() => {
                  print(2);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20 mt10"
                type="primary"
                onClick={() => {
                  print(3);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20 mt10"
                type="primary"
                onClick={() => {
                  print(4);
                }}
              >
                ?????????
              </Button>
            </div>
          </Card>
        )}

      <AuthWrapper authId="student/studentInfo:btn22">
        <Card title="????????????????????????" {...CARD_STYLE}>
          <Button
            className="mr20"
            onClick={async () => {
              const res = await _getStuStageReportForLastVersion({ sid });
              if (_get(res, 'code') !== 200) {
                message.error(_get(res, 'message'));
                return;
              }
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              const res = await _getStuStageReportForLastVersion({ sid });
              if (_get(res, 'code') !== 200) {
                message.error(_get(res, 'message'));
                return;
              }
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
        </Card>
      </AuthWrapper>

      <AuthWrapper
        authId="student/studentInfo:btn23"
        insertWhen={_get(currentRecord, 'traintype', '') === 'A2' || _get(currentRecord, 'traintype', '') === 'B2'} //// ??????A2???B2????????????
      >
        <Card title="???????????????????????????" {...CARD_STYLE}>
          <Button
            className="mr20"
            onClick={async () => {
              const res = await _getEmploymentApplyReport({ sid });
              if (_get(res, 'code') !== 200) {
                message.error(_get(res, 'message'));
                return;
              }
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              const res = await _getEmploymentApplyReport({ sid });
              if (_get(res, 'code') !== 200) {
                message.error(_get(res, 'message'));
                return;
              }
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
        </Card>
      </AuthWrapper>
    </div>
  );
}
