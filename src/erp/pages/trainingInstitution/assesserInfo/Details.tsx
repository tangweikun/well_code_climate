import React from 'react';
import { Modal, Form, Row } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { _get } from 'utils';
import moment from 'moment';
import { ItemCol, Title, PopoverImg } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();

  const { data } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
  });

  const genderHash = useHash('gender_type'); // 性别
  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记

  return (
    <Modal visible width={800} title={'考核员信息详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Title>备案信息</Title>

        <Row>
          <ItemCol span={8} label="统一编码">
            {_get(data, 'examnum', '')}
          </ItemCol>
          <ItemCol span={8} label="备案状态">
            {registeredExamFlagHash[_get(data, 'coaCoachExtinfoEntity.registeredExamflag', 0)]}
          </ItemCol>
          {_get(data, 'coaCoachExtinfoEntity.registeredExamflag', 0) === '3' && (
            <ItemCol span={8} label="原因">
              {_get(data, 'coaCoachExtinfoEntity.messageExam', '')}
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
          <ItemCol span={8} label="驾驶证号">
            {_get(data, 'drilicence', '')}
          </ItemCol>
          <ItemCol span={8} label="初领日期">
            {moment(_get(data, 'fstdrilicdate')).format('YYYY-MM-DD')}
          </ItemCol>
          <ItemCol span={8} label="准驾车型">
            {_get(data, 'dripermitted', '')}
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
            {_get(data, 'teachpermitted', '')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="供职状态">
            {employStatusHash[_get(data, 'employstatusKhy', '00')]}
          </ItemCol>
          <ItemCol span={8} label="入职日期">
            {moment(_get(data, 'hiredate')).format('YYYY-MM-DD')}
          </ItemCol>
          <ItemCol span={8} label="离职日期">
            {_get(data, 'leavedate') ? moment(_get(data, 'leavedate')).format('YYYY-MM-DD') : ''}
          </ItemCol>
        </Row>

        <Row>
          <Title>其他信息</Title>
        </Row>

        <Row>
          <ItemCol span={8} label="考核员签字">
            <PopoverImg
              src={_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl', '')}
              imgStyle={{ width: 60, height: 60 }}
            />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}
