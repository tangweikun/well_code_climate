// 带教学时统计
import React from 'react';
import { Tabs } from 'antd';
import CoachTrainPanel from './CoachTrainPanel';

export default function CoachTrainStatistic() {
  const { TabPane } = Tabs;
  const tabs = [
    { tab: '近一周', statisticType: 0 },
    { tab: '近一月', statisticType: 1 },
    { tab: '近三月', statisticType: 2 },
    { tab: '近一年', statisticType: 3 },
  ];

  return (
    <Tabs defaultActiveKey="0">
      {tabs.map((x: any) => (
        <TabPane tab={x.tab} key={x.statisticType}>
          <CoachTrainPanel statisticType={x.statisticType} />
        </TabPane>
      ))}
    </Tabs>
  );
}
