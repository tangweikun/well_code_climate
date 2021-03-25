// 车辆信息管理
import React, { useState, useRef } from 'react';
import { _get } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useVisible, useConfirm, useSearch, useHash, useOptions, useRequest } from 'hooks';
import { _getCarList, _deleteCar, _updateStatus, _recordCar, _getResult } from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, TablePro, MoreOperation } from 'components';
import AddModelEdit from './AddModelEdit'; //新增机器人教练车辆绑定

function CarInfo() {
  const [addEditVisible, _switchAddEditVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [modelVisible, _switchModelVisible] = useVisible(); //新增机器人教练车辆绑定编辑框
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [search, _handleSearch] = useSearch();
  const [startBtnLoading, setStartBtnLoading] = useState(false);
  const [stopBtnLoading, setStopBtnLoading] = useState(false);
  const [_showConfirm] = useConfirm();

  const tableRef: any = useRef();

  const platecolorHash = useHash('platecolor_type');
  const registeredExamFlagHash = useHash('registered_flag_type');
  const carStatus = useHash('car_status_type'); // 车辆状态

  const { loading: recordLoading, run: recordRun } = useRequest(_recordCar, {
    onSuccess: () => {
      tableRef.current.refreshTable();
    },
  });

  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteCar, {
    onSuccess: () => {
      tableRef.current.refreshTable();
    },
  });

  const { loading: resultLoading, run: resultRun } = useRequest(_getResult);

  const columns = [
    {
      title: '车牌号码',
      dataIndex: 'licnum',
    },
    {
      title: '车牌颜色',
      dataIndex: 'platecolor',
      render: (platecolor: number): string => platecolorHash[platecolor],
    },
    {
      title: '车辆品牌',
      dataIndex: 'brand',
    },
    {
      title: '车架号',
      dataIndex: 'franum',
    },
    {
      title: '统一编码',
      dataIndex: 'carnum',
    },
    {
      title: '备案状态',
      dataIndex: 'registered_flag',
      render: (registered_flag: any): string => registeredExamFlagHash[registered_flag],
    },
    {
      title: '车辆状态',
      dataIndex: 'status',
      render: (status: any, record: any) => {
        if (status === '5') {
          //禁用
          return (
            <>
              {carStatus[status]}
              <Tooltip title={_get(record, 'forbidtrainmsg', '')}>
                <QuestionCircleOutlined style={{ lineHeight: '30px', marginLeft: '5px', color: '#a2a0a0' }} />
              </Tooltip>
            </>
          );
        }
        return carStatus[status];
      },
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          {/*status 0:'注册' 1:"启用";2:"停用";3:"注销";5:"禁用"; */}
          <AuthButton
            authId="trainingInstitution/carInfo:btn2"
            onClick={() => _handleDetails(record)}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </AuthButton>
          {
            //注册（未备案、备案不同意启用、编辑后待重新备案）、启用、停用显示，但注册（审核中）、注销、禁用不显示
            ((_get(record, 'status', '') === '0' &&
              (_get(record, 'registered_flag') === '0' ||
                _get(record, 'registered_flag') === '3' ||
                _get(record, 'registered_flag') === '4')) ||
              _get(record, 'status', '') === '1' ||
              _get(record, 'status', '') === '2') && (
              <AuthButton
                authId="trainingInstitution/carInfo:btn3"
                onClick={() => _handleEdit(record)}
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
            {_get(record, 'status', '') === '2' && ( //停用状态才显示
              <AuthButton
                loading={_get(currentRecord, 'carid') === _get(record, 'carid') && startBtnLoading}
                authId="trainingInstitution/carInfo:btn4"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={async () => {
                  setCurrentRecord(record);
                  setStartBtnLoading(true);
                  _showConfirm({
                    handleOk: async () => {
                      const res = await _updateStatus(
                        {
                          carid: _get(record, 'carid', ''),
                          status: '1',
                        },
                        { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn4' },
                      );
                      if (_get(res, 'code') === 200) {
                        tableRef.current.refreshTable();
                      }
                    },
                    title: `请确认是否启用车辆${_get(record, 'licnum', '')}`,
                  });
                  setStartBtnLoading(false);
                }}
              >
                启用
              </AuthButton>
            )}

            {_get(record, 'status', '') === '1' && ( //启用状态才显示
              <AuthButton
                loading={_get(currentRecord, 'carid') === _get(record, 'carid') && stopBtnLoading}
                authId="trainingInstitution/carInfo:btn5"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={async () => {
                  setCurrentRecord(record);
                  setStopBtnLoading(true);
                  _showConfirm({
                    handleOk: async () => {
                      const res = await _updateStatus(
                        {
                          carid: _get(record, 'carid', ''),
                          status: '2',
                        },
                        { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn5' },
                      );
                      if (_get(res, 'code') === 200) {
                        tableRef.current.refreshTable();
                      }
                    },
                    title: `请确认是否停用车辆${_get(record, 'licnum', '')}`,
                  });

                  setStopBtnLoading(false);
                }}
              >
                停用
              </AuthButton>
            )}

            {/*registered_flag 0:未备案 4:编辑后待重新备案 */}
            {
              //备案状态为未备案、编辑后待重新备案才显示(车辆状态不是注销、禁用时)
              (_get(record, 'registered_flag') === '0' || _get(record, 'registered_flag') === '4') &&
                _get(record, 'status', '') !== '3' &&
                _get(record, 'status', '') !== '5' && (
                  <AuthButton
                    loading={_get(currentRecord, 'carid') === _get(record, 'carid') && recordLoading}
                    authId="trainingInstitution/carInfo:btn6"
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                    onClick={async () => {
                      setCurrentRecord(record);
                      recordRun({ carid: _get(record, 'carid', '') });
                    }}
                  >
                    备案
                  </AuthButton>
                )
            }
            {
              //注销：注册（未备案、备案不同意启用、编辑后待备案）、启用、停用显示，注册（审核中）、注销、禁用不显示
              ((_get(record, 'status', '') === '0' &&
                (_get(record, 'registered_flag') === '0' ||
                  _get(record, 'registered_flag') === '3' ||
                  _get(record, 'registered_flag') === '4')) ||
                _get(record, 'status', '') === '1' ||
                _get(record, 'status', '') === '2') && (
                <AuthButton
                  loading={_get(currentRecord, 'carid') === _get(record, 'carid') && deleteLoading}
                  authId="trainingInstitution/carInfo:btn7"
                  onClick={() =>
                    _showConfirm({
                      handleOk: async () => {
                        setCurrentRecord(record);
                        deleteRun({ id: _get(record, 'carid', '') });
                      },
                      title: '确定要注销这条数据吗？',
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
            {_get(record, 'registered_flag', '') === '1' && ( //备案状态  2：备案同意启用
              <AuthButton
                loading={_get(currentRecord, 'carid') === _get(record, 'carid') && resultLoading}
                authId="trainingInstitution/carInfo:btn7"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={async () => {
                  setCurrentRecord(record);
                  resultRun({ carid: _get(record, 'carid', '') });
                }}
              >
                获取审核结果
              </AuthButton>
            )}
            <AuthButton
              authId="trainingInstitution/carInfo:btn9"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setCurrentRecord(record);
                _switchModelVisible();
              }}
            >
              {_get(record, 'car_model_id') ? '编辑' : '绑定'}车辆模型
            </AuthButton>
          </MoreOperation>
        </>
      ),
    },
  ];

  function _handleEdit(record: any) {
    _switchAddEditVisible();
    setCurrentRecord(record);
    setIsEdit(true);
  }

  function _handleDetails(record: any) {
    _switchDetailsVisible();
    setCurrentRecord(record);
  }

  function _handleAdd() {
    _switchAddEditVisible();
    setCurrentRecord(null);
    setIsEdit(false);
  }

  function _handleAddOrEditOk() {
    _switchAddEditVisible();
    tableRef.current.refreshTable();
  }

  //绑定车辆模型成功
  function _handleAddCarModelOk() {
    _switchModelVisible();
    tableRef.current.refreshTable();
  }

  return (
    <div>
      {/* 新增/编辑 */}
      {addEditVisible && (
        <AddOrEdit
          onCancel={_switchAddEditVisible}
          onOk={_handleAddOrEditOk}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={isEdit ? '编辑车辆信息' : '新增车辆信息'}
        />
      )}

      {/* 详情 */}
      {detailsVisible && <Details onCancel={_switchDetailsVisible} carid={_get(currentRecord, 'carid', '')} />}
      {/* 绑定车辆 */}
      {modelVisible && (
        <AddModelEdit
          onCancel={_switchModelVisible}
          carid={_get(currentRecord, 'carid', '')}
          carType={_get(currentRecord, 'perdritype', '')}
          carModelId={_get(currentRecord, 'car_model_id', '')}
          onOk={_handleAddCarModelOk}
        />
      )}

      <Search
        filters={[
          { type: 'Input', field: 'licnum', placeholder: '车牌号码' },
          {
            type: 'Select',
            field: 'perdritype',
            options: [{ label: '培训车型(全部)', value: '' }, ...useOptions('business_scope')],
          },
          {
            type: 'Select',
            field: 'registered_flag',
            options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('registered_flag_type')],
          },
          {
            type: 'Select',
            field: 'status',
            options: [{ label: '车辆状态(全部)', value: '' }, ...useOptions('car_status_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          tableRef.current.refreshTable();
        }}
      />

      <AuthButton
        authId="trainingInstitution/carInfo:btn1"
        type="primary"
        onClick={_handleAdd}
        style={{ marginBottom: 20 }}
      >
        新增
      </AuthButton>

      <TablePro
        ref={tableRef}
        rowKey="carid"
        columns={columns}
        request={_getCarList}
        query={{
          licnum: _get(search, 'licnum'),
          perdritype: _get(search, 'perdritype'),
          registered_flag: _get(search, 'registered_flag'),
          status: _get(search, 'status'),
        }}
      />
    </div>
  );
}

export default CarInfo;
