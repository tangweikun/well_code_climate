import React, { useState } from 'react';
import { _get } from 'utils';
import { Modal } from 'antd';
import { Map, APILoader, MapTypeControl } from '@uiw/react-baidu-map';

interface ILocation {
  onOk(): void;
  onCancel(): void;
  setLatitude(latitude: string): void;
  setLongitude(longitude: string): void;
  longitude?: string;
  latitude?: string;
}

export default function Location(props: ILocation) {
  const { onOk, onCancel, setLatitude, setLongitude, longitude, latitude } = props;
  const [point, setPoint] = useState('');

  function _handleOk() {
    setLongitude(_get(point, 'lng', longitude).toFixed(6));
    setLatitude(_get(point, 'lat', latitude).toFixed(6));
    onOk();
  }

  // 地图初始中心点位置
  const initPoint: object =
    longitude && latitude ? { center: { lng: longitude, lat: latitude } } : { autoLocalCity: true };

  return (
    <Modal visible zIndex={1001} maskClosable={false} onCancel={onCancel} onOk={_handleOk}>
      <div style={{ width: '100%', height: '400px' }}>
        <APILoader akay="wG3sK5k2jppwgfzZZKgfNhbf">
          <Map
            onClick={(e: any) => setPoint(_get(e, 'point'))}
            {...initPoint}
            ref={(props) => {
              if (props && props.map) {
                // 启用滚轮放大缩小，默认禁用
                props.map.enableScrollWheelZoom();
              }
            }}
          >
            <MapTypeControl mapTypes={[BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP]} />
          </Map>
        </APILoader>
      </div>
    </Modal>
  );
}
