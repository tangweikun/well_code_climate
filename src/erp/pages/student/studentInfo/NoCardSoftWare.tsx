import React from 'react';
import { Modal } from 'antd';
import { PUBLIC_URL } from 'constants/env';

export default function NoCardSoftWare(props: any) {
  const { onCancel } = props;

  return (
    <Modal
      visible
      width={800}
      maskClosable={false}
      okText={'确定'}
      onCancel={onCancel}
      title="安装维尔驾服读卡程序"
      onOk={onCancel}
      footer={null}
    >
      <div>
        无法进行身份证绑定。
        <br />
        如您已安装，请启动维尔驾服读卡程序，再次使用本功能。
        <br />
        如您未安装，请点击
        {
          <span
            className="color-primary pointer"
            onClick={() => {
              const link = document.createElement('a');
              link.href = `${PUBLIC_URL}package.zip`;
              link.download = 'package.zip';
              link.click();
            }}
          >
            下载
          </span>
        }
        ，安装并启动程序后，再使用本功能。
        <br />
      </div>
    </Modal>
  );
}
