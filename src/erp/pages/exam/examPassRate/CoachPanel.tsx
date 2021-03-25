import React from 'react';
import { Tabs } from 'antd';
import CoachStatistic from './CoachStatistic';

export default function CoachPanel() {
  const { TabPane } = Tabs;
  const tabs = [
    { tab: '近一周', period: 'week' },
    { tab: '近一月', period: 'month' },
    { tab: '近三月', period: 'trimonth' },
    { tab: '近一年', period: 'year' },
  ];

  return (
    <Tabs defaultActiveKey="week">
      {tabs.map((x: any) => (
        <TabPane tab={x.tab} key={x.period}>
          <CoachStatistic period={x.period} />
        </TabPane>
      ))}
    </Tabs>
  );
}
