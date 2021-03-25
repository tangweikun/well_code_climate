import { useState } from 'react';
import { _get } from 'utils';
import { useFetch, useForceUpdate, useSearch, useVisible } from 'hooks';

interface IUseTable {
  (initialState: {
    request(...params: any[]): void; // 获取表单数据的请求
    initialSearch?: {}; // Search组件需要设置的默认值
    extraParams?: object; // 额外的查询参数
    requiredFields?: string[]; // 获取表单数据的请求的必传字段
    dataSourceFormatter?(data: any[]): any[]; // 格式化dataSource
    cb?(data: any): void; // 调用接口后执行的回调函数
  }): {
    tableProps: object;
    search: object;
    _refreshTable(): void; // 强制刷新Table
    _handleSearch(name: string, value: any): void;
    _data: any;
    isEdit: boolean;
    setIsEdit(params: boolean): void;
    isAddOrEditVisible: boolean;
    _switchIsAddOrEditVisible(): void;
    currentId: string | number | null;
    setCurrentId(params: string | number | null): void;
    currentRecord: any;
    setCurrentRecord(params: any): void;
    _handleAdd(): void;
    _handleOk(): void;
    _handleEdit(record: any, id: string | number | null): void;
    otherState: object;
    setOtherState(params: object): void;
  };
}

export const useTablePro: IUseTable = (initialState) => {
  const {
    request,
    extraParams,
    requiredFields = [],
    initialSearch = {},
    dataSourceFormatter = (data) => data,
    cb,
  } = initialState;
  const [search, _handleSearch] = useSearch(initialSearch);
  const [pagination, setPagination] = useState({ pageSize: 10, total: 0, current: 1 });
  const [ignore, forceUpdate] = useForceUpdate();
  const [isEdit, setIsEdit] = useState(false); // 是否处于编辑模式
  const [isAddOrEditVisible, _switchIsAddOrEditVisible] = useVisible(); // 新增/编辑弹窗可见性
  const [currentId, setCurrentId] = useState(null as number | string | null); // 当前选中记录的Id
  const [currentRecord, setCurrentRecord] = useState(null); // 当前选中的记录
  const [otherState, setOtherState] = useState({});

  const { data, isLoading } = useFetch({
    request,
    query: { ...extraParams, ...search, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize, ignore],
    requiredFields,
    callback: (data) => {
      _get(data, 'total', 0) !== pagination.total && setPagination({ ...pagination, total: _get(data, 'total', 0) });
      cb && cb(data);
    },
  });

  function _refreshTable() {
    setPagination({ ...pagination, current: 1 });
    forceUpdate();
  }

  function _handleAdd() {
    setCurrentId(null);
    setCurrentRecord(null);
    setIsEdit(false);
    _switchIsAddOrEditVisible();
  }

  function _handleEdit(record: any, id: string) {
    _switchIsAddOrEditVisible();
    setCurrentId(id);
    setCurrentRecord(record);
    setIsEdit(true);
  }

  function _handleOk() {
    _switchIsAddOrEditVisible();
    _refreshTable();
  }

  return {
    search,
    _handleSearch,
    tableProps: {
      loading: isLoading,
      bordered: true,
      dataSource: dataSourceFormatter(_get(data, 'rows', [])),
      pagination: {
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onShowSizeChange: (_: any, pageSize: number) => {
          setPagination({ ...pagination, current: 1, pageSize });
        },
        onChange: (page: number) => {
          setPagination((pagination) => ({ ...pagination, current: page }));
        },
      },
    },
    _refreshTable,
    _data: data,
    isEdit,
    setIsEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    currentId,
    setCurrentId,
    currentRecord,
    setCurrentRecord,
    _handleAdd,
    _handleOk,
    otherState,
    setOtherState,
    _handleEdit,
  };
};
