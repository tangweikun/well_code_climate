import React from 'react';
import { Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Auth, beforeUpload, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';

const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

export default function MultipleUpload(props) {
  const { fileList = [], setFileList, limit = 100 } = props;

  return (
    <Upload
      accept={'.jpg,.png'}
      headers={{
        token: Auth.get('token'),
        Authorization: 'bearer' + Auth.get('token'),
        username: Auth.get('username'),
        schoolId: Auth.get('schoolId'),
      }}
      action={action}
      listType="picture-card"
      onPreview={() => {
        return;
      }}
      beforeUpload={beforeUpload}
      onChange={(obj) => {
        const foo = _get(obj, 'fileList', []).map((x) => {
          return x.name
            ? { id: _get(x, 'response.data.id'), url: _get(x, 'response.data.url') }
            : { id: '', url: _get(x, 'url') };
        });
        setFileList(foo);
      }}
      defaultFileList={[...fileList.map((x) => ({ ...x, uid: Math.random() }))]}
    >
      {limit > _get(fileList, 'length') && (
        <>
          <PlusOutlined />
          <div>点击上传</div>
        </>
      )}
    </Upload>
  );
}
