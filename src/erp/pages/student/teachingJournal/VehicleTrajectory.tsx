import React, { useState } from 'react';
import { Row, Table, Col, Button } from 'antd';
import { _getVehicleTrajectory, _getFinalAssess } from './_api';
import { useFetch, useTablePagination, useForceUpdate } from 'hooks';
import { VehicleTrajectoryMap } from 'components';
import { GPS, _get } from 'utils';
import moment from 'moment';

export default function VehicleTrajectory(props: any) {
  const { currentRecord, isTrainingDetail = false } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({ isSimplePagination: true });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [tracks, setTracks] = useState<any>([]); // 所有轨迹数据（二维）
  const [currentTrack, setCurrentTrack] = useState([]); // 当前车辆轨迹数组（一维）
  const [loading, setLoading] = useState(false);
  const [key, forceUpdate] = useForceUpdate();
  // 教学日志列表
  const { data } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      signstarttime_start: moment().format('YYYY') + '-01-01',
      stuid: _get(currentRecord, 'stuid'),
      traincode: _get(currentRecord, 'traincode'),
    },
    request: _getFinalAssess,
    depends: [pagination.current, pagination.pageSize, currentRecord],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useFetch({
    query: {
      carid: _get(currentRecord, 'carid', ''),
      signstarttime: _get(currentRecord, 'signstarttime', ''),
      signendtime: _get(currentRecord, 'signendtime', ''),
    },
    request: _getVehicleTrajectory,
    callback: (trackInitData: any) => {
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
      setCurrentTrack(tracks);
      forceUpdate();
    },
  });

  const columns = [
    { dataIndex: 'recnum', title: '电子教学日志编号' },
    { dataIndex: 'signstarttime', title: '签到时间' },
    { dataIndex: 'signendtime', title: '签退时间' },
    { dataIndex: 'validtime', title: '训练时长' },
    { dataIndex: 'validmileage', title: '训练里程' },
  ];

  function _trackCompare() {
    setLoading(true);
    Promise.all(
      selectedRowKeys.map(async (key: string) => {
        const record = _get(data, 'rows', []).find((x: any) => key === x.classid);
        return await _getVehicleTrajectory({
          carid: _get(record, 'carid', ''),
          signstarttime: _get(record, 'signstarttime', ''),
          signendtime: _get(record, 'signendtime', ''),
        });
      }),
    )
      .then((res) => {
        const tracks: any = res.map((x: any) =>
          _get(x, 'data', []).map((y: any) => {
            // 将GPS位置转换成BD位置
            // WGS-84 to GCJ-02
            const WCJ = GPS.gcj_encrypt(Number(y.lat), Number(y.lon));
            const { lat: gcjLat, lon: gcjLon } = WCJ;

            // GCJ-02 to BD-09
            const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
            return { lng: WGS.lon, lat: WGS.lat };
          }),
        );
        setTracks([currentTrack, ...tracks]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  return (
    <>
      <Row gutter={20}>
        <Col span={isTrainingDetail ? 24 : 16}>
          <div style={{ width: '100%', height: 400 }}>
            <VehicleTrajectoryMap
              paths={tracks}
              zoom={16}
              center={_get(tracks, '0.0')}
              key={key}
              isTeachingJournal
              mapType="Polyline"
            />
          </div>
        </Col>
        {!isTrainingDetail && (
          <Col span={8}>
            <Button type="primary" loading={loading} onClick={_trackCompare}>
              开始轨迹对比
            </Button>

            <Table
              scroll={{ x: 100 }}
              rowSelection={{
                type: 'checkbox',
                ...rowSelection,
              }}
              style={{ marginTop: 20 }}
              columns={columns}
              dataSource={_get(data, 'rows')}
              rowKey="classid"
              pagination={tablePagination}
            />
          </Col>
        )}
      </Row>
    </>
  );
}
