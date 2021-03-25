import React from 'react';
import { Tabs } from 'antd';
import ExamCompareTable from './ExamCompareTable';
import ExamCompareChart from './ExamCompareChart';

interface IProps {
  year: any;
}

export default function ExamComparePanel(props: IProps) {
  const { TabPane } = Tabs;
  const { year } = props;
  return (
    <Tabs defaultActiveKey="1" type="card">
      <TabPane tab="表格显示" key="1">
        <ExamCompareTable year={year} />
      </TabPane>
      <TabPane tab="图形显示" key="2">
        <ExamCompareChart year={year} />
      </TabPane>
    </Tabs>
  );
}
