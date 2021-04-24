import React, { useState } from 'react';
import { Modal, Table, Col, Row, Button, Alert } from 'antd';
import { Title } from 'components';
import { _getPlaceList, _addVersion } from './_api';
import { useFetch, useTablePagination, useForceUpdate, useSearch, useRequest, useHash, useVisible } from 'hooks';
import { _get } from 'utils';
import { Search } from 'components';
import Details from '../teachingArea/Details';

export default function ReleaseVersion(props: any) {
  const { onCancel, onOk, currentRecord } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [search, _handleSearch] = useSearch();

  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [hadSelectedRowKeys, setHadSelectedRowKeys] = useState<any>([]);
  const [selectedAllKeys, setSelectedAllRowKeys] = useState<any>(new Set());
  const [hash, setHash] = useState<any>({});
  const teachTypeHash = useHash('teach_type');
  const [currentId, setCurrentId] = useState(null);
  const [detailsVisible, _switchDetailsVisible] = useVisible();

  // 分页展示可选场地信息
  const { isLoading, data } = useFetch({
    request: _getPlaceList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([...selectedAllKeys]); // 切换分页的时候，展示已选中的场地
      _get(data, 'rows', []).forEach((x: any) => {
        Object.assign(hash, { [x.rid]: x });
      });
      setHash({ ...hash });
    },
  });

  const columns = [
    {
      title: '场地名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: any) => teachTypeHash[type],
    },
    {
      title: '培训车型',
      dataIndex: 'vehicletype',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <Button
          onClick={() => {
            _switchDetailsVisible();
            setCurrentId(_get(record, 'rid'));
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          详情
        </Button>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  const hadRowSelection = {
    onChange: (hadSelectedRowKeys: any) => {
      setHadSelectedRowKeys(hadSelectedRowKeys);
    },
    hadSelectedRowKeys,
  };

  const selectedData = [...selectedAllKeys].map((key: any) => hash[key]);

  const { loading: confirmLoading, run } = useRequest(_addVersion, {
    onSuccess: onOk,
  });

  return (
    <>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}

      <Modal
        visible
        width={1100}
        confirmLoading={confirmLoading}
        title={'发布围栏版本'}
        maskClosable={false}
        onCancel={onCancel}
        okText={'发版'}
        onOk={async () => {
          run({
            carid: _get(currentRecord, 'carid'),
            rids: selectedRowKeys,
            type: _get(currentRecord, 'type', '1'),
          });
        }}
      >
        <>
          <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Col span={12}>
              <Title>可选场地信息</Title>

              <Row>
                <Col span={20}>
                  <Search
                    filters={[{ type: 'Input', field: 'name', placeholder: '场地名称' }]}
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
                    dataSource={_get(data, 'rows', [])}
                    rowKey={(record) => _get(record, 'rid')}
                    pagination={tablePagination}
                    rowSelection={{
                      type: 'checkbox',
                      ...rowSelection,
                    }}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedAllRowKeys(new Set([...selectedAllKeys, ...selectedRowKeys]));
                    }}
                    style={{ margin: '95px 10px 0 10px' }}
                  >
                    添加
                  </Button>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Title style={{ marginBottom: 57 }}>已选场地</Title>

              <Row>
                <Col span={4}>
                  <Button
                    type="primary"
                    style={{ margin: '39px 10px 0 10px' }}
                    onClick={() => {
                      setSelectedAllRowKeys(
                        new Set([...selectedAllKeys].filter((x) => !hadSelectedRowKeys.includes(x))),
                      );
                      forceUpdate();
                    }}
                  >
                    删除
                  </Button>
                </Col>
                <Col span={20}>
                  <Table
                    columns={columns}
                    loading={isLoading}
                    bordered
                    dataSource={selectedData}
                    rowKey={(record) => _get(record, 'rid')}
                    rowSelection={{
                      type: 'checkbox',
                      ...hadRowSelection,
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 20 }}>
            <Alert message="发版后，需重新启动计时终端后才会生效相应版本" type="warning" />
          </Row>
        </>
      </Modal>
    </>
  );
}
