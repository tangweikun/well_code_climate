// 角色管理
import React, { useState } from 'react';
import { _get } from 'utils';
import { Table, Button, Input } from 'antd';
import { useFetch, usePagination, useForceUpdate, useDeleteConfirm, useVisible, useRequest } from 'hooks';
import { _getRoleList, _deleteRole } from './_api';
import { PlusOutlined } from '@ant-design/icons';
import Add from './Add';
import User from './User';
import BindUser from './BindUser';
import AllocateResources from './AllocateResources';
import { AuthButton } from 'components';
import TreeOrg from '../organizationManage/TreeOrg';
import LinkUser from '../organizationManage/LinkUser';
import AddOrEditOrg from '../organizationManage/Add';

export default function RoleManage() {
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [pagination, setPagination] = usePagination();
  const [visible, _switchVisible] = useVisible();
  const [userVisible, _switchUserVisible] = useVisible();
  const [bindUserVisible, _switchBindUserVisible] = useVisible();
  const [allocateResourcesVisible, _switchAllocateResourceVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [ignore2, forceUpdateTable] = useForceUpdate();
  const [_showDeleteConfirm] = useDeleteConfirm();
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [linkUserVisible, _switchLinkUserVisible] = useVisible();
  const [addOrgVisible, _setAddOrgVisible] = useVisible();
  const [isOrgEdit, setIsOrgEdit] = useState(false);

  const { loading: deleteLoading, run } = useRequest(_deleteRole, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  function _handleDelete(record) {
    _showDeleteConfirm({
      handleOk: async () => {
        setCurrentRecord(record);
        run({ id: record.id });
      },
    });
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleQueryUser(id) {
    setRoleId(id);
    _switchUserVisible();
  }

  function _handleBindUser(id) {
    setRoleId(id);
    _switchBindUserVisible();
  }

  function _handleAllocateResources(id) {
    setRoleId(id);
    _switchAllocateResourceVisible();
  }

  function _handleEdit(record) {
    setCurrentRecord(record);
    setIsEdit(true);
    _switchVisible();
  }

  function _handleAdd() {
    setIsEdit(false);
    setCurrentRecord(null);
    _switchVisible();
  }
  function _handleLinkUserOk() {
    _switchLinkUserVisible();
    forceUpdateTable();
    setPagination({ ...pagination, current: 1 });
  }
  function _changeName(e) {
    setName(e.target.value);
    setPagination({ ...pagination, current: 1 });
  }
  function _handleAddOrgOk() {
    _setAddOrgVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  const { data, isLoading } = useFetch({
    request: _getRoleList,
    query: {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      name,
      orgId: selectedId,
    },
    depends: [selectedId, ignore, pagination.current, pagination.pageSize, ignore2],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 1) });
    },
  });

  const dataSource = _get(data, 'rows', []);
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_, record) => (
        <div>
          {!_get(record, 'isSuper', false) && (
            <AuthButton //超管不可以分配资源、编辑、删除
              authId="userCenter/roleManage:btn2"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleAllocateResources(_get(record, 'id'))}
            >
              权限设置
            </AuthButton>
          )}

          <AuthButton
            authId="userCenter/roleManage:btn3"
            type="primary"
            ghost
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={() => _handleBindUser(_get(record, 'id'))}
          >
            关联用户
          </AuthButton>
          <AuthButton
            authId="userCenter/roleManage:btn4"
            type="primary"
            ghost
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={() => _handleQueryUser(_get(record, 'id'))}
          >
            查看用户
          </AuthButton>
          {!_get(record, 'isSuper', false) && ( //超管不可以分配资源、编辑、删除
            <AuthButton
              authId="userCenter/roleManage:btn5"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleEdit(record)}
            >
              编辑
            </AuthButton>
          )}
          {!_get(record, 'isSuper', false) && ( //超管不可以分配资源、编辑、删除
            <AuthButton
              loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
              authId="userCenter/roleManage:btn6"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleDelete(record)}
            >
              删除
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {visible && (
        <Add
          currentRecord={currentRecord}
          onCancel={_switchVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑角色信息' : '新增角色信息'}
        />
      )}

      {allocateResourcesVisible && (
        <AllocateResources id={roleId} title="配置权限" onCancel={_switchAllocateResourceVisible} />
      )}

      {userVisible && <User onCancel={_switchUserVisible} id={roleId} title="查看用户" />}

      {bindUserVisible && <BindUser onCancel={_switchBindUserVisible} id={roleId} title="关联用户" />}
      {linkUserVisible && (
        <LinkUser
          currentRecord={currentRecord}
          onCancel={_switchLinkUserVisible}
          onOk={_handleLinkUserOk}
          visible={visible}
          isEdit={isEdit}
          title="关联用户"
        />
      )}
      {addOrgVisible && (
        <AddOrEditOrg
          currentRecord={currentRecord}
          selectedId={selectedId}
          onCancel={_setAddOrgVisible}
          onOk={_handleAddOrgOk}
          visible={addOrgVisible}
          isEdit={isOrgEdit}
          title={isOrgEdit ? '编辑' : '新增子组织'}
        />
      )}

      <div style={{ display: 'flex' }}>
        <div style={{ width: 460, minWidth: 460, marginRight: 10 }}>
          <TreeOrg
            onSelect={(selected) => {
              _get(selected, '0') && setSelectedId(_get(selected, '0'));
            }}
            treeData={treeData}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            setSelectedId={setSelectedId}
            setTreeData={setTreeData}
            setIsEdit={setIsOrgEdit}
            _switchVisible={_setAddOrgVisible}
            ignore={ignore}
            forceUpdate={forceUpdate}
          />
        </div>
        <div style={{ flex: 1 }}>
          <AuthButton
            authId="userCenter/roleManage:btn1"
            style={{ marginBottom: 20 }}
            type="primary"
            icon={<PlusOutlined />}
            onClick={_handleAdd}
          >
            新增
          </AuthButton>
          <div>
            <Input onChange={_changeName} value={name} placeholder="角色名称" style={{ margin: '0 20px 20px 0' }} />
            <Button
              type="primary"
              onClick={() => {
                forceUpdate();
                setPagination({ ...pagination, total: _get(data, 'total', 1) });
              }}
            >
              查询
            </Button>
          </div>

          <Table
            columns={columns}
            bordered
            dataSource={dataSource}
            loading={isLoading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              ...pagination,
              onShowSizeChange: (_, pageSize) => {
                setPagination({ ...pagination, current: 1, pageSize });
              },
              onChange: (page) => {
                setPagination((pagination) => ({ ...pagination, current: page }));
              },
            }}
          />
        </div>
      </div>
    </>
  );
}
