import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { Auth, beforeUpload, _get } from 'utils';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { USER_CENTER_URL } from 'constants/env';

interface IProps {
  imageUrl?: string;
  setImageUrl(imageUrl: any): void;
  callback?: Function;
  setImgId(imgId: any): void;
  disabled?: boolean;
  uploadTitle?: string;
}

export default function UploadPro(props: IProps) {
  const { imageUrl, setImageUrl, callback = () => {}, setImgId, disabled, uploadTitle = '点击上传' } = props;
  const [isLoading, setIsLoading] = useState(false);
  const action = USER_CENTER_URL + '/api/video-face/tmpFile/upload';

  function handleChange(info: any) {
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
        token: Auth.get('token') as string,
        Authorization: 'bearer' + Auth.get('token'),
        username: Auth.get('username') as string,
        schoolId: Auth.get('schoolId') as string,
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
          <div>{uploadTitle}</div>
        </>
      )}
    </Upload>
  );
}
