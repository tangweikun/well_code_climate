// 考核员信息管理
import React, { useState } from 'react';
import { message, Table } from 'antd';
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
import { _getInfo, _record, _logoutPerson, _changeStatus } from './_api';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation } from 'components';
import NoCardSoftWare from '../../student/studentInfo/NoCardSoftWare';
import SetAssessInfo from './SetAssessInfo';
import { _getCoachExamineResult } from 'api';

function AssesserInfo() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [setAssessVisible, _switchSetAssessVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showConfirm] = useConfirm();

  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();

  const { loading: deleteLoading, run: deleteRun } = useRequest(_logoutPerson, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: registerLoading, run: registerRun } = useRequest(_record, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 停教
  const { loading: stopTeachLoading, run: stopTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 在教
  const { loading: startTeachLoading, run: startTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: '2',
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      registeredExamFlag: _get(search, 'registeredExamFlag'),
      employstatusKhy: _get(search, 'employstatusKhy'),
      teachpermitted: _get(search, 'teachpermitted'),
      mobile: _get(search, 'mobile'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const { loading: resultLoading, run: resultRun } = useRequest(_getCoachExamineResult);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
    },
    {
      title: '供职状态',
      dataIndex: 'employstatusKhy',
      render: (employstatusKhy: any) => employStatusHash[employstatusKhy],
    },
    {
      title: '备案状态',
      dataIndex: 'registered_examFlag',
      render: (registered_examFlag: any) => registeredExamFlagHash[registered_examFlag],
    },
    {
      title: '统一编码',
      dataIndex: 'examnum',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        // "00":'注册','01':'在教','02':'停教','05':'注销',
        <>
          <AuthButton
            authId="coach/assesserInfo:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'cid'));
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </AuthButton>
          {_get(record, 'employstatusKhy') !== '05' && _get(record, 'registered_examFlag') !== '1' && (
            <AuthButton
              authId="coach/assesserInfo:btn2"
              onClick={() => {
                if (_get(record, 'isexaminer_exam') === '1' || _get(record, 'isexaminer_train') === '1') {
                  // isexaminer_exam:默认结业考核员(0-否 1-是) isexaminer_train:默认培训考核员(0-否 1-是)
                  _showConfirm({
                    title: '编辑可能会影响考核员设置，确定编辑吗？',
                    handleOk: () => {
                      _switchVisible();
                      setCurrentId(_get(record, 'cid'));
                      setIsEdit(true);
                    },
                  });
                  return;
                } else {
                  _switchVisible();
                  setCurrentId(_get(record, 'cid'));
                  setIsEdit(true);
                }
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              编辑
            </AuthButton>
          )}

          <MoreOperation>
            {_get(record, 'employstatusKhy') !== '05' && _get(record, 'registered_examFlag') !== '1' && (
              <AuthButton
                loading={_get(currentRecord, 'cid') === _get(record, 'cid') && deleteLoading}
                authId="coach/assesserInfo:btn3"
                onClick={() => {
                  if (_get(record, 'isexaminer_exam') === '1' || _get(record, 'isexaminer_train') === '1') {
                    // isexaminer_exam:默认结业考核员(0-否 1-是) isexaminer_train:默认培训考核员(0-否 1-是)
                    message.error('该考核员为默认考核员，请先取消该考核员设置再注销');
                    return;
                  }
                  _showConfirm({
                    title: '注销后，将不可操作该信息，如已备案，将删除已有备案信息，是否继续注销',
                    handleOk: () => {
                      setCurrentRecord(record);
                      deleteRun({ cid: _get(record, 'cid'), type: '2' });
                    },
                  });
                }}
                className="operation-button"
                type="primary"
                ghost
                size="small"
              >
                注销
              </AuthButton>
            )}
            {/* registered_examFlag：4 编辑后待重新备案 */}
            {(_get(record, 'registered_examFlag') === '0' || _get(record, 'registered_examFlag') === '4') &&
              _get(record, 'employstatusKhy') !== '05' && (
                <AuthButton
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && registerLoading}
                  authId="coach/assesserInfo:btn4"
                  className="operation-button"
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => {
                    setCurrentRecord(record);
                    registerRun({ id: _get(record, 'cid'), type: '2' });
                  }}
                >
                  备案
                </AuthButton>
              )}

            {/* // "00":'注册','01':'在教','02':'停教','05':'注销', */}
            {_get(record, 'employstatusKhy') === '02' && (
              <AuthButton
                authId="coach/assesserInfo:btn7"
                loading={_get(currentRecord, 'cid') === _get(record, 'cid') && startTeachLoading}
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  // '02':'停教'
                  if (_get(record, 'employstatusKhy') === '02') {
                    setCurrentRecord(record);
                    startTeachRun(
                      { cid: _get(record, 'cid'), status: '01', type: '2' },
                      { menuId: 'coachInfo', elementId: 'coach/assesserInfo:btn7' },
                    );
                  }
                }}
              >
                在教
              </AuthButton>
            )}

            {_get(record, 'employstatusKhy') === '01' && (
              <AuthButton
                loading={_get(currentRecord, 'cid') === _get(record, 'cid') && stopTeachLoading}
                authId="coach/assesserInfo:btn8"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  if (_get(record, 'isexaminer_exam') === '1' || _get(record, 'isexaminer_train') === '1') {
                    // isexaminer_exam:默认结业考核员(0-否 1-是) isexaminer_train:默认培训考核员(0-否 1-是)
                    _showConfirm({
                      title: '该考核员为默认考核员，停教后默认考核员将为空，确定停教吗？',
                      handleOk: () => {
                        setCurrentRecord(record);
                        stopTeachRun(
                          { cid: _get(record, 'cid'), status: '02', type: '2' },
                          { menuId: 'coachInfo', elementId: 'coach/assesserInfo:btn8' },
                        );
                      },
                    });
                    return;
                  } else {
                    setCurrentRecord(record);
                    stopTeachRun(
                      { cid: _get(record, 'cid'), status: '02', type: '2' },
                      { menuId: 'coachInfo', elementId: 'coach/assesserInfo:btn8' },
                    );
                  }
                }}
              >
                停教
              </AuthButton>
            )}
            {_get(record, 'registered_examFlag', '') === '1' && ( //备案审核中才显示
              <AuthButton
                loading={_get(currentRecord, 'cid') === _get(record, 'cid') && resultLoading}
                authId="coach/assesserInfo:btn10"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={async () => {
                  setCurrentRecord(record);
                  resultRun({ id: _get(record, 'cid', ''), type: 2 }); ////人员类型1:教练员2：考核员3：安全员
                }}
              >
                获取审核结果
              </AuthButton>
            )}
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

  return (
    <div>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑考核员' : '新增考核员'}
        />
      )}

      {setAssessVisible && (
        <SetAssessInfo
          onCancel={_switchSetAssessVisible}
          onOk={() => {
            _switchSetAssessVisible();
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      <Search
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '考核员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'registeredExamFlag',
            options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('registered_flag_type')],
          }, //备案状态
          {
            type: 'Select',
            field: 'employstatusKhy',
            options: [{ label: '供职状态(全部)', value: '' }, ...useOptions('coa_master_status')],
          },
          {
            type: 'Select',
            field: 'teachpermitted',
            options: [{ value: '', label: '准教车型(全部)' }, ...useOptions('trans_car_type')],
          },
          { type: 'Input', field: 'mobile', placeholder: '联系方式' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton
        style={{ margin: '0 20px 20px 0' }}
        authId="coach/assesserInfo:btn6"
        type="primary"
        onClick={_handleAdd}
      >
        新增
      </AuthButton>

      <AuthButton
        authId="coach/assesserInfo:btn9"
        type="primary"
        onClick={_switchSetAssessVisible}
        style={{ marginBottom: 20 }}
      >
        考核员设置
      </AuthButton>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default AssesserInfo;
