import React, { useEffect, useState } from 'react';
import { Modal, Row, Button } from 'antd';
import { _get } from 'utils';
import ReactPlayer from 'react-player';
import { _carControl, _getVideoViewCar } from 'utils';
import { IF, Loading } from 'components';

interface ICarVideo {
  onCancel(): void;
  currentData?: any;
}

export default function CarVideo(props: ICarVideo) {
  const { onCancel, currentData } = props;
  const [videoAddress, setVideoAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // CarLicence = '浙A1234',
  // status = 'enable',
  // mode = 'rtsp',
  // ip = '172.16.8.250',
  // user = 'admin',
  // code = 'Well12345',
  // channel = '101',
  useEffect(() => {
    async function getVideoSrc() {
      const query = {
        CarLicence: _get(currentData, 'licnum', ''),
        status: 'enable',
        mode: 'rtsp',
        ip: _get(currentData, 'ipc_ip', ''),
        user: _get(currentData, 'nvr_account', ''),
        code: _get(currentData, 'nvr_pwd', ''),
        channel: _get(currentData, 'nvr_channel', ''),
      };
      const data = await _getVideoViewCar(query);
      setIsLoading(false);
      setVideoAddress(_get(data, 'VideoAddress', ''));
    }
    getVideoSrc();
  }, [currentData]);

  return (
    <Modal visible width={700} maskClosable={false} onCancel={onCancel} title="车载画面" footer={null}>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <ReactPlayer
              playing
              style={{ background: 'black' }}
              url={videoAddress}
              controls
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
              onError={() => {
                console.log('error');
              }}
            />
            <Row style={{ display: 'flex' }} className="mt20">
              <div style={{ flex: 1 }}>
                <Row>登录账号：{_get(currentData, 'nvr_account', '')}</Row>
                <Row>
                  <span>车牌号：{_get(currentData, 'licnum', '')}</span>
                  <span className="ml20">训练时长：{_get(currentData, 'trainTime', '0')}分钟</span>
                </Row>
                <Row>
                  <span>车辆状态：{_get(currentData, 'Status', '')}</span>
                  <span className="ml20">车辆速度：{_get(currentData, 'GPS.Speed', '0')}km/h</span>
                </Row>
              </div>
              <div style={{ alignSelf: 'center' }}>
                <Button>远程通话</Button>
                <Button
                  className="ml20"
                  onClick={async () => {
                    const res = await _carControl({
                      CarLicence: _get(currentData, 'licnum', ''),
                      FootBrake: 1,
                    });
                    console.log(res);
                  }}
                >
                  远程刹车
                </Button>
              </div>
            </Row>
          </div>
        }
      />
    </Modal>
  );
}
