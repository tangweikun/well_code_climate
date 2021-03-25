import React from 'react';
import { Drawer, Tabs } from 'antd';
import AddFinalAssessment from './AddFinalAssessment';
import AddWorkFinalAssessment from './AddWorkFinalAssessment';
import { _get } from 'utils';

const { TabPane } = Tabs;

export default function AddOrEdit(props: any) {
  const { onCancel, title, onOk, currentId, isEdit, currentRecord, isVisibleWorkTab } = props;

  return (
    <Drawer destroyOnClose visible width={800} title={title} footer={null} onClose={onCancel}>
      <Tabs defaultActiveKey="1" style={{ height: 700 }}>
        {_get(currentRecord, 'subjectcode', '') !== '5' && ( // subjectcode:5 从业资格
          <TabPane tab="结业考核" key="1">
            <AddFinalAssessment onCancel={onCancel} onOk={onOk} currentId={currentId} isEdit={isEdit} />
          </TabPane>
        )}

        {(!isEdit || _get(currentRecord, 'subjectcode') === '5') && isVisibleWorkTab && (
          <TabPane tab="从业培训结业考核" key="2">
            <AddWorkFinalAssessment
              onCancel={onCancel}
              onOk={onOk}
              currentId={currentId}
              isEdit={isEdit}
              currentRecord={currentRecord}
            />
          </TabPane>
        )}
      </Tabs>
    </Drawer>
  );
}
