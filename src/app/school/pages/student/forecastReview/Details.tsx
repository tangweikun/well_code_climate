import React from 'react';
import { Modal, Form, Row } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { _getPreSignUpDetail } from '../studentInfo/_api';
import { _get } from 'utils';
import moment from 'moment';
import { Loading, Title, ItemCol, PopoverImg } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId, isPreSignUpDetails = false } = props;
  const [form] = Form.useForm();

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: isPreSignUpDetails ? _getPreSignUpDetail : _getDetails,
  });

  const nationalityTypeHash = useHash('nationality_type'); // 国籍
  const genderHash = useHash('gender_type'); // 性别
  const cardTypeHash = useHash('card_type'); // 证件类型
  const busitypeHash = useHash('busi_type'); // 业务类型
  const checkstatusSign = useHash('checkstatus_sign'); // 审核状态

  return (
    <Modal
      visible
      width={800}
      title={isPreSignUpDetails ? '预报名审核详情' : '意向学员详情'}
      maskClosable={false}
      onCancel={onCancel}
      footer={null}
    >
      {isLoading && <Loading />}
      {!isLoading && (
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Title>基本信息</Title>

          <Row>
            <ItemCol label="姓名">{_get(data, 'name')}</ItemCol>
            <ItemCol label="性别">{genderHash[_get(data, 'sex', 0)]}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="证件类型">{cardTypeHash[_get(data, 'cardtype', 0)]}</ItemCol>
            <ItemCol label="证件号">{_get(data, 'idcard')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="国籍">{nationalityTypeHash[_get(data, 'nationality', '')]}</ItemCol>
            <ItemCol label="联系电话">{_get(data, 'phone')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="地址">{_get(data, 'address')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="业务类型">{busitypeHash[_get(data, 'busitype', '')]}</ItemCol>
            <ItemCol label="培训车型">{_get(data, 'traintype')}</ItemCol>
          </Row>
          {!isPreSignUpDetails && (
            <Row>
              <ItemCol label="头像照片">
                <PopoverImg src={_get(data, 'head_img_url', '')} imgStyle={{ width: 60, height: 60 }} />
              </ItemCol>
              <ItemCol label="证件照">
                <PopoverImg src={_get(data, 'idcardimg', '')} imgStyle={{ width: 60, height: 60 }} />
              </ItemCol>
            </Row>
          )}
          {isPreSignUpDetails && (
            <Row>
              <ItemCol label="照片">
                <PopoverImg src={_get(data, 'headImgVO.head_img_url_show', '')} imgStyle={{ width: 60, height: 60 }} />
              </ItemCol>
            </Row>
          )}

          <Title>其他信息</Title>

          <Row>
            <ItemCol label="申请日期">{moment(_get(data, 'regtime')).format('YYYY-MM-DD')}</ItemCol>
            <ItemCol label="审核日期">{moment(_get(data, 'checktime')).format('YYYY-MM-DD')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="审核人">{_get(data, 'checkusername')}</ItemCol>
            <ItemCol label="审核状态">{checkstatusSign[_get(data, 'checkstatus', 0)]}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="原因">{isPreSignUpDetails ? _get(data, 'checkmemo') : _get(data, 'memo')}</ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
