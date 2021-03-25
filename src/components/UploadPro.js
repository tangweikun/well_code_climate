import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { Auth, beforeUpload, _get } from 'utils';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';

export default function UploadPro(props) {
  const { imageUrl, setImageUrl, callback = () => {}, setImgId, disabled } = props;
  const [isLoading, setIsLoading] = useState(false);
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

  function handleChange(info) {
    if (info.file.status === 'uploading') {
      setIsLoading(true);
    }

    if (info.file.status === 'done') {
      setIsLoading(false);
      const fileUrl = _get(info, 'file.response.data.url');
      setImageUrl(fileUrl);
      setImgId && setImgId(_get(info, 'file.response.data.id'));
      callback({ img: fileUrl, id: _get(info, 'file.response.data.id') });
    }

    if (info.file.status === 'error') {
      message.error('上传失败');
      setIsLoading(false);
    }
  }

  return (
    <Upload
      headers={{
        token: Auth.get('token'),
        Authorization: 'bearer' + Auth.get('token'),
        username: Auth.get('username'),
        schoolId: Auth.get('schoolId'),
      }}
      accept={'.jpg,.png'}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={action}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      disabled={isLoading || disabled}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ width: '100%' }} />
      ) : (
        <>
          {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
          <div>点击上传</div>
        </>
      )}
    </Upload>
  );
}
