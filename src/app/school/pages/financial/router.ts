import { lazy } from 'react';

export const financial = [
  {
    path: '/financial/accountDetails',
    component: lazy(() => import('app/school/pages/financial/accountDetails')),
  },
  {
    path: '/financial/bankStatement',
    component: lazy(() => import('app/school/pages/financial/bankStatement')),
  },
  {
    path: '/financial/settlementRecords',
    component: lazy(() => import('app/school/pages/financial/settlementRecords')),
  },
  {
    path: '/financial/splitAccount',
    component: lazy(() => import('app/school/pages/financial/splitAccount')),
  },
  {
    path: '/financial/studentOrder',
    component: lazy(() => import('app/school/pages/financial/studentOrder')),
  },
  {
    path: '/financial/transactionRecords',
    component: lazy(() => import('app/school/pages/financial/transactionRecords')),
  },
  {
    path: '/financial/wallet',
    component: lazy(() => import('app/school/pages/financial/wallet')),
  },
];
