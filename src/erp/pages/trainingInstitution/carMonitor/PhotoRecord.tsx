import React from 'react';
import { Table } from 'antd';
import { useTablePagination, useFetch, useSearch, useForceUpdate, useHash } from 'hooks';
import { _get } from 'utils';
import { _getPhotoList } from './_api';
import { Search } from 'components';
import moment from 'moment';

export default function PhotoRecord(props: any) {
  const { currentRecord } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [search, _handleSearch] = useSearch({
    date: moment(),
    stime: moment().startOf('day'),
    etime: moment(),
  });
  const [ignore, forceUpdate] = useForceUpdate();

  const photoTypeHash = useHash('photo_type'); // 照片类型

  const columns = [
    {
      title: '照片类型',
      dataIndex: 'phototype',
      render: (phototype: any) => {
        return photoTypeHash[phototype];
      },
    },
    {
      title: '教练',
      dataIndex: 'coaname',
    },
    {
      title: '学员',
      dataIndex: 'stuname',
    },
    {
      title: '拍照时间',
      dataIndex: 'equtime',
    },
    {
      title: '照片',
      dataIndex: 'url',
      render: (url: any) => {
        return <img style={{ width: 60, height: 60 }} src={url} alt="" />;
      },
    },
  ];

  const { isLoading, data: list = [] } = useFetch({
    request: _getPhotoList,
    depends: [ignore, pagination.current, pagination.pageSize],
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      carid: _get(currentRecord, 'carid'),
      date: _get(search, 'date') ? moment(_get(search, 'date')).format('YYYY-MM-DD') : '',
      stime: _get(search, 'stime') ? moment(_get(search, 'stime')).format('HH:mm:ss') : '',
      etime: _get(search, 'etime') ? moment(_get(search, 'etime')).format('HH:mm:ss') : '',
    },
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      <Search
        filters={[
          { type: 'DatePicker', field: 'date', placeholder: '拍照时间', otherProps: { allowClear: false } },
          {
            type: 'TimeRangePicker',
            field: ['stime', 'etime'],
            placeholder: ['开始时间', '结束时间'],
            otherProps: { allowClear: false, defaultValue: [moment().startOf('day'), moment()] },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(list, 'rows', [])}
        rowKey={(record) => _get(record, 'carid')}
        pagination={tablePagination}
      />
    </div>
  );
}
