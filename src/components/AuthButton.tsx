import { Button } from 'antd';
import React, { useContext } from 'react';
import GlobalContext from 'globalContext';

function AuthButton(props: any) {
  const { authId, insertWhen = true, ...restProps } = props;
  const { $elementAuthTable } = useContext(GlobalContext);

  if (!insertWhen) return null;
  if (authId && !$elementAuthTable[authId]) return null;

  return <Button {...restProps} />;
}

export default AuthButton;
