import React from 'react';
import { Tabs, Drawer } from 'antd';
import { Title } from 'components';
import StudentDetails from './components/StudentDetails';
import TeachingJournal from './components/TeachingJournal';
import SettlementRecords from '../../financial/settlementRecords/index';
import StudentOrder from '../../financial/studentOrder';
import ElectronicFile from './components/ElectronicFile';
import OrderRecord from '../../teach/orderRecord/index';
import PhasedReview from './components/PhasedReview';
import TrainInfo from './components/TrainInfo';
import AccountInfo from './components/AccountInfo';
import { useAuth } from 'hooks';

const { TabPane } = Tabs;

// FIXME: add IProps
export default function Details(props: any) {
  const { onCancel, sid, isFrozenStudent, showBtn, idcard, visible = true, currentRecord } = props;
  const isShowAccountInfo = useAuth('student/studentInfo:AccountInfo');

  return (
    <>
      <Drawer visible={visible} destroyOnClose width={1300} title={'学员信息详情'} onClose={onCancel} footer={null}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="学员信息" key="1">
            <StudentDetails sid={sid} />
          </TabPane>
          <TabPane tab="教学日志" key="2">
            <TeachingJournal sid={sid} />
          </TabPane>

          <TabPane tab="驾训信息" key="3">
            <Title>学时里程信息</Title>
            <TrainInfo sid={sid} showBtn={showBtn} />

            <Title style={{ marginTop: 20 }}>阶段报审信息</Title>
            <PhasedReview currentRecord={currentRecord} />
          </TabPane>

          {isFrozenStudent && ( //一次性冻结、预约冻结的学员才显示 缴费记录及结算记录
            <>
              <TabPane tab="缴费记录" key="4">
                <StudentOrder sid={sid} isFromStudentInfo />
              </TabPane>

              <TabPane tab="结算记录" key="5">
                <SettlementRecords idcard={idcard} sid={sid} isFromStudentInfo />
              </TabPane>
            </>
          )}

          <TabPane tab="电子档案" key="6">
            <ElectronicFile sid={sid} currentRecord={currentRecord} />
          </TabPane>

          <TabPane tab="预约记录" key="7">
            <OrderRecord sid={sid} isFromStudentInfo />
          </TabPane>
          {isShowAccountInfo && (
            <TabPane tab="账户信息" key="8">
              <AccountInfo sid={sid} isFromStudentInfo />
            </TabPane>
          )}
        </Tabs>
      </Drawer>
    </>
  );
}
