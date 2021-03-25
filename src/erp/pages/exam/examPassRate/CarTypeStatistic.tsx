import React from 'react';
import CommonStatistic from './CommonStatistic';

interface IProps {
  period: any;
}

export default function CarTypeStatistic(props: IProps) {
  const { period } = props;
  return <CommonStatistic type="carType" period={period} />;
}
