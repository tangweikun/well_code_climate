import React, { useState } from 'react';
import { Modal, Form, Row, Col } from 'antd';
import { GPS, _get } from 'utils';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { Loading, Title, VehicleTrajectoryMap } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();
  const [drawPaths, setDrawPaths] = useState([]);

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
    callback: (data: any) => {
      // 将GPS位置转换成BD位置
      const drawPaths = _get(data, 'polygon_gpstype_wgs84')
        .split(';')
        .map((x: any) => {
          // WGS-84 to GCJ-02
          const WCJ = GPS.gcj_encrypt(Number(x.split(',')[1]), Number(x.split(',')[0]));
          const { lat: gcjLat, lon: gcjLon } = WCJ;

          // GCJ-02 to BD-09
          const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
          return { lng: WGS.lon, lat: WGS.lat };
        });

      setDrawPaths(drawPaths);
    },
  });

  const registeredExamFlagHash = useHash('registered_flag_type');
  const teachTypeHash = useHash('teach_type');

  // 使用状态(1-使用 0-禁用)
  const STATE: any = {
    1: '启用',
    0: '停用',
  };

  return (
    <Modal
      bodyStyle={{ maxHeight: 800 }}
      visible
      width={800}
      title={'教学区域详情'}
      maskClosable={false}
      onCancel={onCancel}
      footer={null}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Title>监管信息</Title>

          <Row>
            <Col span={12}>
              <Form.Item label="审批状态">{registeredExamFlagHash[_get(data, 'registered_flag', '')]}</Form.Item>
            </Col>
            {_get(data, 'registered_flag', '') === '3' && (
              <Col span={12}>
                <Form.Item label="原因">{_get(data, 'reason')}</Form.Item>
              </Col>
            )}
          </Row>

          <Title>基本信息</Title>

          <Row>
            <Col span={12}>
              <Form.Item label="区域名称">{_get(data, 'name')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="教学区域状态">{STATE[_get(data, 'state', '')]}</Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="面积">{_get(data, 'area')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="类型">{teachTypeHash[_get(data, 'type', '')]}</Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="培训车型">{_get(data, 'vehicletype')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="可容纳车辆数">{_get(data, 'totalvehnum')}</Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="已投放车辆数">{_get(data, 'curvehnum')}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="地址：">{_get(data, 'address')}</Form.Item>
            </Col>
          </Row>
          <Row style={{ height: 300 }}>
            <Col span={4}>电子围栏:</Col>
            <Col span={16}>
              <VehicleTrajectoryMap paths={[drawPaths]} center={drawPaths[0]} key={Math.random()} />
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
