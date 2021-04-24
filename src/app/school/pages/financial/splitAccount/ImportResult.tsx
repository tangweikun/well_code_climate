import React from 'react';
import { Drawer } from 'antd';
import { _getCoachImport } from './_api';
import { Auth, _get } from 'utils';

interface IProps {
  onCancel(): void;
  resultData: object;
}

export default function ImportCoach(props: IProps) {
  const { onCancel, resultData } = props;

  return (
    <>
      <Drawer destroyOnClose visible width={800} title={'导入结果'} onClose={onCancel} footer={null}>
        <div>
          <div className="mt20">机构名称：{Auth.get('schoolName')}</div>
          <div className="mt20">申请导入：{_get(resultData, 'applyNum', 0)}</div>
          <div className="mt20">实际导入：{_get(resultData, 'successNum', 0)}</div>
          <div className="mt20">导入失败：{_get(resultData, 'failedNum', 0)}</div>
        </div>
      </Drawer>
    </>
  );
}
