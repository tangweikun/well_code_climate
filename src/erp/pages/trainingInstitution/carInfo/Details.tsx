import React from 'react';
import { Modal, Tabs } from 'antd';
import Info from './components/Info';
import TechnologyRate from './components/TechnologyRate';
import Detect from './components/Detect';
import Protect from './components/Protect';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, carid } = props;

  return (
    <Modal visible width={900} title={'车辆详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="车辆信息" key="1">
          <Info carid={carid} />
        </TabPane>
        <TabPane tab="车辆技术等级评定" key="2">
          <TechnologyRate carid={carid} />
        </TabPane>
        <TabPane tab="二级维护记录" key="3">
          <Protect carid={carid} />
        </TabPane>
        <TabPane tab="检测记录" key="4">
          <Detect carid={carid} />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
