// 教学区域管理
import React, { useState } from 'react';
import { Table, Switch, Modal, message } from 'antd';
import { _get } from 'utils';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useVisible,
  useConfirm,
  useForceUpdate,
  useOptions,
  useHash,
  useRequest,
} from 'hooks';
import {
  _getTeachingArea,
  _deleteTeachingArea,
  _updateState,
  _record,
  _getReviewResult,
  _updatePlacetype,
} from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation } from 'components';
import AddModelEdit from './AddModelEdit';

const { confirm } = Modal;

function TeachingArea() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [robotPlaceId, setRobotPlaceId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [modelVisible, _switchModelVisible] = useVisible(); //新加的模型编辑框
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showConfirm] = useConfirm();
  const [currentRecord, setCurrentRecord] = useState(null);

  const { isLoading, data } = useFetch({
    request: _getTeachingArea,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
      registered_flag: _get(search, 'registered_flag'),
      placetype: _get(search, 'placetype'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const registeredExamFlagHash = useHash('region_registered_type'); // 备案状态
  const teachTypeHash = useHash('teach_type'); // 类型

  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteTeachingArea, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: recordLoading, run: recordRun } = useRequest(_record, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // const { loading: dismissLoading, run: dismissRun } = useRequest(_dismissRecord, {
  //   onSuccess: () => {
  //     setPagination({ ...pagination, current: 1 });
  //     forceUpdate();
  //   },
  // });

  const { loading: getResLoading, run: getResRun } = useRequest(_getReviewResult, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 启用
  const { loading: startBtnLoading, run: startRun } = useRequest(_updateState, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 停用
  const { loading: endBtnLoading, run: endRun } = useRequest(_updateState, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const schRegionStateTypeHash = useHash('sch_region_state_type');
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
      title: '备案状态',
      dataIndex: 'registered_flag',
      render: (registered_flag: any) => registeredExamFlagHash[registered_flag],
    },
    {
      title: '教学区域状态',
      dataIndex: 'state',
      render: (state: any) => schRegionStateTypeHash[state],
    },
    {
      // 1: 使用 0: 禁用；
      title: '训练状态',
      dataIndex: 'placetype',
      render: (placetype: string, record: any) => (
        <Switch
          checked={placetype === '1'}
          onChange={async (checked) => {
            if (_get(record, 'state', '') === '3') {
              message.error('教学区域尚未备案同意启用，不允许训练');
              return;
            }
            confirm({
              title: '信息提示',
              content: checked
                ? '开启训练，发布围栏版本后，将导致该区域下，车辆允许教学，是否继续？'
                : '禁止训练，发布围栏版本后，将导致该区域下，车辆禁止教学，是否继续？',
              async onOk() {
                const res = await _updatePlacetype({ rid: _get(record, 'rid'), placetype: checked ? '1' : '0' });
                if (_get(res, 'code') === 200) {
                  forceUpdate();
                }
              },
              onCancel() {
                return;
              },
              okText: '是',
              cancelText: '否',
            });
          }}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          {/* 0:"停用",1:"启用",2:"注销",3:"注册", */}
          <AuthButton
            authId="trainingInstitution/teachingArea:btn2"
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
          </AuthButton>

          {
            //注册（未备案）显示，但启用、停用、注销不显示
            _get(record, 'registered_flag') === '0' && _get(record, 'state') === '3' && (
              <AuthButton
                authId="trainingInstitution/teachingArea:btn3"
                onClick={() => {
                  _switchVisible();
                  setCurrentId(_get(record, 'rid'));
                  setIsEdit(true);
                }}
                className="operation-button"
                type="primary"
                ghost
                size="small"
              >
                编辑
              </AuthButton>
            )
          }

          <MoreOperation>
            {
              //注册（未备案和备案不同意启用）、启用、停用显示
              ((_get(record, 'state') === '3' &&
                (_get(record, 'registered_flag') === '0' || _get(record, 'registered_flag') === '3')) ||
                _get(record, 'state') === '1' ||
                _get(record, 'state') === '0') &&
                _get(record, 'registered_flag') !== '1' && (
                  <AuthButton
                    loading={_get(currentRecord, 'rid') === _get(record, 'rid') && deleteLoading}
                    authId="trainingInstitution/teachingArea:btn4"
                    onClick={() =>
                      _showConfirm({
                        handleOk: async () => {
                          setCurrentRecord(record);
                          deleteRun({ id: _get(record, 'rid') });
                        },
                        title: '注销后，信息无法恢复，如信息已备案，将删除已有备案信息，是否继续注销？',
                      })
                    }
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    注销
                  </AuthButton>
                )
            }

            {_get(record, 'state', '') === '0' &&
              _get(record, 'registered_flag') !== '1' && ( //停用状态才显示
                <AuthButton
                  loading={_get(currentRecord, 'rid') === _get(record, 'rid') && startBtnLoading}
                  authId="trainingInstitution/carInfo:btn4"
                  className="operation-button"
                  type="primary"
                  ghost
                  size="small"
                  onClick={async () => {
                    setCurrentRecord(record);
                    _showConfirm({
                      handleOk: async () => {
                        startRun({
                          rid: _get(record, 'rid', ''),
                          state: '1', //1:启用
                        });
                      },
                      title: '确认停用该教学区域? ',
                    });
                  }}
                >
                  启用
                </AuthButton>
              )}

            {_get(record, 'state', '') === '1' &&
              _get(record, 'registered_flag') !== '1' && ( //启用状态才显示
                <AuthButton
                  loading={_get(currentRecord, 'rid') === _get(record, 'rid') && endBtnLoading}
                  authId="trainingInstitution/carInfo:btn4"
                  className="operation-button"
                  type="primary"
                  ghost
                  size="small"
                  onClick={async () => {
                    setCurrentRecord(record);
                    _showConfirm({
                      handleOk: async () => {
                        endRun({
                          rid: _get(record, 'rid', ''),
                          state: '0', // 0:"停用"
                        });
                      },
                      title: '停用后，该教学区域不能使用，确认停用吗？',
                    });
                  }}
                >
                  停用
                </AuthButton>
              )}
            {(_get(record, 'registered_flag', '') === '0' || _get(record, 'registered_flag', '') === '4') && ( //未备案\编辑待重新备案才能 显示编辑、 备案按钮，才可操作
              <AuthButton
                loading={_get(currentRecord, 'rid') === _get(record, 'rid') && recordLoading}
                authId="trainingInstitution/teachingArea:btn5"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  setCurrentRecord(record);
                  recordRun({ id: _get(record, 'rid') });
                }}
              >
                备案
              </AuthButton>
            )}
            {_get(record, 'registered_flag', '') === '1' && ( //备案审核中，才显示获取审核结果信息
              <AuthButton
                loading={_get(currentRecord, 'rid') === _get(record, 'rid') && getResLoading}
                authId="trainingInstitution/teachingArea:btn7"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  setCurrentRecord(record);
                  getResRun({ id: _get(record, 'rid') });
                }}
              >
                获取备案结果
              </AuthButton>
            )}
            <AuthButton
              authId="trainingInstitution/teachingArea:btn8"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                _switchModelVisible();
                setCurrentId(_get(record, 'rid'));
                setRobotPlaceId(_get(record, 'robotPlaceId'));
              }}
            >
              {_get(record, 'robotPlaceId') ? '编辑' : '绑定'}场地模型
            </AuthButton>
          </MoreOperation>
        </>
      ),
    },
  ];

  function _handleAdd() {
    setCurrentId(null);
    _switchVisible();
    setIsEdit(false);
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  //绑定地形完成
  function _handlePlaceOK() {
    _switchModelVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <div>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑教学区域' : '新增教学区域'}
        />
      )}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}

      {/* 绑定场地 */}
      {modelVisible && (
        <AddModelEdit
          onCancel={_switchModelVisible}
          currentId={currentId}
          robotPlaceId={robotPlaceId}
          onOk={_handlePlaceOK}
        />
      )}

      <Search
        filters={[
          { type: 'Input', field: 'name', placeholder: '场地名称' },
          {
            type: 'Select',
            field: 'registered_flag',
            options: [{ value: '', label: '备案状态(全部)' }, ...useOptions('region_registered_type')],
          },
          {
            type: 'Select',
            field: 'placetype',
            options: [{ value: '', label: '训练状态(全部)' }, ...useOptions('place_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton
        authId="trainingInstitution/teachingArea:btn1"
        type="primary"
        onClick={_handleAdd}
        style={{ marginBottom: 20 }}
      >
        新增
      </AuthButton>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'rid')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default TeachingArea;
