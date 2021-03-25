// 车辆轨迹
import React, { useState } from 'react';
import { Button, DatePicker, Input, List, message, Radio } from 'antd';
import { useFetch } from 'hooks';
import { _getCarList, _getVehicleTrajectory } from './_api';
import { VehicleTrajectoryMap } from 'components';
import moment from 'moment';
import { formatTime } from 'utils';
import { GPS, _get } from 'utils';
import { TimePicker } from 'antd';

const { RangePicker } = TimePicker;
const LIMIT = 10;

function VehicleTrajectory() {
  const [carId, setCarId] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [tracks, setTracks] = useState<any>([]); // 所有轨迹数据（二维）
  const [date, setDate] = useState(moment());
  const [startTime, setStartTime] = useState(moment('00:00:00', 'HH:mm:ss').format('HH:mm:ss'));
  const [endTime, setEndTime] = useState(moment('23:59:59', 'HH:mm:ss').format('HH:mm:ss'));
  const [pageSize, setPageSize] = useState(LIMIT);

  const { isLoading: initLoading, data: list } = useFetch({
    request: _getCarList,
    query: { licnum: carNumber, page: 1, limit: pageSize },
    depends: [carNumber, pageSize],
  });

  const total = _get(list, 'total', 0);

  const onLoadMore = function () {
    if (pageSize < total) {
      setPageSize(pageSize + LIMIT);
    }
  };
  const loadMore = !initLoading && pageSize < total && (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      <Button onClick={onLoadMore}>加载更多</Button>
    </div>
  );
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, marginRight: 15, paddingRight: 5 }}>
          <div style={{ marginBottom: 5 }}>车牌号码:</div>
          <Input
            style={{ width: '100%' }}
            onChange={(e) => {
              setCarNumber(e.target.value);
            }}
          />
          <List
            bordered
            split={false}
            style={{ marginTop: 10, height: 700, overflow: 'auto' }}
            className="demo-loadmore-list"
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={_get(list, 'rows', [])}
            renderItem={(item: any) => (
              <List.Item>
                <Radio
                  checked={carId === item.carid}
                  onChange={(e: any) => {
                    setCarId(e.target.value);
                    setTracks([]);
                  }}
                  value={item.carid}
                  key={item.carid}
                >
                  {item.licnum}
                </Radio>
              </List.Item>
            )}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div>
            <DatePicker
              placeholder={'日期'}
              onChange={(dates: any) => {
                if (dates) {
                  setDate(dates.format('YYYY-MM-DD'));
                }
              }}
              defaultValue={moment()}
              style={{ margin: '0 20px 20px 0' }}
              allowClear={false}
            />
            <RangePicker
              format={'HH:mm'}
              allowClear={false}
              defaultValue={[moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]}
              onChange={(dates: any) => {
                if (dates) {
                  setStartTime(dates[0].format('HH:mm'));
                  setEndTime(dates[1].format('HH:mm'));
                }
              }}
            />
            <Button
              type="primary"
              style={{ marginLeft: 20 }}
              onClick={async () => {
                if (!carId) {
                  return message.error('请选择车牌号');
                }

                if (!startTime || !endTime) {
                  return message.error('请选择时间');
                }
                const query: any = {
                  carid: carId,
                  signstarttime: formatTime(date, 'DATE') + ' ' + startTime + ':00',
                  signendtime: formatTime(date, 'DATE') + ' ' + endTime + ':59',
                };
                const res = await _getVehicleTrajectory(query);
                const trackInitData = _get(res, 'data', []);

                if (_get(trackInitData, 'length') === 0) {
                  setTracks([]);
                  return message.error('找不到该车轨迹');
                }
                const tracks: any = trackInitData.map((y: any) => {
                  // 将GPS位置转换成BD位置
                  // WGS-84 to GCJ-02
                  const WCJ = GPS.gcj_encrypt(Number(y.lat), Number(y.lon));
                  const { lat: gcjLat, lon: gcjLon } = WCJ;

                  // GCJ-02 to BD-09
                  const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
                  return { lng: WGS.lon, lat: WGS.lat };
                });
                setTracks([tracks]);
              }}
            >
              查询
            </Button>
          </div>
          <div style={{ width: '100%', height: 720 }}>
            <VehicleTrajectoryMap paths={tracks} zoom={16} center={_get(tracks, '0.0')} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleTrajectory;
