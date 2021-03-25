import React, { useState } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, message } from 'antd';
import { useFetch, useOptions, useVisible, useRequest } from 'hooks';
import { _getDetails, _addTeachingArea, _updateTeachingArea } from './_api';
import { Loading, Title, VehicleTrajectoryMap } from 'components';
import { RULES } from 'constants/rules';
import DrawModal from './DrawModal';
import { GPS, _get } from 'utils';
import MapInput from './MapInput';

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk } = props;
  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [drawPaths, setDrawPaths] = useState([]);
  const [center, setCenter] = useState(null);
  const [address, setAddress] = useState('');

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
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
      setCenter(_get(drawPaths, '0'));
      setAddress(_get(data, 'address'));
    },
  });

  const teachTypeOptions = useOptions('teach_type'); // 教学区域类型
  const businessScopeOptions = useOptions('business_scope'); // 经营车型

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateTeachingArea : _addTeachingArea, {
    onSuccess: onOk,
  });

  return (
    <>
      <Modal
        visible
        confirmLoading={confirmLoading}
        width={800}
        bodyStyle={{ maxHeight: 800 }}
        title={title}
        maskClosable={false}
        onCancel={onCancel}
        onOk={() => {
          form.validateFields().then(async (values) => {
            if (drawPaths.length === 0) {
              message.error('电子围栏不能为空');
              return;
            }

            if (drawPaths.length > 30) {
              message.error('电子围栏坐标点超过30');
              return;
            }

            if (!RULES.TEACH_AREA_ADDRESS.pattern.test(address.trim())) {
              message.error(RULES.TEACH_AREA_ADDRESS.message);
              return;
            }

            const query = {
              name: _get(values, 'name'),
              curvehnum: _get(values, 'curvehnum'),
              area: _get(values, 'area'),
              type: _get(values, 'type'),
              vehicletype: _get(values, 'vehicletype').join(),
              totalvehnum: _get(values, 'totalvehnum'),
              address,
              polygon_gpstype_wgs84: drawPaths
                .map((x: any) => {
                  // BD-09 to GCJ-02
                  const GCJ = GPS.bd_decrypt(x.lat, x.lng);
                  const { lat: gcjLat, lon: gcjLon } = GCJ;

                  // GCJ-02 to WGS-84
                  const WGS = GPS.gcj_decrypt(gcjLat, gcjLon);
                  const { lat, lon: lng } = WGS;
                  return `${Number(lng).toFixed(6)},${Number(lat).toFixed(6)}`;
                })
                .join(';'),
              polygon_maptype_bd09: drawPaths
                .map((x: any) => `${Number(x.lng).toFixed(6)},${Number(x.lat).toFixed(6)}`)
                .join(';'),
            };
            run(isEdit ? { ...query, rid: currentId } : query);
          });
        }}
      >
        {isLoading && <Loading />}

        {!isLoading && (
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              name: _get(data, 'name'),
              curvehnum: _get(data, 'curvehnum'),
              area: _get(data, 'area'),
              type: _get(data, 'type'),
              vehicletype: _get(data, 'vehicletype') ? _get(data, 'vehicletype', '').split(',') : [],
              totalvehnum: _get(data, 'totalvehnum'),
              address: _get(data, 'address'),
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <Col span={12}>
                <Form.Item
                  label="区域名称"
                  name="name"
                  rules={[{ whitespace: true, required: true }, RULES.TEACH_AREA_NAME]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="已投放车辆数"
                  name="curvehnum"
                  rules={[
                    {
                      validator: RULES.TEACH_AREA_CAR_NUM,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="面积"
                  name="area"
                  rules={[
                    { whitespace: true, required: true },
                    {
                      validator: RULES.TEACH_AREA_AREA,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="类型" name="type" rules={[{ required: true }]}>
                  <Select options={teachTypeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="培训车型" name="vehicletype" rules={[{ required: true }]}>
                  <Select
                    options={businessScopeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    mode="multiple"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="可容纳车辆数"
                  name="totalvehnum"
                  rules={[
                    {
                      validator: RULES.TEACH_AREA_CAR_NUM,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item required labelCol={{ span: 3 }} label="地址">
                  <MapInput callback={setCenter} value={address} setValue={setAddress} />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ height: 300 }}>
              <Col span={3} style={{ textAlign: 'right' }}>
                电子围栏
              </Col>
              <Col span={16}>
                <VehicleTrajectoryMap paths={[drawPaths]} center={center} key={Math.random()} />
              </Col>
              <Col span={4}>
                <Button style={{ marginLeft: 20 }} onClick={_switchVisible}>
                  编辑
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {visible && (
        <DrawModal drawPaths={drawPaths} setDrawPaths={setDrawPaths} center={center} onCancel={_switchVisible} />
      )}
    </>
  );
}
