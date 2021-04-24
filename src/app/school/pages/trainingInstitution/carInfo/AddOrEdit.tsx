import React, { useState } from 'react';
import { pick, isEqual, isEmpty } from 'lodash';
import { Modal, Form, Input, Select, DatePicker, Row, message } from 'antd';
import { _addCar, _editCar, _getCarInfo } from './_api';
import { useFetch, useOptions, useRequest } from 'hooks';
import moment from 'moment';
import { ItemCol, UploadPro, Loading, MultipleUpload } from 'components';
import { RULES } from 'constants/rules';
import { _get } from 'utils';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function AddOrEdit(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title } = props;
  const [form] = Form.useForm();
  // 车辆照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');

  // 道路运输证
  const [roadImageUrl, setRoadImageUrl] = useState();
  const [RoadImgId, setRoadImgId] = useState('');

  // 其他资格证
  const [fileList, setFileList] = useState([]);
  const [uploadKey, setUploadKey] = useState('0');

  const { data, isLoading } = useFetch({
    query: {
      id: _get(currentRecord, 'carid'),
    },
    requiredFields: ['id'],
    request: _getCarInfo,
    callback: (data: any) => {
      setImageUrl(_get(data, 'car_img_url'));
      setRoadImageUrl(_get(data, 'road_license_img_url'));
      const other_license = _get(data, 'other_license', []).map((x: any) => {
        return {
          x: '',
          url: x.url,
        };
      });
      setFileList(other_license);
      setUploadKey('1');
    },
  });

  const carType = useOptions('business_scope');
  const platecolorOption = useOptions('platecolor_type');

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editCar : _addCar, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      width={900}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (!imageUrl) {
            message.error('请上传图片');
            return;
          }

          const basicQuery = {
            perdritype: _get(values, 'perdritype'),
            licnum: _get(values, 'licnum'),
            manufacture: _get(values, 'manufacture'),
            model: _get(values, 'model'),
            engnum: _get(values, 'engnum'),
            platecolor: _get(values, 'platecolor'),
            brand: _get(values, 'brand'),
            franum: _get(values, 'franum'),
            buydate: moment(_get(values, 'buydate')).format('YYYY-MM-DD'),
          };

          const basicFields = Object.keys(basicQuery);
          const originData = pick(data, basicFields);
          const isChange = isEqual(basicQuery, originData) && isEmpty(imgId) ? '0' : '1';

          const query = {
            ...basicQuery,
            car_img_url: imageUrl,
            car_img_oss_id: imgId,
            road_license_img_url: roadImageUrl,
            road_license_oss_id: RoadImgId,
            other_license: fileList,
          };

          run(isEdit ? { carid: _get(currentRecord, 'carid'), isChange, ...query } : query);
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
            perdritype: _get(data, 'perdritype'),
            licnum: _get(data, 'licnum'),
            manufacture: _get(data, 'manufacture'),
            model: _get(data, 'model'),
            engnum: _get(data, 'engnum'),
            platecolor: _get(data, 'platecolor'),
            brand: _get(data, 'brand'),
            franum: _get(data, 'franum'),
            buydate: moment(_get(data, 'buydate')),
          }}
        >
          <Row>
            <ItemCol label="培训车型" name="perdritype" rules={[{ required: true }]}>
              <Select options={carType} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="车牌号码" name="licnum" rules={[{ whitespace: true, required: true }, RULES.NUMBER_PLATE]}>
              <Input />
            </ItemCol>
            <ItemCol label="车牌颜色" name="platecolor" rules={[{ required: true }]}>
              <Select options={platecolorOption} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol
              label="生产厂家"
              name="manufacture"
              rules={[{ whitespace: true, required: true }, RULES.MANUFACTURER]}
            >
              <Input />
            </ItemCol>
            <ItemCol label="车辆品牌" name="brand" rules={[{ whitespace: true, required: true }, RULES.VEHICLE_BRAND]}>
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="车辆型号" name="model" rules={[{ whitespace: true }, RULES.VEHICLE_MODEL]}>
              <Input />
            </ItemCol>
            <ItemCol label="车架号" name="franum" rules={[{ whitespace: true }, RULES.FRAME_NUMBER]}>
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="发动机号" name="engnum" rules={[{ whitespace: true }, RULES.ENGIN_NUMBER]}>
              <Input />
            </ItemCol>
            <ItemCol label="购买日期" name="buydate" rules={[{ required: true }]}>
              <DatePicker disabledDate={(current: any) => current.diff(moment(new Date(), 'days')) > 0} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="车辆照片" required>
              <div className="flex">
                <div className="w100 mr20">
                  <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
                </div>
                {_get(data, 'certImageupFlag') === '1' && (
                  <div className="pd80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
            <ItemCol label="道路运输证">
              <div className="flex">
                <div className="w100 mr20">
                  <UploadPro imageUrl={roadImageUrl} setImageUrl={setRoadImageUrl} setImgId={setRoadImgId} />
                </div>
                {_get(data, 'roadLicenseImageupFlag') === '1' && (
                  <div className="pd80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="其他资格证">
              <div className="flex">
                <div className="mr20">
                  <MultipleUpload limit={2} fileList={fileList} setFileList={setFileList} key={uploadKey} />
                </div>
                {_get(data, 'otherLicenseImageupFlag') === '1' && (
                  <div className="pd80">
                    <CheckCircleOutlined className="green" />
                  </div>
                )}
              </div>
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
