// 教练信息管理
import React, { useState } from 'react';
import {
  useOptions,
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useVisible,
  useConfirm,
  useHash,
  useRequest,
} from 'hooks';
import { _getInfo, _logoutPerson, _record, _changeStatus, _updateCoaIdauth } from './_api';
import { Table, message } from 'antd';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation } from 'components';
import { getIdCardId, getIdCardInfo, _get } from 'utils';
import BindIdCard from './BindIdCard';
import NoCardSoftWare from '../../student/studentInfo/NoCardSoftWare';
import { _getCoachExamineResult } from 'api';
import NoVerify from './NoVerify';
import moment from 'moment';
import { UpdatePlugin } from 'components';
import { isForceUpdatePlugin } from 'utils';

export default function CoachInfo() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [_showConfirm] = useConfirm();
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();

  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const coachtypeHash = useHash('coach_type'); // 教练类型

  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();
  const [idCardId, setIdCardId] = useState(); //身份证物理卡号
  const [certNum, setCertNum] = useState(); //身份证号
  const [bindIdCardVisible, setBindIdCardVisible] = useVisible();
  const [loading, setLoading] = useState(false);
  const [noVerifyVisible, setNoVerifyVisible] = useVisible();

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

  const { loading: resultLoading, run: resultRun } = useRequest(_getCoachExamineResult);

  async function bindCard() {
    setBindIdCardVisible();
    setLoading(true);

    const update: any = await isForceUpdatePlugin();
    if (update) {
      setLoading(false);
      return setUpdatePluginVisible();
    }
    const certNumRes = await getIdCardInfo();
    const cardNoRes = await getIdCardId();
    setLoading(false);
    if (_get(cardNoRes, 'result') === false || _get(certNumRes, 'result') === false) {
      return setNoSoftWareVisible();
    }
    setIdCardId(_get(cardNoRes, 'cardNo', ''));
    setCertNum(_get(certNumRes, 'idNo', ''));
    if (!_get(cardNoRes, 'cardNo', '') || !_get(certNumRes, 'idNo', '')) {
      message.info('未检测到身份证');
      return;
    }
  }

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
      title: '准教车型',
      dataIndex: 'teachpermitted',
    },
    {
      title: '教练员类型',
      dataIndex: 'coachtype',
      render: (coachtype: any) => coachtypeHash[coachtype],
    },
    {
      title: '供职状态',
      dataIndex: 'employstatus',
      render: (employstatus: any) => employStatusHash[employstatus],
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: any) => registeredExamFlagHash[registered_Flag],
    },
    {
      title: '统一编码',
      dataIndex: 'coachnum',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        const idauthcloseddeadline = _get(record, 'idauthcloseddeadline');
        const isExpire = idauthcloseddeadline
          ? moment(moment().format('YYYY-MM-DD')).diff(moment(idauthcloseddeadline)) > 0
          : true;
        return (
          // "00":'注册','01':'在教','02':'停教','05':'注销',
          <>
            <AuthButton
              authId="coach/coachInfo:btn1"
              onClick={() => {
                _switchDetailsVisible();
                setCurrentId(_get(record, 'cid'));
              }}
              className="operation-button"
            >
              详情
            </AuthButton>
            {/* 05注销 */}
            {_get(record, 'employstatus') !== '05' && _get(record, 'registered_Flag') !== '1' && (
              <AuthButton
                authId="coach/coachInfo:btn2"
                onClick={() => {
                  _switchVisible();
                  setCurrentId(_get(record, 'cid'));
                  setIsEdit(true);
                }}
                className="operation-button"
              >
                编辑
              </AuthButton>
            )}
            <MoreOperation>
              {_get(record, 'employstatus') !== '05' && _get(record, 'registered_Flag') !== '1' && (
                <AuthButton
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && deleteLoading}
                  authId="coach/coachInfo:btn3"
                  onClick={() =>
                    _showConfirm({
                      title: '注销后，将不可操作该信息，如已备案，将删除已有备案信息，是否继续注销',
                      handleOk: async () => {
                        setCurrentRecord(record);
                        deleteRun({ cid: _get(record, 'cid'), type: '1' });
                      },
                    })
                  }
                  className="operation-button"
                >
                  注销
                </AuthButton>
              )}
              {/* 备案标记-  0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案 */}
              {(_get(record, 'registered_Flag') === '0' || _get(record, 'registered_Flag') === '4') &&
                _get(record, 'employstatus') !== '05' && (
                  <AuthButton
                    loading={_get(currentRecord, 'cid') === _get(record, 'cid') && registerLoading}
                    authId="coach/coachInfo:btn4"
                    className="operation-button"
                    onClick={async () => {
                      setCurrentRecord(record);
                      registerRun({ id: _get(record, 'cid'), type: '1' });
                    }}
                  >
                    备案
                  </AuthButton>
                )}
              {((_get(record, 'employstatus') === '00' && _get(record, 'registered_Flag') !== '3') ||
                _get(record, 'employstatus') === '01') && (
                <AuthButton
                  authId="coach/coachInfo:btn5"
                  onClick={async () => {
                    setCurrentId(_get(record, 'cid'));
                    setCurrentRecord(record);
                    bindCard();
                  }}
                  className="operation-button"
                >
                  绑定二代证
                </AuthButton>
              )}
              {/* // "00":'注册','01':'在教','02':'停教','05':'注销', */}
              {_get(record, 'employstatus') === '02' && (
                <AuthButton
                  authId="coach/coachInfo:btn7"
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && startTeachLoading}
                  className="operation-button"
                  onClick={() => {
                    // '02':'停教'
                    if (_get(record, 'employstatus') === '02') {
                      _showConfirm({
                        title: '是否要恢复该教练为在教？',
                        handleOk: async () => {
                          setCurrentRecord(record);
                          startTeachRun(
                            { cid: _get(record, 'cid'), status: '01', type: '1' },
                            { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn7' },
                          );
                        },
                      });
                    }
                  }}
                >
                  在教
                </AuthButton>
              )}
              {_get(record, 'employstatus') === '01' && (
                <AuthButton
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && stopTeachLoading}
                  authId="coach/coachInfo:btn8"
                  className="operation-button"
                  onClick={() =>
                    _showConfirm({
                      title: '停教后，教练不能签到，确认停教吗',
                      handleOk: async () => {
                        setCurrentRecord(record);
                        stopTeachRun(
                          { cid: _get(record, 'cid'), status: '02', type: '1' },
                          { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn8' },
                        );
                      },
                    })
                  }
                >
                  停教
                </AuthButton>
              )}

              {_get(record, 'registered_Flag', '') === '1' && ( //备案审核中才显示
                <AuthButton
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && resultLoading}
                  authId="coach/coachInfo:btn9"
                  className="operation-button"
                  onClick={async () => {
                    setCurrentRecord(record);
                    resultRun({ id: _get(record, 'cid', ''), type: 1 });
                  }}
                >
                  获取审核结果
                </AuthButton>
              )}
              {(isExpire || _get(record, 'idauthclosed', '') !== '1') && ( //判断免签日期过期则显示免签；身份认证关闭标志(免签)  0-开启, 1-关闭
                <AuthButton
                  authId="coach/coachInfo:btn10"
                  className="operation-button"
                  onClick={() => {
                    setCurrentId(_get(record, 'cid'));
                    setNoVerifyVisible();
                  }}
                >
                  免签
                </AuthButton>
              )}
              {!isExpire &&
                _get(record, 'idauthclosed', '') === '1' && ( //身份认证关闭标志(免签)  0-开启, 1-关闭
                  <AuthButton
                    authId="coach/coachInfo:btn11"
                    loading={_get(currentRecord, 'cid') === _get(record, 'cid') && cancelLoading}
                    className="operation-button"
                    onClick={() => {
                      setCurrentId(_get(record, 'cid'));
                      cancelRun({ cid: currentId, idauthclosed: '0' });
                    }}
                  >
                    取消免签
                  </AuthButton>
                )}
            </MoreOperation>
          </>
        );
      },
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: '1',
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      registeredFlag: _get(search, 'registeredFlag'),
      employstatus: _get(search, 'employstatus'),
      teachpermitted: _get(search, 'teachpermitted'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleAdd() {
    setCurrentId(null);
    _switchVisible();
    setIsEdit(false);
  }

  const { loading: cancelLoading, run: cancelRun } = useRequest(_updateCoaIdauth, {
    onSuccess: forceUpdate,
  });

  return (
    <>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentId={currentId} />}

      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑教练' : '新增教练'}
        />
      )}
      {noVerifyVisible && (
        <NoVerify
          onCancel={setNoVerifyVisible}
          onOk={() => {
            setNoVerifyVisible();
            forceUpdate();
          }}
          currentId={currentId}
        />
      )}
      <Search
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'registeredFlag',
            options: [{ value: '', label: '备案状态(全部)' }, ...useOptions('registered_flag_type')],
          }, //备案状态
          {
            type: 'Select',
            field: 'employstatus',
            options: [{ value: '', label: '供职状态(全部)' }, ...useOptions('coa_master_status')],
          }, //供职状态
          {
            type: 'Select',
            field: 'teachpermitted',
            options: [{ value: '', label: '准教车型(全部)' }, ...useOptions('trans_car_type')],
          }, //准教车型
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <AuthButton authId="coach/coachInfo:btn6" type="primary" onClick={_handleAdd} className="mb20">
        新增
      </AuthButton>
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行绑定身份证" />}
      {bindIdCardVisible && (
        <BindIdCard
          onCancel={setBindIdCardVisible}
          onOk={() => {
            setBindIdCardVisible();
            forceUpdate();
          }}
          currentId={currentId}
          currentRecord={currentRecord}
          idCardId={idCardId}
          certNum={certNum}
          setNoSoftWareVisible={setNoSoftWareVisible}
          loading={loading}
          type="1"
        />
      )}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </>
  );
}
