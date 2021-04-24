import { Table } from 'antd';
import { useFetch, useTablePagination } from 'hooks';
import { _get } from 'utils';
import React, { useState } from 'react';
import { _examPassRateCoach } from './_api';
import { IF, Loading } from 'components';
import CoachTotal from './CoachTotal';

interface IProps {
  period: string;
}

export default function CoachStatistic(props: IProps) {
  const { period } = props;
  const [tableData, setTableData] = useState([]);
  const [totalSubject2Data, setTotalSubject2Data] = useState([]);
  const [totalSubject3Data, setTotalSubject3Data] = useState([]);
  const [totalPass, setTotalPass] = useState();
  const [pagination, setPagination, tablePagination] = useTablePagination({});

  const { data, isLoading } = useFetch({
    request: _examPassRateCoach,
    query: { period, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize],
    // TODO: TS 不清楚这一块业务逻辑
    callback: (data: any) => {
      const total = _get(data, 'rows', []).filter((items: any) => {
        return _get(items, 'title', '') === 'total';
      });
      _get(total, '0.subjectItems', []).forEach((element: any) => {
        if (element.subject === '科目二') {
          setTotalSubject2Data(element);
        }
        if (element.subject === '科目三') {
          setTotalSubject3Data(element);
        }
      });
      setTotalPass(_get(total, '0.totalPass', ''));
      const arr = _get(data, 'rows', []).filter((cur: any, index: number) => {
        return _get(cur, 'title', '') !== '' && _get(cur, 'title', '') !== 'total';
      });
      arr.map((element: any) => {
        let subject2Arr: any = [];
        let subject3Arr: any = [];
        _get(element, 'subjectItems', '').forEach((item: any) => {
          if (item.subject === '科目二') {
            subject2Arr = item;
          }
          if (item.subject === '科目三') {
            subject3Arr = item;
          }
        });
        element.examCount2 = _get(subject2Arr, 'examCount', '');
        element.failCount2 = _get(subject2Arr, 'failCount', '');
        element.mulPassCount2 = _get(subject2Arr, 'mulPassCount', '');
        element.onePassCount2 = _get(subject2Arr, 'onePassCount', '');
        element.onePassRate2 = _get(subject2Arr, 'onePassRate', '');
        element.passRate2 = _get(subject2Arr, 'passRate', '');
        element.examCount3 = _get(subject3Arr, 'examCount', '');
        element.failCount3 = _get(subject3Arr, 'failCount', '');
        element.mulPassCount3 = _get(subject3Arr, 'mulPassCount', '');
        element.onePassCount3 = _get(subject3Arr, 'onePassCount', '');
        element.onePassRate3 = _get(subject3Arr, 'onePassRate', '');
        element.passRate3 = _get(subject3Arr, 'passRate', '');
      });

      setTableData(arr);
    },
  });

  function commonFormat(val: string | null) {
    return val != null && val !== '' ? val + '%' : '';
  }

  const columns = [
    {
      title: '教练员',
      dataIndex: 'title',
    },
    {
      title: '考出人数',
      dataIndex: 'totalPass',
    },
    {
      title: '科目二',
      children: [
        { title: '参考', dataIndex: 'examCount2' },
        {
          title: '合格',
          children: [
            { title: '初考', dataIndex: 'onePassCount2' },
            { title: '补考', dataIndex: 'mulPassCount2' },
          ],
        },
        { title: '不合格', dataIndex: 'failCount2' },
        { title: '合格率', dataIndex: 'passRate2', render: commonFormat },
        { title: '首考合格率', dataIndex: 'onePassRate2', render: commonFormat },
      ],
    },
    {
      title: '科目三',
      children: [
        { title: '参考', dataIndex: 'examCount3' },
        {
          title: '合格',
          children: [
            { title: '初考', dataIndex: 'onePassCount3' },
            { title: '补考', dataIndex: 'mulPassCount3' },
          ],
        },
        { title: '不合格', dataIndex: 'failCount3' },
        { title: '合格率', dataIndex: 'passRate3', render: commonFormat },
        { title: '首考合格率', dataIndex: 'onePassRate3', render: commonFormat },
      ],
    },
  ];

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <CoachTotal
              totalSubject2Data={totalSubject2Data}
              totalSubject3Data={totalSubject3Data}
              data={data}
              totalPass={totalPass}
            />
            <Table
              columns={columns}
              loading={isLoading}
              bordered
              dataSource={tableData}
              rowKey="title"
              pagination={tablePagination}
            />
          </div>
        }
      />
    </div>
  );
}
