import React, { useState } from 'react';
import { Modal, Form, Row, Input, Select, Button, Alert, message } from 'antd';
import { useFetch, useOptions, useVisible } from 'hooks';
import { _getSchContractTemp, _stuSignContract, _previewContract } from './_api';
import { AuthButton, Loading } from 'components';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { PUBLIC_URL } from 'constants/env';
import { useHistory } from 'react-router-dom';
import { ItemCol } from 'components';
import { previewPdf, _get } from 'utils';
import SignContract from './SignContract';

export default function GenerateContract(props: any) {
  const { onCancel, currentRecord, title, onOk } = props;
  const [form] = Form.useForm();
  const history = useHistory();
  const [schContractTempitemList, setSchContractTempitemList] = useState<any>([]);
  const [signContractVisible, setSignContractVisible] = useVisible();

  const { data = {}, isLoading } = useFetch({
    query: {
      sid: _get(currentRecord, 'sid'),
    },
    request: _getSchContractTemp,
    callback: (data) => {
      setSchContractTempitemList(_get(data, 'schContractTempitemList', []));
    },
  });

  // 勾选/不勾选 下拉框
  const checkTypeOptions = useOptions('student_contract_check_type');

  return (
    <>
      {signContractVisible && (
        <SignContract
          onCancel={setSignContractVisible}
          onOk={() => {
            setSignContractVisible();
            onOk();
          }}
          data={data}
          currentRecord={currentRecord}
          schContractTempitemList={schContractTempitemList}
        />
      )}
      <Modal visible title={title} width={1300} maskClosable={false} footer={null} onCancel={onCancel}>
        {isLoading && <Loading />}

        {!isLoading && (
          <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            {Object.keys(data).length === 0 && ( //不存在合同模板时需出现如下提醒
              <Alert
                message={
                  <>
                    当前没有该车型的合同内容项模板，您可以
                    <span
                      style={{ color: PRIMARY_COLOR, cursor: 'pointer' }}
                      onClick={() => {
                        history.push(`${PUBLIC_URL}contractTemplate`);
                      }}
                    >
                      立即前往
                    </span>
                    设置合同模板信息内容
                  </>
                }
                type="warning"
                style={{ marginBottom: 20 }}
              />
            )}

            <Row>
              <ItemCol label="车型">{_get(currentRecord, 'traintype')}</ItemCol>

              {schContractTempitemList.map((x: any, index: any) => {
                // 下拉文本框
                if (x.itemtype === '1') {
                  return (
                    <ItemCol label={x.itemname} key={x.itemcode} required>
                      <Select
                        options={checkTypeOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        value={x.itemvalue}
                        onChange={(value) => {
                          schContractTempitemList[index].itemvalue = value;
                          setSchContractTempitemList([...schContractTempitemList]);
                        }}
                      />
                    </ItemCol>
                  );
                }
                // 输入文本框
                if (x.itemtype === '0') {
                  return (
                    <ItemCol label={x.itemname} key={x.itemcode} required>
                      <Input
                        value={x.itemvalue}
                        onChange={(e) => {
                          if (
                            Number.isNaN(Number(e.target.value)) ||
                            Number(e.target.value) > 100000 ||
                            Number(e.target.value) < 0
                          )
                            return;
                          schContractTempitemList[index].itemvalue = e.target.value;
                          setSchContractTempitemList([...schContractTempitemList]);
                        }}
                      />
                    </ItemCol>
                  );
                }
              })}
            </Row>

            <Row justify={'end'}>
              <Button type="primary" onClick={onCancel}>
                取消
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 20 }}
                onClick={() => {
                  if (Object.keys(data).length === 0) {
                    message.error('当前没有该车型的合同内容项模板');
                    return false;
                  }
                  _previewContract({
                    sid: _get(currentRecord, 'sid'),
                    cartype: _get(currentRecord, 'traintype'),
                    schContractTempitemList,
                    tempid: _get(data, 'tempid'),
                  }).then((res) => {
                    previewPdf([res]);
                  });
                }}
              >
                预览合同
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 20 }}
                onClick={async () => {
                  if (Object.keys(data).length === 0) {
                    message.error('当前没有该车型的合同内容项模板');
                    return false;
                  }
                  const lableArr: any[] = [];
                  schContractTempitemList.forEach((item: any) => {
                    if (!item.itemvalue) {
                      lableArr.push(item.itemname);
                    }
                  });
                  if (lableArr.length > 0) {
                    let str = lableArr.join(',');
                    return message.error(str + '不能为空');
                  }
                  const res = await _stuSignContract({
                    sid: _get(currentRecord, 'sid'),
                    cartype: _get(currentRecord, 'traintype'),
                    schContractTempitemList,
                    tempid: _get(data, 'tempid'),
                  });
                  if (_get(res, 'code') === 200) {
                    message.success('操作成功');
                    onOk();
                  }
                }}
              >
                确认生成合同
              </Button>
              <AuthButton
                authId="student/studentInfo:btn15"
                type="primary"
                style={{ marginLeft: 20 }}
                onClick={async () => {
                  if (Object.keys(data).length === 0) {
                    message.error('当前没有该车型的合同内容项模板');
                    return false;
                  }
                  const lableArr: any[] = [];
                  schContractTempitemList.forEach((item: any) => {
                    if (!item.itemvalue) {
                      lableArr.push(item.itemname);
                    }
                  });
                  if (lableArr.length > 0) {
                    let str = lableArr.join(',');
                    return message.error(str + '不能为空');
                  }
                  const res = await _stuSignContract({
                    sid: _get(currentRecord, 'sid'),
                    cartype: _get(currentRecord, 'traintype'),
                    schContractTempitemList,
                    tempid: _get(data, 'tempid'),
                  });
                  if (_get(res, 'code') === 200) {
                    setSignContractVisible();
                  }
                }}
              >
                确认生成合同并签字
              </AuthButton>
            </Row>
          </Form>
        )}
      </Modal>
    </>
  );
}
