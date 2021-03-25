import React from 'react';
import { Form, Row, Col } from 'antd';
import { _get } from 'utils';
import moment from 'moment';
import { useFetch, useHash } from 'hooks';
import { _getCarInfo } from '../_api';
import { Loading, Title, PopoverImg } from 'components';

export default function Info(props: any) {
  const [form] = Form.useForm();
  const { data, isLoading } = useFetch({
    query: {
      id: props.carid,
    },
    request: _getCarInfo,
  });

  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案
  const platecolorHash = useHash('platecolor_type'); // 车辆颜色
  const carStatus = useHash('car_status_type'); // 车辆状态
  const transCarTypeHash = useHash('trans_car_type'); // 培训车型

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Title>监管信息</Title>

        <Row>
          <Col span={12}>
            <Form.Item label="统一编码">{_get(data, 'carnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="备案状态">{registeredExamFlagHash[_get(data, 'registered_flag', 0)]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="设备编码">{_get(data, 'poscode')}</Form.Item>
          </Col>

          {_get(data, 'registered_flag', 0) === '3' && (
            <Col span={12}>
              <Form.Item label="原因">{_get(data, 'message', '')}</Form.Item>
            </Col>
          )}
        </Row>

        <Row>
          <Title>基本信息</Title>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="培训车型"> {transCarTypeHash[_get(data, 'perdritype', '')]}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车辆状态">{carStatus[_get(data, 'status', '')]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="车牌号码">{_get(data, 'licnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车牌颜色">{platecolorHash[_get(data, 'platecolor', 1)]}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="生产厂家">{_get(data, 'manufacture')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车辆品牌">{_get(data, 'brand')}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="车辆型号">{_get(data, 'model')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="车架号">{_get(data, 'franum')}</Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="发动机号">{_get(data, 'engnum')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="购买日期">{moment(_get(data, 'buydate')).format('YYYY-MM-DD')}</Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="车辆照片">
              <PopoverImg src={_get(data, 'car_img_url', '')} imgStyle={{ width: 60, height: 60 }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="道路运输证">
              <PopoverImg src={_get(data, 'road_license_img_url', '')} imgStyle={{ width: 60, height: 60 }} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="其他资格证">
              {_get(data, 'other_license', []).map((x: any) => {
                return <PopoverImg src={_get(x, 'url', '')} imgStyle={{ width: 60, height: 60, marginRight: 10 }} />;
              })}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item label="新增时间">{_get(data, 'create_date')}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="更新时间">{_get(data, 'update_date')}</Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="操作人">{_get(data, 'operator')}</Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
