// 车辆轨迹
import React, { useRef, useState } from 'react';
import { Button, List, Row, Popconfirm } from 'antd';
import { useFetch, useVisible, useInterval, useHash } from 'hooks';
import { _getNvrSetupList } from '../nvrSet/_api';
import { _getRobotCoachModelList, _getRobotCoachPlaceList, _getRobotCoachPlace } from './_api';
import { trim } from 'lodash';
import Monitor from './Monitor';
import { _get } from 'utils';
import CarMap from '../../trainingInstitution/carMonitor/CarMap';
import CarVideo from './CarVideo';
import {
  GPS,
  _getServerInfo,
  _getTalkbackRequest,
  _getCarsPosition,
  _getCarStatus,
  _cancelTalkbackRequest,
} from 'utils';

const LIMIT = 2;

function MonitorManage() {
  const [pageSize, setPageSize] = useState(LIMIT);
  const [currentRecord, setCurrentRecord] = useState();
  const [mapData, setMapData] = useState([]) as any;
  const [address, setAddress] = useState({}) as any;
  const [mapKey, setMapKey] = useState('empty') as any;
  const [videoVisible, setVideoVisible] = useVisible();
  const [popVisible, setPopVisible] = useState(true);
  const [talkRequestCars, setTalkRequestCars] = useState<any>([]);
  const [currentData, setCurrentData] = useState<any>([]);
  const [listData, setListData] = useState<any>([]);
  const [talkRequestDelay, setTalkRequestDelay] = useState(2000);
  const [carList, setCarList] = useState([]);
  const [initLoading, setInitLoading] = useState(true);

  const mapRef = useRef(null);
  // 左侧列表
  const { data: list = [] } = useFetch({
    query: { page: 1, limit: pageSize },
    request: _getNvrSetupList,
    callback: async (data) => {
      await _getServerInfo();
      const carData = _get(data, 'rows', []);
      if (_get(carData, 'length', 0) === 0) {
        return;
      }
      const carList = _get(data, 'rows', []).map((item: any) => item.licnum);
      setCarList(carList);
      refreshListData(carData);
    },
  });

  // 获取车辆信息列表
  const { data: carData = [], isLoading: carDataLoading } = useFetch({
    request: _getRobotCoachModelList,
    query: { carType: 'C1' },
    requiredFields: ['carType'],
  });

  // 获取场地信息列表
  const { data: placeData = [], isLoading: placeDataLoading } = useFetch({
    request: _getRobotCoachPlaceList,
  });

  // 获取场地信息
  const { data: placeInfoData = [], isLoading: placeInfoDataLoading } = useFetch({
    request: _getRobotCoachPlace,
    query: { placeId: _get(placeData[0], 'id') },
    forceCancel: !_get(placeData[0], 'id'),
    depends: [placeData],
  });

  useInterval(() => {
    refreshListData();
  }, 2000);

  function refreshListData(data?: []) {
    const carData = data ? data : _get(list, 'rows', []);
    setInitLoading(true);
    Promise.all([
      _getCarStatus({ CarLicence: carList.join(',') }),
      _getCarsPosition({ CarLicence: carList.join(','), Forceget: '1' }),
    ]).then((result) => {
      const statusRes = _get(result, '0.Info', []).map((item: any) => {
        return { ...item, licnum: item.CarLicence };
      });
      const positionRes = _get(result, '1.Position', []).map((item: any) => {
        return { ...item, licnum: item.CarLicence };
      });
      let dataList = carData;
      if (_get(statusRes, 'length', 0) > 0) {
        dataList = dataList.map((item: any, i: any) => {
          return { ...item, ...statusRes[i] };
        });
      }

      for (let i = 0; i < dataList.length; i++) {
        for (let j = 0; j < _get(positionRes, 'length', 0); j++) {
          if (positionRes[j]['CarLicence'] === _get(dataList[i], 'licnum', '')) {
            dataList[i] = { ...dataList[i], ...positionRes[j] };
          }
        }
      }

      setListData(dataList);
      setInitLoading(false);
      if (carList.length > 0) {
        const transData = _get(result, '1.Position', []).map((item: any) => {
          const gpsData = _get(item, 'GPS', {});
          // 将GPS位置转换成BD位置
          // WGS-84 to GCJ-02
          const WCJ = GPS.gcj_encrypt(Number(gpsData.Latitude), Number(gpsData.Longitude));
          const { lat: gcjLat, lon: gcjLon } = WCJ;

          // GCJ-02 to BD-09
          const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
          return { ...item, lon: WGS.lon, lat: WGS.lat };
        });

        transData.forEach((x: any) => {
          transAddress(_get(x, 'lon'), _get(x, 'lat'), _get(x, 'id'));
        });
        setMapData(transData);

        setMapKey(carList.toString());
      } else {
        setMapKey('empty');
      }
    });
  }

  function transAddress(lat: number, lng: number, carId: string) {
    let myGeo = new BMap.Geocoder();
    // 根据坐标得到地址描述
    myGeo.getLocation(new BMap.Point(lat, lng), function (result) {
      if (result) {
        address[carId] = result.address;
        setAddress({ ...address });
      }
    });
  }

  useInterval(async () => {
    const res = await _getTalkbackRequest(); //轮询车辆是否有电话请求
    setTalkRequestCars(_get(res, 'Request', []).map((item: any) => item.CarLicence));
    setPopVisible(true);
  }, talkRequestDelay);

  const total = _get(list, 'total', 0);

  // 加载更多
  const onLoadMore = function () {
    if (pageSize < total) {
      setPageSize(pageSize + LIMIT);
    }
  };

  const loadMore = !initLoading && pageSize < total && (
    <div className="text-center mt10 mb10">
      <Button onClick={onLoadMore}>加载更多</Button>
    </div>
  );

  const carHash = listData.reduce((acc: any, x: any) => ({ ...acc, [x.id]: x.licnum }), {});

  const getColorText = (status: string) => {
    if (!status) return;
    // NVR状态 1：正在运行 2：离线 3：设备故障
    if (trim(status) === '在线') {
      return '#00ff00';
    }
    if (trim(status) === '离线') {
      return '#999';
    }
    if (trim(status) === '设备故障') {
      return '#f00';
    }
  };

  return (
    <>
      {videoVisible && (
        <CarVideo
          onCancel={() => {
            setVideoVisible();
            setTalkRequestDelay(2000);
          }}
          currentData={currentData}
        />
      )}
      <div style={{ display: 'flex' }}>
        <div style={{ width: 'calc(100% - 260px)' }}>
          <Monitor />
          {/* <div ref={mapRef}>
            <CarMap
              mapData={mapData}
              carHash={carHash}
              mapKey={mapKey}
              currentRecord={currentRecord}
              isMonitor={true}
            />
          </div> */}
        </div>
        <div className="mr20" style={{ width: 240 }}>
          <List
            bordered
            style={{ height: 700, overflow: 'auto' }}
            className="demo-loadmore-list"
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={listData}
            renderItem={(item: any) => (
              <List.Item>
                <div style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
                  <Popconfirm
                    placement="left"
                    visible={popVisible && talkRequestCars.includes(_get(item, 'licnum', ''))}
                    title={`${_get(item, 'licnum', '')} 请求对话...`}
                    okText="接听"
                    cancelText="挂断"
                    onConfirm={() => {
                      setPopVisible(false);
                      setTalkRequestDelay(0);
                      setCurrentData(item);
                      setVideoVisible();
                    }}
                    onCancel={async () => {
                      setPopVisible(false);
                      await _cancelTalkbackRequest({ CarLicence: _get(item, 'licnum', '') });
                    }}
                  ></Popconfirm>
                  <div>
                    <Row>车牌号：{_get(item, 'licnum', '')}</Row>
                    <Row>训练时长：{_get(item, 'trainTime', '0')}分钟</Row>
                    <Row>车辆速度：{_get(item, 'GPS.Speed', '0')}km/h</Row>
                    <div
                      style={{
                        background: getColorText(_get(item, 'Status', '')),
                        textAlign: 'center',
                      }}
                    >
                      {_get(item, 'Status', '')}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </>
  );
}

export default MonitorManage;
