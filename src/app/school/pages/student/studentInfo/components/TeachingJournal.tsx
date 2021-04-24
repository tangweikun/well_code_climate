// 电子教学日志管理
import React from 'react';
import { useTablePagination, useForceUpdate } from 'hooks';
import TeachingJournalTable from '../../teachingJournal/teachingJournalTable';

function TeachingJournal(props: any) {
  const { sid } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    stuid: sid,
  };

  return (
    <>
      <TeachingJournalTable
        query={query}
        ignore={ignore}
        forceUpdate={forceUpdate}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        withOutQueryTime={true}
      />
    </>
  );
}

export default TeachingJournal;
