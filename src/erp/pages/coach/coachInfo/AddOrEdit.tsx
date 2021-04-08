import React, { useState } from 'react';
import { Modal, Form, Row, Input, Select, message, DatePicker, Button } from 'antd';
import { useFetch, useOptions, useRequest, useVisible } from 'hooks';
import { _getDetails, _addInfo, _updateInfo, _getCarList } from './_api';
import { pick, isEqual, isEmpty } from 'lodash';
import moment from 'moment';
import { Loading, ItemCol, UploadPro, Title, MultipleUpload, Signature } from 'components';
import { RULES } from 'constants/rules';
import { readIdCardData, _get } from 'utils';
import { isForceUpdatePlugin } from 'utils';
import { UpdatePlugin } from 'components';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk } = props;
  const [form] = Form.useForm();
  const [carOptionData, setCarOptionData] = useState<any>([]);
  const [carid, setCarid] = useState('');

  // 教练照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');

  // 教练签字
  const [signImgUrl, setSignImgUrl] = useState('');
  const [signImgId, setSignImgId] = useState('');
  const [signVisible, setSignVisible] = useVisible();

  // 机动车驾驶证
  const [driverLicenseImgUrl, setDriverLicenseImgUrl] = useState();
  const [driverLicenseOssId, setDriverLicenseOssId] = useState('');

  // 职业资格等级证
  const [careerLicenseImgUrl, setCareerLicenseImgUrl] = useState();
  const [careerLicenseOssId, setCareerLicenseOssId] = useState('');

  // 其他资格证
  const [fileList, setFileList] = useState([]);
  const [readCardLoading, setReadCardLoading] = useState(false);

  const [uploadKey, setUploadKey] = useState('0');

  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateInfo : _addInfo, {
    onSuccess: onOk,
  });

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getDetails,
    callback: (data) => {
      setImageUrl(_get(data, 'coaCoachExtinfoEntity.headImgUrl'));
      setSignImgUrl(_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl'));
      setDriverLicenseImgUrl(_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl'));
      setCareerLicenseImgUrl(_get(data, 'coaCoachExtinfoEntity.careerLicenseImgUrl'));
      const other_license = _get(data, 'coaCoachExtinfoEntity.other_license', []).map((x: any) => {
        return {
          x: '',
          url: x.url,
        };
      });
      setFileList(other_license);
      setCarid(_get(data, 'carid'));
      setCarOptionData([{ label: _get(data, 'licnum'), value: _get(data, 'carid') }]);
      setUploadKey('1');
    },
  });

  const genderOptions = useOptions('gender_type'); // 性别
  const businessScopeOptions = useOptions('trans_car_type'); //经营车型
  const coachTypeOptions = useOptions('coach_type'); // 教练员类型
  const isNotOptions = useOptions('yes_no_type'); // 带教模拟

  const occupationLevelTypeOptions = useOptions('occupation_level_type'); // 职业资格等级
  const loading = isLoading || readCardLoading;

  return (
    <>
      {signVisible && (
        <Signature
          onCancel={setSignVisible}
          onOk={(imgRes) => {
            setSignImgId(_get(imgRes, 'data.id', ''));
            setSignImgUrl(_get(imgRes, 'data.url', ''));
            setSignVisible();
          }}
        />
      )}
      <Modal
        visible
        width={900}
        title={title}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        onOk={() => {
          form.validateFields().then(async (values) => {
            if (_get(values, 'idcard') !== _get(values, 'idcardVerify')) {
              message.error('身份证号和号码证号必须相同');
              return false;
            }

            let sex = _get(values, 'idcard')[16] % 2 === 0 ? '2' : '1';
            if (sex !== String(_get(values, 'sex'))) {
              message.error('性别与身份证号不符');
              return false;
            }
            if (!isEdit && !imgId) {
              message.error('请上传照片');
              return false;
            }

            const dateCompare = moment(_get(values, 'leavedate')).isBefore(_get(values, 'hiredate'));

            if (_get(values, 'leavedate') && dateCompare) {
              message.error('离职日期大于入职日期');
              return false;
            }

            const basicQuery = {
              coachname: _get(values, 'coachname'),
              sex: _get(values, 'sex'),
              idcard: _get(values, 'idcard'),
              mobile: _get(values, 'mobile'),
              address: _get(values, 'address'),
              drilicence: _get(values, 'drilicence'),
              fstdrilicdate: moment(_get(values, 'fstdrilicdate')).format('YYYY-MM-DD'),
              dripermitted: _get(values, 'dripermitted'),
              occupationno: _get(values, 'occupationno'),
              occupationlevel: _get(values, 'occupationlevel'),
              teachpermitted: _get(values, 'teachpermitted'),
              hiredate: moment(_get(values, 'hiredate')).format('YYYY-MM-DD'),
              leavedate: _get(values, 'leavedate') ? moment(_get(values, 'leavedate')).format('YYYY-MM-DD') : '',
              coachtype: _get(values, 'coachtype'),
              issimulate: _get(values, 'issimulate'),
              carid,
            };

            const basicFields = Object.keys(basicQuery);
            const originData = pick(data, basicFields);
            const isChange = isEqual(basicQuery, originData) && isEmpty(imgId) && isEmpty(signImgId) ? '0' : '1';

            const query = {
              ...basicQuery,
              headImgUrl: imageUrl,
              head_img_oss_id: imgId,
              sign_img_oss_id: signImgId,
              driver_license_oss_id: driverLicenseOssId,
              career_license_oss_id: careerLicenseOssId,
              memo: _get(values, 'memo'),
              iscoach: 1,
              other_license: fileList,
            };

            run(isEdit ? { ...query, cid: currentId, isChange } : query);
          });
        }}
      >
        {
          <Button
            style={{ float: 'right' }}
            loading={readCardLoading}
            onClick={async () => {
              setReadCardLoading(true);
              const update: any = await isForceUpdatePlugin();
              if (update) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
              const readCardResult = await readIdCardData(form, 'coachname', (data: any, imgData: any) => {
                _get(imgData, 'url') && setImageUrl(_get(imgData, 'url'));
                _get(imgData, 'id') && setImgId(_get(imgData, 'id'));
                setReadCardLoading(false);
              });
              if (isEmpty(readCardResult)) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
            }}
          >
            读身份证信息
          </Button>
        }
        {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行读取身份证信息" />}
        {loading && <Loading />}

        {!loading && (
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              coachname: _get(data, 'coachname'),
              sex: _get(data, 'sex'),
              idcard: _get(data, 'idcard'),
              idcardVerify: _get(data, 'idcard'),
              mobile: _get(data, 'mobile'),
              address: _get(data, 'address'),
              drilicence: _get(data, 'drilicence'),
              fstdrilicdate: _get(data, 'fstdrilicdate') ? moment(_get(data, 'fstdrilicdate')) : '',
              dripermitted: _get(data, 'dripermitted'),
              occupationno: _get(data, 'occupationno'),
              occupationlevel: _get(data, 'occupationlevel'),
              teachpermitted: _get(data, 'teachpermitted'),
              hiredate: moment(_get(data, 'hiredate')),
              leavedate: _get(data, 'leavedate') ? moment(_get(data, 'leavedate')) : '',
              coachtype: _get(data, 'coachtype'),
              memo: _get(data, 'memo'),
              issimulate: _get(data, 'issimulate'),
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <ItemCol label="姓名" name="coachname" rules={[{ whitespace: true, required: true }, RULES.COACH_NAME]}>
                <Input />
              </ItemCol>
              <ItemCol label="性别" name="sex" rules={[{ required: true, message: '请选择性别' }]}>
                <Select options={genderOptions} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol
                label="身份证号"
                name="idcard"
                rules={[{ whitespace: true, required: true, message: '请输入身份证号' }, RULES.ID_CARD]}
              >
                <Input
                  onChange={(e: any) => {
                    if (e.target.value.length === 18) {
                      let value = e.target.value;
                      let sex = value[16] % 2 === 0 ? '2' : '1';
                      form.setFieldsValue({ sex: sex });
                    }
                  }}
                />
              </ItemCol>
              <ItemCol
                label="号码确认"
                name="idcardVerify"
                rules={[{ whitespace: true, required: true, message: '请输入号码确认' }, RULES.ID_CARD]}
              >
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol
                label="联系电话"
                name="mobile"
                rules={[{ whitespace: true, required: true, message: '请输入联系电话' }, RULES.TEL_11]}
              >
                <Input />
              </ItemCol>
              <ItemCol label="地址" name="address" rules={[RULES.ADDRESS]}>
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol
                label="驾驶证号"
                name="drilicence"
                rules={[{ whitespace: true, required: true }, RULES.DRIVER_LICENSE]}
              >
                <Input />
              </ItemCol>
              <ItemCol label="初领日期" name="fstdrilicdate" rules={[{ required: true, message: '请选择初领日期' }]}>
                <DatePicker
                  disabledDate={(current: any): any => {
                    return current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) > 0;
                  }}
                />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="准驾车型" name="dripermitted" rules={[{ required: true, message: '请选择准驾车型' }]}>
                <Select options={businessScopeOptions} />
              </ItemCol>
              <ItemCol label="职业资格证" name="occupationno" rules={[RULES.PROFESSIONAL_CERTIFICATE]}>
                <Input />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="职业资格等级" name="occupationlevel">
                <Select options={occupationLevelTypeOptions} />
              </ItemCol>
              <ItemCol label="准教车型" name="teachpermitted" rules={[{ required: true, message: '请选择准教车型' }]}>
                <Select options={businessScopeOptions} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="入职日期" name="hiredate" rules={[{ required: true, message: '请选择入职日期' }]}>
                <DatePicker />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="离职日期" name="leavedate">
                <DatePicker />
              </ItemCol>
              <ItemCol label="教练员类型" name="coachtype" rules={[{ required: true }]}>
                <Select options={coachTypeOptions} />
              </ItemCol>
            </Row>

            <Row>
              <ItemCol label="照片" required>
                <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
              </ItemCol>
              <ItemCol label="带教模拟" name="issimulate">
                <Select options={isNotOptions} />
              </ItemCol>
              <ItemCol label="教练车车牌号">
                <Select
                  options={carOptionData}
                  allowClear={true}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  onChange={(value: any) => {
                    setCarid(value);
                  }}
                  showSearch
                  defaultValue={carid}
                  filterOption={false}
                  onClear={() => {
                    const query = { licnum: '' };
                    _getCarList(query).then((res: any) => {
                      setCarOptionData(
                        _get(res, 'data', []).map((item: any) => {
                          return {
                            label: item.text,
                            value: item.value,
                          };
                        }),
                      );
                    });
                  }}
                  onSearch={(value) => {
                    const query = { licnum: value };
                    _getCarList(query).then((res: any) => {
                      setCarOptionData(
                        _get(res, 'data', []).map((item: any) => {
                          return {
                            label: item.text,
                            value: item.value,
                          };
                        }),
                      );
                    });
                  }}
                />
              </ItemCol>
            </Row>

            <Title>其他信息</Title>

            <Row>
              <ItemCol label="备注" name="memo" rules={[RULES.MEMO]}>
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol label="机动车驾驶证">
                <div className="flex">
                  <div className="w100 mr20">
                    <UploadPro
                      imageUrl={driverLicenseImgUrl}
                      setImageUrl={setDriverLicenseImgUrl}
                      setImgId={setDriverLicenseOssId}
                    />
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.driverLicenseImageupFlag') === '1' && (
                    <div className="pd80">
                      <CheckCircleOutlined className="green" />
                    </div>
                  )}
                </div>
              </ItemCol>
              <ItemCol label="职业资格等级证">
                <div className="flex">
                  <div className="w100 mr20">
                    <UploadPro
                      imageUrl={careerLicenseImgUrl}
                      setImageUrl={setCareerLicenseImgUrl}
                      setImgId={setCareerLicenseOssId}
                    />
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.careerLicenseImageupFlag') === '1' && (
                    <div className="pd80">
                      <CheckCircleOutlined className="green" />
                    </div>
                  )}
                </div>
              </ItemCol>
            </Row>
            <Row>
              <ItemCol label="教练签字">
                <UploadPro imageUrl={signImgUrl} setImageUrl={setSignImgUrl} setImgId={setSignImgId} />
                <span style={{ cursor: 'pointer' }} className="primary-color" onClick={setSignVisible}>
                  在线签字
                </span>
              </ItemCol>
              <ItemCol label="其它资格证">
                <div className="flex">
                  <div className="mr20">
                    <MultipleUpload limit={2} fileList={fileList} setFileList={setFileList} key={uploadKey} />
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.otherLicenseImageupFlag') === '1' && (
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
    </>
  );
}
