import React, { useState, useContext } from 'react';
import { isEmpty } from 'lodash';
import { message, Modal, Table, Button } from 'antd';
import { _getSchoolList, _changeSchool } from './_api';
import { _getUserInfo } from '../_api';
import { useFetch, useSearch, useHash, useTablePagination, useForceUpdate } from 'hooks';
import { Search } from 'components';
import IMG_ALT from 'statics/images/imgAlt.png';
import { Auth, handleLogout, _get } from 'utils';
import GlobalContext from 'globalContext';
import { PopoverImg } from 'components';

export default function Edit(props) {
  const { title, onOk, onCancel } = props;
  const { $setSchoolId, $setRolesIds, $setCompanyId, $setSchoolName } = useContext(GlobalContext);
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [changeLoading, setChangeLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const companyBusiStatusHash = useHash('company_busi_status'); // 营业状态
  const { data = [], isLoading } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
    },
    request: _getSchoolList,
    depends: [pagination.current, pagination.pageSize, ignore],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const columns = [
    {
      title: '驾校照片',
      dataIndex: 'headImg',
      render: (headImg, record) => {
        if (!headImg) {
          return <PopoverImg src={IMG_ALT} />;
        }
        return <PopoverImg src={headImg} imgStyle={{ margin: '0 20px 20px 0' }} />;
      },
    },
    {
      title: '驾校名称',
      dataIndex: 'name',
    },
    {
      title: '经营状态',
      dataIndex: 'busiStatus',
      render: (busiStatus) => companyBusiStatusHash[busiStatus],
    },
    {
      title: '经营车型',
      dataIndex: 'busiScope',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <Button
            loading={_get(currentRecord, 'id') === _get(record, 'id') && changeLoading}
            onClick={async () => {
              setCurrentRecord(record);
              if (_get(record, 'busiStatus', '') === '0') {
                //营业中
                setChangeLoading(true);
                const res = await _changeSchool({ id: _get(record, 'id', '') });
                if (_get(res, 'code') === 200) {
                  const info = await _getUserInfo();

                  if (_get(info, 'code') === 200) {
                    let data = _get(info, 'data', {});
                    // 如果菜单列表为空，则强制用户登出
                    if (isEmpty(_get(data, 'menus'))) {
                      handleLogout();
                    }
                    const rolesIds = _get(data, 'companyRoles', [])
                      .map((x) => x.id)
                      .join(',');
                    Auth.set('schoolId', _get(data, 'companyId'));
                    $setSchoolId(_get(data, 'companyId'));
                    Auth.set('companyId', _get(data, 'companyId'));
                    $setCompanyId(_get(data, 'companyId'));
                    Auth.set('rolesIds', rolesIds);
                    $setRolesIds(rolesIds);
                    Auth.set('schoolName', _get(data, 'companyName'));
                    $setSchoolName(_get(data, 'companyName'));
                    window.location.reload();
                  }
                }
                setChangeLoading(false);
              } else {
                message.info('只有营业中的驾校才可进行切换');
              }
            }}
            type="primary"
            ghost
            size="small"
          >
            切换驾校
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      width={800}
      maskClosable={false}
      title={title}
      visible
      onOk={() => {
        onOk();
      }}
      footer={null}
      onCancel={onCancel}
    >
      <Search
        filters={[{ type: 'Input', field: 'name', placeholder: '请输入驾校简称' }]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={forceUpdate}
      />
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="id"
        pagination={tablePagination}
      />
    </Modal>
  );
}
