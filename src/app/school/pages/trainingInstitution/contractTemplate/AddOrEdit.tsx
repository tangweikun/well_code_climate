import React, { useState } from 'react';
import { Modal, Form, Row, Input, Select, message } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _getContractTemplateDetail, _updateInfo, _getInitForm, _addInfo } from './_api';
import { _get } from 'utils';
import { ItemCol, Loading } from 'components';
import { RULES } from 'constants/rules';

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk } = props;
  const [form] = Form.useForm();
  const [schContractTempitemList, setSchContractTempitemList] = useState<any>([]);
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: isEdit ? _getContractTemplateDetail : _getInitForm,
    callback: (data) => {
      setSchContractTempitemList(_get(data, 'schContractTempitemList', []));
    },
  });

  const checkTypeOptions = useOptions('student_contract_check_type');
  const carTypeOptions = useOptions('business_scope'); // 经营车型
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateInfo : _addInfo, {
    onSuccess: onOk,
  });
  return (
    <Modal
      visible
      width={1000}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
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
          const query = {
            memo: _get(values, 'memo'),
            cartype: _get(values, 'cartype'),
            tempid: currentId,
            schContractTempitemList: schContractTempitemList,
          };
          run(query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          initialValues={{
            cartype: _get(data, 'cartype'),
            memo: _get(data, 'memo'),
          }}
        >
          <Row>
            <ItemCol label="车型" name="cartype" rules={[{ required: true, message: '请选择车型' }]}>
              <Select options={carTypeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>

            {schContractTempitemList.map((item: any, index: number) => {
              if (item.itemtype === '0') {
                return (
                  <ItemCol label={item.itemname} key={item.itemcode} required>
                    <Input
                      value={item.itemvalue}
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

              return (
                <ItemCol label={item.itemname} key={item.itemcode} required>
                  <Select
                    options={checkTypeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    value={item.itemvalue}
                    onChange={(value) => {
                      schContractTempitemList[index].itemvalue = value;
                      setSchContractTempitemList([...schContractTempitemList]);
                    }}
                  />
                </ItemCol>
              );
            })}
          </Row>
          <Row>
            <ItemCol label="备注" name="memo" rules={[RULES.MEMO]}>
              <Input.TextArea />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
