/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Auth, handleLogout, _get } from 'utils';
import { postRequestTemp, request } from 'services';
import { PUBLIC_URL, USER_CENTER_URL, LOCAL_URL, CLIENT_ID, CLIENT_SECRET } from 'constants/env';
import GlobalContext from 'globalContext';

export default function Login() {
  const history = useHistory();
  const { $setToken, $setSchoolId, $setUsername, $setRolesIds, $setCompanyId, $setOperatorName } = useContext(
    GlobalContext,
  );

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      history.replace(`${PUBLIC_URL}`);
    }
  });

  useEffect(() => {
    const code = window.location.search.replace(/\?code=/, '');
    if (!Auth.isAuthenticated()) {
      if (code !== '') {
        // 如果未授权就发起获取token的请求
        postRequestTemp('/uni/oauth/token', {
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: `${LOCAL_URL}${PUBLIC_URL}login`,
        }).then(async (res) => {
          const token = _get(res, 'access_token'); // 用户中心返回的token
          Auth.set('token', token);
          $setToken(token);

          const options: any = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              token,
            },
          };

          // 从用户中心获取username
          const uniUserRes = await fetch(USER_CENTER_URL + '/uni/user', options);
          const bar = await uniUserRes.json();
          Auth.set('username', _get(bar, 'username'));
          $setUsername(_get(bar, 'username'));

          // 使用username从用户中心获取用户信息
          const userInfoRes = await request(
            '/api/usercenter/user/info/front',
            'GET',
            {
              username: _get(bar, 'username'),
            },
            { mustAuthenticated: false },
          );

          if (_get(userInfoRes, 'code') === 200) {
            const companies = _get(userInfoRes, 'data.companies', []);
            const companyId = _get(userInfoRes, 'data.companyId', '');
            const operatorName = _get(userInfoRes, 'data.name', '');
            const selectedCompany = companies.find((x: any) => (x.companyId = companyId));
            const rolesIds = _get(userInfoRes, 'data.companyRoles', [])
              .map((x: any) => x.id)
              .join(',');

            Auth.set('schoolId', _get(selectedCompany, 'companyId'));
            $setSchoolId(_get(selectedCompany, 'companyId'));

            Auth.set('companyId', companyId);
            $setCompanyId(companyId);

            Auth.set('operatorName', operatorName);
            $setOperatorName(operatorName);

            // 如果companyId为空则强制用户登出
            if (!companyId) {
              handleLogout();
            }

            Auth.set('rolesIds', rolesIds);
            $setRolesIds(rolesIds);

            Auth.set('userId', _get(userInfoRes, 'data.id'));
          }
        });
      } else {
        window.location.href =
          `${USER_CENTER_URL}` +
          '/uni/oauth/authorize' +
          '?client_id=' +
          CLIENT_ID +
          '&response_type=code&redirect_uri=' +
          `${LOCAL_URL}${PUBLIC_URL}login`;
      }

      return;
    }
  }, []);

  return null;
}
