import React from 'react';
import CommonStatistic from './CommonStatistic';

interface IProps {
  period: any;
}

export default function AgeStatistic(props: IProps) {
  const { period } = props;
  return <CommonStatistic type="age" period={period} />;
}
