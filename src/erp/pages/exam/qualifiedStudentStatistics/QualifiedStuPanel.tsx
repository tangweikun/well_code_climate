import React from 'react';
import { Tabs } from 'antd';
import TestResultList from './TestResultList';
import TestResultStatistics from './TestResultStatistics';

interface IProps {
  period: any;
}

export default function QualifiedStuPanel(props: IProps) {
  const { period } = props;
  const { TabPane } = Tabs;
  return (
    <>
      <Tabs type="card">
        <TabPane tab="列表" key="1">
          <TestResultList period={period} />
        </TabPane>
        <TabPane tab="分析" key="2">
          <TestResultStatistics period={period} />
        </TabPane>
      </Tabs>
    </>
  );
}
