import React from 'react';
import { Modal, Form, Row } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { _get } from 'utils';
import moment from 'moment';
import { ItemCol, Title, PopoverImg } from 'components';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();

  const { data } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
  });

  const trans_car_typeHash = useHash('trans_car_type'); // 车辆类型
  const genderHash = useHash('gender_type'); // 性别
  const coachtypeHash = useHash('coach_type'); // 教练类型
  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const isNotHash = useHash('yes_no_type'); // 带教模拟
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const bind_card_typeHash = useHash('bind_card_type'); // 学员卡状态

  return (
    <Modal visible width={800} title={'教练信息详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Title>备案信息</Title>

        <Row>
          <ItemCol span={8} label="统一编码">
            {_get(data, 'coachnum', '')}
          </ItemCol>
          <ItemCol span={8} label="备案状态">
            {registeredExamFlagHash[_get(data, 'coaCoachExtinfoEntity.registeredFlag', '')]}
          </ItemCol>
          {_get(data, 'coaCoachExtinfoEntity.registeredFlag', 0) === '3' && (
            <ItemCol span={8} label="原因">
              {_get(data, 'coaCoachExtinfoEntity.message', '')}
            </ItemCol>
          )}
        </Row>

        <Title>基本信息</Title>

        <Row>
          <ItemCol span={8} label="姓名">
            {_get(data, 'coachname', '')}
          </ItemCol>
          <ItemCol span={8} label="性别">
            {genderHash[_get(data, 'sex', 0)]}
          </ItemCol>
          <ItemCol span={8} label="身份证号">
            {_get(data, 'idcard', '')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="联系电话">
            {_get(data, 'mobile', '')}
          </ItemCol>
          <ItemCol span={8} label="地址">
            {_get(data, 'address', '')}
          </ItemCol>
          <ItemCol span={8} label="照片">
            <PopoverImg src={_get(data, 'coaCoachExtinfoEntity.headImgUrl', '')} imgStyle={{ width: 60, height: 60 }} />
          </ItemCol>
        </Row>

        <Row>
          <Title>其他信息</Title>
        </Row>

        <Row>
          <ItemCol span={8} label="驾驶证号">
            {_get(data, 'drilicence', '')}
          </ItemCol>
          <ItemCol span={8} label="初领日期">
            {moment(_get(data, 'fstdrilicdate')).format('YYYY-MM-DD')}
          </ItemCol>
          <ItemCol span={8} label="准驾车型">
            {trans_car_typeHash[_get(data, 'dripermitted', '')]}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="职业资格证">
            {_get(data, 'occupationno', '')}
          </ItemCol>
          <ItemCol span={8} label="职业资格等级">
            {_get(data, 'occupationlevel', '')}
          </ItemCol>
          <ItemCol span={8} label="准教车型">
            {trans_car_typeHash[_get(data, 'teachpermitted', '')]}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="供职状态">
            {employStatusHash[_get(data, 'employstatus', '00')]}
          </ItemCol>
          <ItemCol span={8} label="入职日期">
            {moment(_get(data, 'hiredate')).format('YYYY-MM-DD')}
          </ItemCol>
          <ItemCol span={8} label="离职日期">
            {_get(data, 'leavedate') ? moment(_get(data, 'leavedate')).format('YYYY-MM-DD') : ''}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="教练员类型">
            {coachtypeHash[_get(data, 'coachtype', '')]}
          </ItemCol>
          <ItemCol span={8} label="是否已绑卡">
            {bind_card_typeHash[_get(data, 'cardstu', '')]}
          </ItemCol>
          <ItemCol span={8} label="备注">
            {_get(data, 'memo', '')}
          </ItemCol>
          <ItemCol span={8} label="带教模拟">
            {isNotHash[_get(data, 'issimulate', '')]}
          </ItemCol>
          <ItemCol span={8} label="教练车车牌号">
            {_get(data, 'licnum', '')}
          </ItemCol>

          {_get(data, 'coaCoachExtinfoEntity.idauthclosed', '') === '1' && (
            <ItemCol span={8} label="免签截止日期">
              {_get(data, 'coaCoachExtinfoEntity.idauthcloseddeadline', '')}
            </ItemCol>
          )}
        </Row>
        <Row>
          <ItemCol span={8} label="教练员签字">
            <PopoverImg
              src={_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl', '')}
              imgStyle={{ width: 60, height: 60 }}
            />
          </ItemCol>
          <ItemCol span={8} label="机动车驾驶证">
            <div className="flex">
              <div className="w60 mr20">
                <PopoverImg
                  src={_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl', '')}
                  imgStyle={{ width: 60, height: 60 }}
                />
              </div>
              {_get(data, 'coaCoachExtinfoEntity.driverLicenseImageupFlag') === '1' && (
                <div className="pd40">
                  <CheckCircleOutlined className="green" />
                </div>
              )}
            </div>
          </ItemCol>
          <ItemCol span={8} label="职业资格等级证">
            <div className="flex">
              <div className="w60 mr20">
                <PopoverImg
                  src={_get(data, 'coaCoachExtinfoEntity.careerLicenseImgUrl', '')}
                  imgStyle={{ width: 60, height: 60 }}
                />
              </div>
              {_get(data, 'coaCoachExtinfoEntity.careerLicenseImageupFlag') === '1' && (
                <div className="pd40">
                  <CheckCircleOutlined className="green" />
                </div>
              )}
            </div>
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={16} label="其他资格证" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <div className="flex">
              <div className="mr10">
                {_get(data, 'coaCoachExtinfoEntity.other_license', []).map((x: any, index: number) => {
                  return (
                    <PopoverImg
                      src={_get(x, 'url', '')}
                      key={_get(x, 'id')}
                      imgStyle={{ width: 60, height: 60, marginRight: 20 }}
                    />
                  );
                })}
              </div>
              {_get(data, 'coaCoachExtinfoEntity.otherLicenseImageupFlag') === '1' && (
                <div className="pd40">
                  <CheckCircleOutlined className="green" />
                </div>
              )}
            </div>
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}
