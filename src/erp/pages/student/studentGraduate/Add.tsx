import React, { useState } from 'react';
import { Modal, Table, Row, Button, message } from 'antd';
import { useFetch, useSearch, useTablePagination, useForceUpdate, useVisible } from 'hooks';
import { _applyGraduatesList, _addReview } from './_api';
import { _getStudentList } from 'api';
import { Search } from 'components';
import { _get } from 'utils';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../../student/studentInfo/Details';
// import { QuestionCircleOutlined } from '@ant-design/icons';

function Add(props: any) {
  const { onCancel, onOk } = props;
  const [search, _handleSearch] = useSearch();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');

  const { isLoading, data } = useFetch({
    request: _applyGraduatesList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([_get(data, 'rows.0.id')]);
    },
  });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      render: (name: string, record: any) => {
        return (
          <div
            onClick={() => {
              _switchDetailsVisible();
              setSid(_get(record, 'sid'));
            }}
            className="pointer"
            style={{ color: PRIMARY_COLOR }}
          >
            {name}
          </div>
        );
      },
    },
    {
      title: '学员证件号',
      dataIndex: 'idcard',
    },
    {
      title: '车型',
      dataIndex: 'traintype',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  // // 确定申请并上传监管
  // const { loading: sureUpLoading, run: sureUpRun } = useRequest(_addReview, {
  //   onSuccess: onOk,
  // });

  return (
    <>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} />}

      <Modal visible title={'结业申请'} maskClosable={false} onCancel={onCancel} footer={null}>
        <Search
          filters={[
            {
              type: 'CustomSelect',
              field: 'sid',
              placeholder: '学员姓名',
              options: [
                { label: '学员姓名', value: 'name' },
                { label: '学员证件', value: 'idcard' },
              ],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          customRequest={_getStudentList}
          extraParamsForCustomRequest={{ status: '01' }}
        />

        <Table
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'id')}
          pagination={tablePagination}
        />

        <Row justify="end" style={{ marginTop: 20 }}>
          <Button style={{ marginLeft: 20 }} onClick={onCancel}>
            取消
          </Button>
          <Button
            type="primary"
            disabled={_get(data, 'rows', []).length < 1}
            style={{ marginLeft: 20 }}
            onClick={async () => {
              let errCount = 0;
              for (let i = 0; i < selectedRowKeys.length; i++) {
                const res = await _addReview({
                  applyPrestepId: selectedRowKeys[i],
                  graduateUpload: false,
                });
                if (_get(res, 'code') !== 200) {
                  errCount++;
                }
              }
              if (errCount === 0) {
                message.success('成功');
              } else {
                message.error(`有${errCount}条记录失败`);
              }
              onOk();
            }}
          >
            确定
          </Button>
          {/* <Button
            type="primary"
            style={{ marginLeft: 20 }}
            loading={sureUpLoading}
            disabled={_get(data, 'rows', []).length < 1}
            onClick={async () => {
              sureUpRun({ applyPrestepId: selectedRowKeys[0], graduateUpload: true });
            }}
          >
            确定申请并上传监管
            <Tooltip title="申请学员结业后，系统将自动上传结业证到监管平台">
              <QuestionCircleOutlined style={{ marginLeft: '5px', color: '#a2a0a0' }} />
            </Tooltip>
          </Button> */}
        </Row>
      </Modal>
    </>
  );
}

export default Add;
