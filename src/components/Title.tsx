import React from 'react';

interface ITitle {
  style?: object; // 自定义样式
  children: JSX.Element | string;
}

export default function Title(props: ITitle) {
  const { style = {} } = props;

  return <div style={{ fontSize: 18, fontWeight: 'bold', height: 50, ...style }}>{props.children}</div>;
}
