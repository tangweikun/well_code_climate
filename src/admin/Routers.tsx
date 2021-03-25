import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Loading } from 'components';
import { PUBLIC_URL } from 'constants/env';
import NotFoundPage from 'erp/pages/404';

const demos = [
  {
    path: '/demo1',
    component: lazy(() => import('admin/pages/demo1')),
  },
  {
    path: '/demo2',
    component: lazy(() => import('admin/pages/demo2')),
  },
];

export default function Routers() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        {[...demos].map((x) => (
          <Route path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
            <x.component />
          </Route>
        ))}

        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </Suspense>
  );
}
