import { Button } from 'antd';
import React, { useContext } from 'react';
import GlobalContext from 'globalContext';

interface IProps {
  authId: string;
  insertWhen?: boolean;
  [key: string]: any;
}

function AuthButton(props: IProps) {
  const { authId, insertWhen = true, ...restProps } = props;

  const defaultConfig = {};

  // Table 中的操作栏按钮的默认属性
  if (props.className && props.className.includes('operation-button')) {
    Object.assign(defaultConfig, { type: 'primary', ghost: true, size: 'small' });
  }

  const { $elementAuthTable } = useContext(GlobalContext);

  if (!insertWhen) return null;
  if (authId && !$elementAuthTable[authId]) return null;

  return <Button {...defaultConfig} {...restProps} />;
}

export default AuthButton;
