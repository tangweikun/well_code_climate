import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Auth, handleLogout, _get } from 'utils';
import GlobalContext from './globalContext';
import { useFetch } from 'hooks';
import { _getMenuTree, _getUserInfo } from './_api';

interface IProps {
  children: React.ReactNode;
}

export default function GlobalProvider(props: IProps) {
  const [$menuAuthTable, $setMenuAuthTable] = useState({}) as any; // 用户有权限访问的按钮HashTable
  const [$elementAuthTable, $setElementAuthTable] = useState({}) as any; // 用户有权限访问的菜单HashTable
  const [$companyId, $setCompanyId] = useState(Auth.get('companyId'));
  const [$token, $setToken] = useState(Auth.get('token'));
  const [$userId, $setUserId] = useState(Auth.get('userId'));
  const [$schoolId, $setSchoolId] = useState(Auth.get('schoolId')); // 当前驾校id
  const [$username, $setUsername] = useState(Auth.get('username'));
  const [$schoolLabel, $setSchoolLabel] = useState(Auth.get('schoolLabel'));
  const [$rolesIds, $setRolesIds] = useState(Auth.get('rolesIds'));
  const [$schoolName, $setSchoolName] = useState(Auth.get('schoolName'));
  const [$operatorName, $setOperatorName] = useState(Auth.get('operatorName'));

  const { isLoading } = useFetch({
    request: _getUserInfo,
    callback: (data) => {
      // 如果菜单列表为空，则强制用户登出
      if (isEmpty(_get(data, 'menus'))) {
        handleLogout();
      }

      _get(data, 'elements', []).forEach((x: any) => {
        $elementAuthTable[_get(x, 'code')] = _get(x, 'id');
      });

      _get(data, 'menus', []).forEach((x: any) => {
        $menuAuthTable[_get(x, 'code')] = _get(x, 'id');
      });

      $setElementAuthTable($elementAuthTable);
      $setMenuAuthTable($menuAuthTable);
      Auth.set('schoolName', _get(data, 'companyName'));
      $setSchoolName(_get(data, 'companyName'));
    },
    depends: [$companyId],
  });

  // 左侧菜单栏
  const { data: $menuTree = [] } = useFetch({
    request: _getMenuTree,
    query: { username: $username, companyId: $companyId },
    requiredFields: ['username', 'companyId'],
    depends: [$username, $companyId],
  });

  return (
    <GlobalContext.Provider
      value={{
        $elementAuthTable,
        $menuAuthTable,
        $token,
        $setToken,
        $userId,
        $setUserId,
        $schoolId,
        $setSchoolId,
        $username,
        $setUsername,
        $schoolLabel,
        $setSchoolLabel,
        $rolesIds,
        $setRolesIds,
        $companyId,
        $setCompanyId,
        $operatorName,
        $setOperatorName,
        $menuTree,
        $schoolName,
        $setSchoolName,
        isLoading,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
