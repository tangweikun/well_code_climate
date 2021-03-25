import { createContext } from 'react';

interface ContextState {
  $elementAuthTable: any;
  $menuAuthTable: any;
  $token: string | null;
  $setToken(p: string): void;
  $userId: string | null;
  $setUserId(p: string): void;
  $schoolId: string | null;
  $setSchoolId(p: string): void;
  $username: string | null;
  $setUsername(p: string): void;
  $schoolLabel: string | null;
  $setSchoolLabel(p: string): void;
  $rolesIds: string | null;
  $setRolesIds(p: string): void;
  $companyId: string | null;
  $setCompanyId(p: string): void;
  $operatorName: string | null;
  $setOperatorName(p: string): void;
  $menuTree: any[];
  $schoolName: string | null;
  $setSchoolName(p: string): void;
  isLoading: boolean;
}

const GlobalContext = createContext({} as ContextState);

export default GlobalContext;
