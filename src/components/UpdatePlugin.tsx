import React from 'react';
import { Modal, Row } from 'antd';
import { PUBLIC_URL } from 'constants/env';

export default function UpdatePlugin(props: any) {
  const { onCancel, info = '' } = props;
  const Download = (text: any) => (
    <span
      className="color-primary pointer"
      onClick={() => {
        const link = document.createElement('a');
        link.href = `${PUBLIC_URL}package.zip`;
        link.download = 'package.zip';
        link.click();
      }}
    >
      {text}
    </span>
  );
  return (
    <Modal
      visible
      width={600}
      maskClosable={false}
      onCancel={onCancel}
      title="安装插件程序"
      onOk={onCancel}
      footer={null}
    >
      <Row>{info}</Row>
      <Row>如您已安装，请运行或{Download('更新安装程序')}后，再使用本功能</Row>
      <Row>如您未安装，请{Download('点击下载')}，安装并启动插件程序后，再使用本功能</Row>
    </Modal>
  );
}
