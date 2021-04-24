import { Button, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { _uploadImg } from 'api';
import { base64ConvertFile, getUserMedia } from 'utils';
import { useRequest } from 'hooks';

interface IProps {
  onCancel(): void;
  getImgData(param: any): void;
  onOk(): void;
}

const width = 420;
const height = 350;

export default function Photograph(props: IProps) {
  const { onCancel, getImgData, onOk } = props;
  const [imgData, setImgData] = useState('');

  useEffect(() => {
    const video = document.getElementById('video') as HTMLVideoElement;
    const oBtn = document.getElementById('okBtn') as HTMLElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    const callCameraSuccess = getUserMedia({ video: { height: height, width: width } }, success, error);

    oBtn.addEventListener(
      'click',
      function () {
        if (callCameraSuccess === true && video.srcObject) {
          //getUserMedia返回false说明调用失败
          context.drawImage(video, 0, 0, width, height);
          var base64imgData = canvas.toDataURL();
          setImgData(base64imgData);
        } else {
          message.error('请确认摄像头已启用');
        }
      },
      false,
    );

    function success(stream: any) {
      video.srcObject = stream;
      video.play();
    }

    function error() {
      message.error('请确认摄像头已启用');
      return false;
    }
  }, []);

  const { loading: saveLoading, run } = useRequest(_uploadImg, {
    onSuccess: (data) => {
      getImgData(data);
      onOk();
    },
  });

  return (
    <Modal
      visible
      title={'拍照'}
      maskClosable={false}
      onCancel={onCancel}
      width={1000}
      footer={
        <div>
          <Button key="back" onClick={onCancel}>
            取消
          </Button>
          <Button
            loading={saveLoading}
            key="submit"
            id="save"
            type="primary"
            onClick={async () => {
              if (!imgData) {
                return message.error('请先拍照');
              }
              const file = base64ConvertFile(imgData);
              let formData = new FormData();
              formData.append('file', file);
              run(formData);
            }}
          >
            保存
          </Button>
        </div>
      }
    >
      <video id="video" height={height} width={width}></video>

      <Button id="okBtn" type="primary" style={{ marginLeft: 20, marginRight: 20 }}>
        拍照
      </Button>
      <canvas id="canvas" height={height} width={width}></canvas>
    </Modal>
  );
}
