import React, { Suspense, lazy, useContext, useMemo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { isEmpty } from 'lodash';
import 'normalize.css';
import BasicLayout from 'layouts/BasicLayout';
import Login from 'erp/pages/login';
import Mock from 'erp/pages/mock';
import { Loading } from 'components';
import { PUBLIC_URL } from 'constants/env';
import NotFoundPage from 'erp/pages/404';
import GlobalContext from 'globalContext';
import { findFirstMenuPath, generateMenuMap } from 'utils';

const trainingInstitutionRouters = [
  {
    path: '/otherDevice',
    component: lazy(() => import('erp/pages/trainingInstitution/otherDevice')),
  },
  {
    path: '/carInfo',
    component: lazy(() => import('erp/pages/trainingInstitution/carInfo')),
  },
  {
    path: '/teachingArea',
    component: lazy(() => import('erp/pages/trainingInstitution/teachingArea')),
  },
  {
    path: '/assesserInfo',
    component: lazy(() => import('erp/pages/trainingInstitution/assesserInfo')),
  },
  {
    path: '/securityOfficerInfo',
    component: lazy(() => import('erp/pages/trainingInstitution/securityOfficerInfo')),
  },
  {
    path: '/businessOutlet',
    component: lazy(() => import('erp/pages/trainingInstitution/businessOutlet')),
  },
  {
    path: '/vehicleTechnicalRating',
    component: lazy(() => import('erp/pages/trainingInstitution/vehicleTechnicalRating')),
  },
  {
    path: '/trainingInstitutionEvaluation',
    component: lazy(() => import('erp/pages/trainingInstitution/trainingInstitutionEvaluation')),
  },
  {
    path: '/trainingInstitutionComplaints',
    component: lazy(() => import('erp/pages/trainingInstitution/trainingInstitutionComplaints')),
  },
  {
    path: '/classInfo',
    component: lazy(() => import('erp/pages/trainingInstitution/classInfo')),
  },
  {
    path: '/branchMechanism',
    component: lazy(() => import('erp/pages/trainingInstitution/branchMechanism')),
  },
  {
    path: '/trainingInstitutionInfo',
    component: lazy(() => import('erp/pages/trainingInstitution/trainingInstitutionInfo')),
  },
  {
    path: '/contractTemplate',
    component: lazy(() => import('erp/pages/trainingInstitution/contractTemplate')),
  },
  {
    path: '/fenceManagement',
    component: lazy(() => import('erp/pages/trainingInstitution/fenceManagement')),
  },
  {
    path: '/vehicleTrajectory',
    component: lazy(() => import('erp/pages/trainingInstitution/vehicleTrajectory')),
  },
  {
    path: '/carMonitor',
    component: lazy(() => import('erp/pages/trainingInstitution/carMonitor')),
  },
];

const studentRouters = [
  {
    path: '/studentAcrossInstitution',
    component: lazy(() => import('erp/pages/student/studentAcrossInstitution')),
  },
  {
    path: '/studentDropped',
    component: lazy(() => import('erp/pages/student/studentDropped')),
  },
  {
    path: '/studentCardMaking',
    component: lazy(() => import('erp/pages/student/studentCardMaking')),
  },
  {
    path: '/teachingJournal',
    component: lazy(() => import('erp/pages/student/teachingJournal')),
  },
  {
    path: '/effectiveTrainingProcess',
    component: lazy(() => import('erp/pages/student/effectiveTrainingProcess')),
  },
  {
    path: '/subjectIdentification',
    component: lazy(() => import('erp/pages/student/subjectIdentification')),
  },
  {
    path: '/trainingDetailReview',
    component: lazy(() => import('erp/pages/student/trainingDetailReview')),
  },
  {
    path: '/finalAssessment',
    component: lazy(() => import('erp/pages/student/finalAssessment')),
  },
  {
    path: '/trial',
    component: lazy(() => import('erp/pages/student/trial')),
  },
  {
    path: '/printTrainingRecordSheet',
    component: lazy(() => import('erp/pages/student/printTrainingRecordSheet')),
  },
  {
    path: '/forecastReview',
    component: lazy(() => import('erp/pages/student/forecastReview')),
  },
  {
    path: '/studentInfo',
    component: lazy(() => import('erp/pages/student/studentInfo')),
  },
  {
    path: '/phasedReview',
    component: lazy(() => import('erp/pages/student/phasedReview')),
  },
  {
    path: '/studentFace',
    component: lazy(() => import('erp/pages/student/studentFace')),
  },
  {
    path: '/studentGraduate',
    component: lazy(() => import('erp/pages/student/studentGraduate')),
  },
  {
    path: '/forecastExpected',
    component: lazy(() => import('erp/pages/student/forecastExpected')),
  },
  {
    path: '/forecastChecked',
    component: lazy(() => import('erp/pages/student/forecastChecked')),
  },
  {
    path: '/phaseDeclare',
    component: lazy(() => import('erp/pages/student/phaseDeclare')),
  },
];

const coachRouters = [
  {
    path: '/coachContinueEducation',
    component: lazy(() => import('erp/pages/coach/coachContinueEducation')),
  },
  {
    path: '/coachInfo',
    component: lazy(() => import('erp/pages/coach/coachInfo')),
  },
  {
    path: '/coachFaceReview',
    component: lazy(() => import('erp/pages/coach/coachFaceReview')),
  },
  {
    path: '/coachComplaints',
    component: lazy(() => import('erp/pages/coach/coachComplaints')),
  },
  {
    path: '/coachEvaluation',
    component: lazy(() => import('erp/pages/coach/coachEvaluation')),
  },
  {
    path: '/teachingSituation',
    component: lazy(() => import('erp/pages/coach/teachingSituation')),
  },
  {
    path: '/coachCard',
    component: lazy(() => import('erp/pages/coach/coachCard')),
  },
];

const userCenterRouters = [
  {
    path: '/userCenter/roleManage',
    component: lazy(() => import('erp/pages/userCenter/roleManage')),
  },
  {
    path: '/userCenter/userManage',
    component: lazy(() => import('erp/pages/userCenter/userManage')),
  },
  {
    path: '/userCenter/organizationManage',
    component: lazy(() => import('erp/pages/userCenter/organizationManage')),
  },
  {
    path: '/userCenter/operateLog',
    component: lazy(() => import('erp/pages/userCenter/operateLog')),
  },
];

const teachRouters = [
  {
    path: '/timeRule',
    component: lazy(() => import('erp/pages/teach/timeRule')),
  },
  {
    path: '/realTimeAppointment',
    component: lazy(() => import('erp/pages/teach/realTimeAppointment')),
  },
  {
    path: '/signReset',
    component: lazy(() => import('erp/pages/teach/signReset')),
  },
  {
    path: '/orderRecord',
    component: lazy(() => import('erp/pages/teach/orderRecord')),
  },
  {
    path: '/simulationAppointment',
    component: lazy(() => import('erp/pages/teach/simulationAppointment')),
  },
  {
    path: '/theoryAppointment',
    component: lazy(() => import('erp/pages/teach/theoryAppointment')),
  },
];

const financialRouters = [
  {
    path: '/financial/wallet',
    component: lazy(() => import('erp/pages/financial/wallet')),
  },
  {
    path: '/financial/studentOrder',
    component: lazy(() => import('erp/pages/financial/studentOrder')),
  },
  {
    path: '/financial/settlementRecords',
    component: lazy(() => import('erp/pages/financial/settlementRecords')),
  },
  {
    path: '/financial/accountDetails',
    component: lazy(() => import('erp/pages/financial/accountDetails')),
  },
  {
    path: '/financial/transactionRecords',
    component: lazy(() => import('erp/pages/financial/transactionRecords')),
  },
  {
    path: '/financial/bankStatement',
    component: lazy(() => import('erp/pages/financial/bankStatement')),
  },
];
const pushManagementRouters = [
  {
    path: '/pushManagement/studentPushRecord',
    component: lazy(() => import('erp/pages/pushManagement/studentPushRecord')),
  },
];

const examRouters = [
  {
    path: '/exam/examList',
    component: lazy(() => import('erp/pages/exam/examList')),
  },
  {
    path: '/exam/examResult',
    component: lazy(() => import('erp/pages/exam/examResult')),
  },
  {
    path: '/exam/qualifiedStudentStatistics',
    component: lazy(() => import('erp/pages/exam/qualifiedStudentStatistics')),
  },
  {
    path: '/exam/examResultCompare',
    component: lazy(() => import('erp/pages/exam/examResultCompare')),
  },
  {
    path: '/exam/examPassRate',
    component: lazy(() => import('erp/pages/exam/examPassRate')),
  },
  {
    path: '/exam/peopleStatistics',
    component: lazy(() => import('erp/pages/exam/peopleStatistics')),
  },
];

const statisticsRouters = [
  {
    path: '/coachTrainStatistic',
    component: lazy(() => import('erp/pages/statistics/coachTrainStatistic')),
  },
  {
    path: '/stuStatistic',
    component: lazy(() => import('erp/pages/statistics/stuStatistic')),
  },
  {
    path: '/stuExamCompare',
    component: lazy(() => import('erp/pages/statistics/stuExamCompare')),
  },
];
const robotCoachRouters = [
  {
    path: '/robotCoach',
    component: lazy(() => import('erp/pages/robotCoach/nvrSet')),
  },
];

export default function Routers() {
  const { $menuTree } = useContext(GlobalContext);
  const firstMenuPath = useMemo(() => findFirstMenuPath($menuTree), [$menuTree]);
  const hash = useMemo(() => generateMenuMap($menuTree), [$menuTree]);

  return (
    <Switch>
      {firstMenuPath && (
        <Route exact path={PUBLIC_URL}>
          <Redirect to={`${PUBLIC_URL}${firstMenuPath}`} />
        </Route>
      )}
      <Route exact path={`${PUBLIC_URL}login`}>
        <Login />
      </Route>

      <BasicLayout>
        <Suspense fallback={<Loading />}>
          {!isEmpty($menuTree) && (
            <Switch>
              {[
                ...userCenterRouters,
                ...trainingInstitutionRouters,
                ...studentRouters,
                ...financialRouters,
                ...coachRouters,
                ...teachRouters,
                ...pushManagementRouters,
                ...examRouters,
                ...statisticsRouters,
                ...robotCoachRouters,
              ].map((x) => (
                <Route path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  {hash[x.path.replace(/^\//, '')] ? <x.component /> : <NotFoundPage />}
                </Route>
              ))}

              <Route exact path={`${PUBLIC_URL}mock`}>
                <Mock />
              </Route>

              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          )}
        </Suspense>
      </BasicLayout>
    </Switch>
  );
}
