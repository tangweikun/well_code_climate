import React, { useState } from 'react';
import { Button, Modal, Radio, Row, Input, Form } from 'antd';
import { ItemCol, Title, UploadPro } from 'components';
import { useForm } from 'antd/es/form/Form';

interface IProps {
  onCancel: (params: boolean) => void;
}

export default function OpenClassTwoAccountForm(props: IProps) {
  const { onCancel } = props;
  const [imageUrl, setImageUrl] = useState('');
  const [head_img_oss_id, setImgId] = useState('');
  const [form] = Form.useForm();
  return (
    <Modal
      visible
      title={'银行开户申请'}
      onCancel={() => onCancel(false)}
      footer={
        <>
          <Button key="back" onClick={() => onCancel(false)}>
            取消
          </Button>
          <Button key="submit" loading={false} type="primary" onClick={() => console.log('1')}>
            确定
          </Button>
        </>
      }
      width={600}
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Title>企业信息</Title>
        <Row>
          <ItemCol span={24} label="企业名称" name="merNamec" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="社会信用代码（注册号）" name="merBLNo" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="注册资本" name="registeredCapital" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="所属地区" name="locationAdd" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="营业执照" name="frontLicenseSide" rules={[{ required: true }]}>
            <UploadPro disabled={false} imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="营业期限截止日" name="merBLNoEndDate" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="法定代表人姓名" name="merChargePerson" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="法定代表人身份证" name="frontAccountSide" rules={[{ required: true }]}>
            <UploadPro
              uploadTitle="证件正面"
              disabled={false}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              setImgId={setImgId}
            />
            <UploadPro
              uploadTitle="证件反面"
              disabled={false}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              setImgId={setImgId}
            />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="法定代表人证照到期日" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Title>银行账户</Title>
        <Row>
          <ItemCol span={24} label="账户类型" name="companyName">
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="开户银行" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="账户名称" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="银行账号" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="开户证明" name="companyName" rules={[{ required: true }]}>
            <UploadPro disabled={false} imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="账户预留手机号" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="手机验证码" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Title>经办人</Title>
        <Row>
          <ItemCol span={24} label="姓名" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="手机号" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={24} label="电子邮箱" name="companyName" rules={[{ required: true }]}>
            <Input />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}
