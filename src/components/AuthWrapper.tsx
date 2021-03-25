import { useContext } from 'react';
import GlobalContext from 'globalContext';

export default function AuthWrapper(props: any) {
  const { authId, insertWhen = true } = props;
  const { $elementAuthTable } = useContext(GlobalContext);

  if (!insertWhen) return null;
  if (authId && !$elementAuthTable[authId]) return null;

  return props.children;
}
