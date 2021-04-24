// 分账管理
import React from 'react';
import { useTablePro, useConfirm, useVisible } from 'hooks';
import { Search, AuthButton } from 'components';
import { _getCoaSplitRatio, _deleteCoach, _getCoachRecord } from './_api';
import { Table } from 'antd';
import { _get } from 'utils';
import UpdateRecord from './UpdateRecord';
import ImportCoach from './ImportCoach';
import { _getCoachList } from 'api';

export default function SplitAccount() {
  const { search, _handleSearch, tableProps, _refreshTable, currentId, setCurrentId } = useTablePro({
    request: _getCoaSplitRatio,
  });
  const [_showConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [importVisible, _switchImportVisible] = useVisible();

  const columns = [
    {
      title: '教练员姓名',
      dataIndex: 'coachname',
    },
    {
      title: '教练身份证号',
      dataIndex: 'idcard',
    },
    {
      title: '操作时间',
      dataIndex: 'effectiveTime',
    },
    {
      title: '教练员状态',
      dataIndex: 'employstatus',
    },
    {
      title: '驾校分账比例',
      dataIndex: 'schSplitRatio',
    },
    {
      title: '教练分账比例',
      dataIndex: 'coaSplitRatio',
    },
    {
      title: '操作',
      dataIndex: '',
      render: (record: object) => {
        return (
          <>
            <AuthButton
              className="operation-button"
              authId="financial/splitAccount:btn1"
              onClick={() => {
                _showConfirm({
                  handleOk: async () => {
                    const res = await _deleteCoach({ id: _get(record, 'cid', '') });
                    if (_get(res, 'code') === 200) {
                      _refreshTable();
                    }
                  },
                });
              }}
            >
              删除
            </AuthButton>
            <AuthButton
              className="operation-button"
              authId="financial/splitAccount:btn2"
              onClick={() => {
                _switchVisible();
                setCurrentId(_get(record, 'cid', ''));
              }}
            >
              修改记录
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <>
      {visible && <UpdateRecord onCancel={_switchVisible} cid={currentId as string} />}

      {importVisible && <ImportCoach onCancel={_switchImportVisible} />}

      <Search
        filters={[
          {
            type: 'CustomSelectOfCoach',
            field: 'cid',
            placeholder: '教练姓名',
            options: [
              { label: '教练姓名', value: 'coachname' },
              { label: '教练证件', value: 'idcard' },
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        customCoachRequest={_getCoachList}
      />

      <AuthButton
        authId="financial/splitAccount:btn3"
        type="primary"
        className="mb20"
        onClick={() => _switchImportVisible()}
      >
        导入
      </AuthButton>

      <Table columns={columns} {...tableProps} rowKey="cid" />
    </>
  );
}
