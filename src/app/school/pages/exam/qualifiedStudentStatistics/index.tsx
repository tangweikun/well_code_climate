// 考出学员统计
import React from 'react';
import { Tabs } from 'antd';
import QualifiedStuPanel from './QualifiedStuPanel';

function QualifiedStudentStatistics() {
  const { TabPane } = Tabs;
  const tabs = [
    { tab: '近一周', period: 'week' },
    { tab: '近一月', period: 'month' },
    { tab: '近三月', period: 'trimonth' },
    { tab: '近一年', period: 'year' },
  ];
  return (
    <Tabs defaultActiveKey="week">
      {tabs.map((x: { tab: string; period: string }) => (
        <TabPane tab={x.tab} key={x.period}>
          <QualifiedStuPanel period={x.period} />
        </TabPane>
      ))}
    </Tabs>
  );
}

export default QualifiedStudentStatistics;
