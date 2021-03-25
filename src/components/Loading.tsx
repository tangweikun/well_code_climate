import React from 'react';
import { Spin } from 'antd';

type TProps = {
  tip?: string; // 提示文案
};

export default function Loading(props: TProps) {
  const { tip = '' } = props;

  return (
    <div style={{ textAlign: 'center', marginTop: '10rem' }}>
      <Spin size="large" tip={tip} />
    </div>
  );
}
