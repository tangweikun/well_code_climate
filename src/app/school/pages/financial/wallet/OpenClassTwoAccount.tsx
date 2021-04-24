import React, { useState } from 'react';
import { Button, Modal, Radio, Row } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { _getAccountInfo, _openSchoolAccount, _getBaseInfo } from './_api';
import { Auth, _get } from 'utils';
import moment from 'moment';
import OpenClassTwoAccountForm from './OpenClassTwoAccountForm';

import { IF, Loading } from 'components';

interface IProps {
  onCancel: (params: boolean) => void;
}

export default function OpenClassTwoAccount(props: IProps) {
  const { onCancel } = props;
  const [openClassTwoAccountFormVisible, setOpenClassTwoAccountFormVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [componyName, setComponyName] = useState('');
  const [idCard, setIdcard] = useState('');

  const [collectionAccount, setCollectionAccount] = useState(false);

  // 驾校基本信息详情
  const { isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data: any) => {
      setComponyName(_get(data, 'name', ''));
      setIdcard(_get(data, 'socialCredit', ''));
    },
  });

  return (
    <Modal visible title={'银行开户申请'} onCancel={() => onCancel(false)} footer={null} width={400}>
      <div>
        <IF
          condition={schoolDataLoading}
          then={<Loading />}
          else={
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 50, lineHeight: '30px' }}>
              <Row>企业名称：{componyName}</Row>
              <Row>证件类型：社会信用代码</Row>
              <Row>证件号码：{idCard}</Row>
              <Row>有效期限：{moment().format('YYYY-MM-DD') + '-' + moment().add(5, 'year').format('YYYY-MM-DD')}</Row>
              <Radio
                style={{ whiteSpace: 'normal' }}
                onChange={(e) => {
                  e.target.checked ? setDisabled(false) : setDisabled(true);
                }}
              >
                已阅读并同意
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://test.welldriver.cn:1445/h5/file/classTwoAccount?school=${componyName}`}
                >
                  《平安银行网上支付结算服务协议》
                </a>
              </Radio>
            </div>
          }
        />
      </div>
      <Row justify={'end'} style={{ marginTop: 10 }}>
        <Button onClick={() => onCancel(false)} style={{ marginRight: 20 }}>
          取消
        </Button>
        <Button
          type="primary"
          // loading={loading}
          disabled={disabled}
          onClick={() => {
            // run({ bankChannelId: bankChannel });
            setOpenClassTwoAccountFormVisible(true);
          }}
        >
          确认
        </Button>
      </Row>

      {openClassTwoAccountFormVisible && <OpenClassTwoAccountForm onCancel={setOpenClassTwoAccountFormVisible} />}
    </Modal>
  );
}
