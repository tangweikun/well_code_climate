import React from 'react';
import { Modal, Upload, message } from 'antd';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';
import { InboxOutlined } from '@ant-design/icons';

interface IProps {
  onCancel(): void;
  fileUrl: string;
}

export default function ImportFile(props: IProps) {
  const { onCancel, fileUrl } = props;

  // 导入
  const headers = { Accept: '*/*' };
  if (Auth.isAuthenticated()) {
    Object.assign(headers, {
      token: 'bearer' + Auth.get('token'),
      schoolId: Auth.get('schoolId'),
      username: Auth.get('username'),
      Authorization: 'bearer' + Auth.get('token'),
      companyId: Auth.get('companyId'),
      userId: Auth.get('userId'),
      sysId: 'ERP',
    });
  }

  let action = `${USER_CENTER_URL}${fileUrl}`;

  function _handleFileChange(info: any) {
    if (_get(info, 'file.response') && _get(info, 'file.response.code') !== 200) {
      message.error(_get(info, 'file.response.message'));
      return;
    }

    const { status } = _get(info, 'file');
    if (status !== 'uploading') {
    }
    if (status === 'done') {
      message.success(`${info.file.name}文件导入成功`);
    }
    if (status === 'error') {
      message.error(`${_get(info, 'file.response', '文件导入失败')}`);
    }
  }

  return (
    <>
      <Modal visible title={'导入文件'} onCancel={onCancel} footer={null}>
        <Upload.Dragger
          accept={'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'} // 限制只能上传.xls、.xlsx文件
          multiple={false}
          name="file"
          headers={headers}
          onChange={_handleFileChange}
          action={action}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击导入或拖拽文件到此区域</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
}
