// 车辆轨迹
import React, { useState } from 'react';
import { Button, Input, List, Table, Checkbox } from 'antd';
import { useFetch, useVisible, useInterval, useHash } from 'hooks';
import { _getCarList, _getCarDetails } from './_api';
import Detail from './Detail';
import CarMap from './CarMap';
import { GPS, _get } from 'utils';

const LIMIT = 10;

function CarMonitor() {
  const [licNumArr, setLicNumArr] = useState([]) as any;
  const [carNumber, setCarNumber] = useState('');
  const [pageSize, setPageSize] = useState(LIMIT);
  const [visible, _switchVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState();
  const [mapData, setMapData] = useState([]) as any;
  const [address, setAddress] = useState({}) as any;
  const [dataSource, setDataSource] = useState([]) as any;
  const [mapKey, setMapKey] = useState('empty') as any;

  const carOnlineStateHash = useHash('car_online_state'); // 在线带教状态

  // 左侧列表
  const { isLoading: initLoading, data: list = [] } = useFetch({
    request: _getCarList,
    query: { licnum: carNumber, page: 1, limit: pageSize },
    depends: [carNumber, pageSize],
  });

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

  // 右侧数据
  useInterval(async () => {
    if (licNumArr.length > 0) {
      const res = await _getCarDetails({ carids: licNumArr.join('|') });

      const transData = _get(res, 'data', []).map((item: any) => {
        // 将GPS位置转换成BD位置
        // WGS-84 to GCJ-02
        const WCJ = GPS.gcj_encrypt(Number(item.lat), Number(item.lon));
        const { lat: gcjLat, lon: gcjLon } = WCJ;

        // GCJ-02 to BD-09
        const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
        return { ...item, lon: WGS.lon, lat: WGS.lat };
      });

      transData.forEach((x: any) => {
        transAddress(_get(x, 'lon'), _get(x, 'lat'), _get(x, 'carid'));
      });
      setMapData(transData);
      const data = transData;
      setDataSource((pre: any) =>
        pre.map((x: any) => {
          const temp = data.find((item: any) => item.carid === x.carid);
          return temp || x;
        }),
      );

      setMapKey(licNumArr.toString());
    } else {
      setMapKey('empty');
    }
  }, 40000);

  const total = _get(list, 'total', 0);

  // 在线车辆总数
  let onlineNum: any = 0;
  _get(list, 'rows', []).forEach((item: any) => {
    if (item.activeState === 1) {
      onlineNum += 1;
    }
  });

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

  const carHash = _get(list, 'rows', []).reduce((acc: any, x: any) => ({ ...acc, [x.assistId]: x.licNum }), {});

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'carid',
      render: (carid: string, record: any) => <div onClick={() => setCurrentRecord(record)}>{carHash[carid]}</div>,
    },
    {
      title: '状态',
      dataIndex: 'activeState',
      render: (activeState: any) => carOnlineStateHash[activeState],
    },
    {
      title: '教练员',
      dataIndex: 'coaname',
    },
    {
      title: '学员',
      dataIndex: 'stuname',
    },
    {
      title: '培训科目',
      dataIndex: 'examname',
    },
    {
      title: '速度',
      dataIndex: 'gps_speed',
    },
    {
      title: '定位时间',
      dataIndex: 'gpstime',
    },
    {
      title: '地址',
      dataIndex: '',
      render: (_: void, record: any) => address[record.carid],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <Button
              className="operation-button"
              onClick={() => {
                _switchVisible();
                setCurrentRecord(record);
              }}
              type="primary"
              ghost
              size="small"
            >
              详情
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Detail onCancel={_switchVisible} currentRecord={currentRecord} visible={visible} carHash={carHash} />

      <div style={{ display: 'flex' }}>
        <div className="mr20" style={{ width: 240 }}>
          <div className="mb4">总车辆总数：{total}</div>
          <div className="mb4">在线车辆总数：{onlineNum}</div>
          <Input
            placeholder="车牌号码"
            className="full-width "
            onChange={(e) => {
              setCarNumber(e.target.value);
            }}
          />
          <Checkbox.Group
            className="full-width "
            onChange={(checkedValue: any) => {
              setLicNumArr(checkedValue);
            }}
          >
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
                  <Checkbox
                    value={item.assistId}
                    key={item.assistId}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      if (checked && !licNumArr.includes(value)) {
                        dataSource.push({ carid: value });
                        setDataSource([...dataSource]);
                      } else {
                        setDataSource(dataSource.filter((x: any) => x.carid !== value));
                      }
                    }}
                  >
                    {item.licNum}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        background: item.activeState === 1 ? '#0f0' : '#aaa',
                        borderRadius: 5,
                        display: 'inline-block',
                        marginLeft: 10,
                      }}
                    />
                  </Checkbox>
                </List.Item>
              )}
            />
          </Checkbox.Group>
        </div>
        <div style={{ width: 'calc(100% - 260px)' }}>
          <div>
            <CarMap mapData={mapData} carHash={carHash} mapKey={mapKey} currentRecord={currentRecord} />
          </div>
          <Table pagination={false} columns={columns} bordered dataSource={dataSource} rowKey="carid" />
        </div>
      </div>
    </>
  );
}

export default CarMonitor;
