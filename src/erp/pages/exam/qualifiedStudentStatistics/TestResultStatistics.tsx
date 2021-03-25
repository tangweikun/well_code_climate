import React from 'react';
import { useFetch } from 'hooks';
import { _getTestResultStatistic } from './_api';
import StatisticsTable from './StatisticsTable';
import { Loading } from 'components';

interface IProps {
  period: any;
}

export default function TestResultStatistics(props: IProps) {
  const { period } = props;
  const { data = [], isLoading } = useFetch({
    request: _getTestResultStatistic,
    query: { period: period },
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
      {isLoading && <Loading />}
      {!isLoading &&
        data.map((item: any, index: any) => {
          let specialStyle = {};
          let label = '首考合格';
          if (index === 1) {
            specialStyle = { borderLeft: 0, borderRight: 0 };
          }
          if (index === 0) {
            label = '一次通过';
          }
          return <StatisticsTable dataSource={item} specialStyle={specialStyle} label={label} key={index} />;
        })}
    </div>
  );
}
