/* eslint-disable react-hooks/exhaustive-deps */
// 学员信息管理
import React, { useState, useContext, useEffect } from 'react';
import {
  _getStudentInfo,
  _deleteStudent,
  _getClassList,
  _registered,
  _transformCarType,
  _previewContractFile,
  isFreezingModeStudent,
  showNetworkTimeButton,
  getKeyInfos,
  getReginfos,
  _export,
  _exportStudentBefore,
  _openAccount,
  _updateStuIdauth,
} from './_api';
import AddOrEdit from './AddOrEdit';
import Transfer from './Transfer';
import {
  useOptions,
  useHash,
  useSearch,
  useForceUpdate,
  useFetch,
  useTablePagination,
  useVisible,
  useConfirm,
  useRequest,
  usePrevious,
} from 'hooks';
import Details from './Details';
import { AuthButton, Search, MoreOperation } from 'components';
import { message, Table } from 'antd';
import GenerateContract from './GenerateContract';
import { getIdCardId, getIdCardInfo, downloadFile, _get } from 'utils';
import BindIdCard from './BindIdCard';
import NoCardSoftWare from './NoCardSoftWare';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import GlobalContext from 'globalContext';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';
import moment from 'moment';
import { DownloadOutlined } from '@ant-design/icons';
import Recharge from './Recharge';
import NoVerify from './NoVerify';
import { UpdatePlugin } from 'components';
import { isForceUpdatePlugin } from 'utils';

function StudentInfo() {
  const history = useHistory();
  const [search, _handleSearch] = useSearch();
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [currentRecord, setCurrentRecord] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [transferVisible, _switchTransferVisible] = useVisible();
  const [_showConfirm] = useConfirm();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [generateVisible, _setGenerateVisible] = useVisible();
  const [title, setTitle] = useState('');
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();
  const [isFrozenStudent, setIsFrozenStudent] = useState(false); //是否是一次性冻结、预约冻结的学员
  const [showBtn, setShowBtn] = useState(false); //是否显示获取远程教育学时按钮
  const [idCard, setIdCard] = useState('');
  const [reChargeVisible, setReChargeVisible] = useVisible();
  const [noVerifyVisible, setNoVerifyVisible] = useVisible();
  const [info, setInfo] = useState('');

  // TODO:使用合适的Type替代any
  const { $companyId } = useContext(GlobalContext);
  const pre$CompanyId = usePrevious($companyId);

  // TODO:寻找更合适的处理方案
  useEffect(() => {
    pre$CompanyId === null &&
      $companyId &&
      setTimeout(() => {
        history.replace(`${PUBLIC_URL}`);
      }, 100);
  }, [$companyId]);

  // 学员列表
  const { isLoading, data } = useFetch({
    request: _getStudentInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
      idcard: _get(search, 'idcard'),
      traintype: _get(search, 'traintype'),
      package_id: _get(search, 'package_id'),
      busitype: _get(search, 'busitype'),
      contractflag: _get(search, 'contractflag'),
      registered_Flag: _get(search, 'registered_Flag'),
      status: _get(search, 'status'),
      applydatebegin: _get(search, 'applydatebegin'),
      applydateend: _get(search, 'applydateend'),
    },
    depends: [ignore, pagination.current, pagination.pageSize, idCard, $companyId],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  // 班级数据
  const { data: classList } = useFetch({
    request: _getClassList,
    query: {
      page: 1,
      limit: 100,
    },
    depends: [$companyId],
  });

  const effectiveClass = _get(classList, 'rows', []).filter((x: any) => x.status_cd === '2');
  const classOptions = effectiveClass.map((x: any) => {
    return { label: x.packlabel, value: x.packid };
  });

  const businessTypeHash = useHash('businessType'); // 业务类型
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const contractflagHash = useHash('stu_contract_status'); // 合同签订状态
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 学员备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码
  const [idCardId, setIdCardId] = useState(); //身份证物理卡号
  const [certNum, setCertNum] = useState(); //身份证号
  const [bindIdCardVisible, setBindIdCardVisible] = useVisible();
  const [loading, setLoading] = useState(false);
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();

  async function bindCard() {
    setBindIdCardVisible();
    setLoading(true);
    const update: any = await isForceUpdatePlugin();
    if (update) {
      setLoading(false);
      setInfo('无法进行绑定二代证');
      return setUpdatePluginVisible();
    }
    const cardNoRes = await getIdCardId();
    const certNumRes = await getIdCardInfo();
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

  // 备案
  const { loading: recordLoading, run: recordRun } = useRequest(_registered, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // C1转C2
  const { loading: transLoading, run: transRun } = useRequest(_transformCarType, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  //开户
  const { loading: openAccountLoading, run: openAccountRun } = useRequest(_openAccount, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  //是否是一次性冻结、预约冻结的学员
  const getIsFrozenStudent = async (id: any) => {
    const res = await isFreezingModeStudent({ sid: id });
    setIsFrozenStudent(_get(res, 'data', false));
  };

  //是否显示获取远程教育学时按钮
  const showDistanceLearnBtn = async () => {
    const res = await showNetworkTimeButton();
    setShowBtn(_get(res, 'data', false));
  };

  const { data: keyInfos = [] } = useFetch({
    request: getKeyInfos,
  });

  const { data: regInfos = [] } = useFetch({
    request: getReginfos,
  });

  // 取消免签
  const { loading: cancelLoading, run: cancelRun } = useRequest(_updateStuIdauth, {
    onSuccess: forceUpdate,
  });

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      render: (busitype: any) => businessTypeHash[busitype],
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
    },
    {
      title: '报名日期',
      dataIndex: 'applydate',
    },
    {
      title: '学员班级',
      dataIndex: 'package_name',
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      render: (status: any) => stuStatusHash[status],
    },
    {
      title: '合同签订状态',
      dataIndex: 'contractflag',
      render: (contractflag: any, record: any) => {
        if (contractflag === '0') {
          return contractflagHash[contractflag];
        } else {
          return (
            <div
              style={{ color: PRIMARY_COLOR }}
              className="pointer"
              onClick={() => {
                _previewContractFile({
                  sid: _get(record, 'sid'),
                }).then((res) => {
                  window.open(_get(res, 'data'));
                });
              }}
            >
              {contractflagHash[contractflag]}
            </div>
          );
        }
      },
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: any) => recordStatusTypeHash[registered_Flag],
    },
    {
      title: '统一编码',
      dataIndex: 'registered_NationalFlag',
      render: (registered_NationalFlag: any) => registeredNationalFlagHash[registered_NationalFlag],
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
          // 00：'报名',01：'学驾中',02：'退学',03：'结业',04：'注销',
          <>
            <AuthButton
              authId="student/studentInfo:btn2"
              onClick={() => {
                getIsFrozenStudent(_get(record, 'sid', ''));
                showDistanceLearnBtn();
                _switchDetailsVisible();
                setCurrentRecord(record);
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              详情
            </AuthButton>
            {(_get(record, 'status') === '00' || _get(record, 'status') === '01') && (
              <AuthButton
                authId="student/studentInfo:btn3"
                onClick={() => {
                  _switchVisible();
                  setCurrentRecord(record);
                  setIsEdit(true);
                }}
                className="operation-button"
                type="primary"
                ghost
                size="small"
              >
                编辑
              </AuthButton>
            )}

            <MoreOperation moreButtonName="合同">
              {/* 合同签订状态为：未生成：0 。 展示生成合同.已上传合同不能上传合同 */}
              {_get(record, 'contractflag') === '0' &&
                (_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                (_get(record, 'registered_Flag') === '0' || _get(record, 'registered_Flag') === '2') && (
                  <AuthButton
                    authId="student/studentInfo:btn5"
                    onClick={() => {
                      _setGenerateVisible();
                      setCurrentRecord(record);
                      setTitle('生成合同');
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    生成合同
                  </AuthButton>
                )}
              {/* 合同签订状态为：未签订：1，已签订2 。 展示重新生成合同。已上传合同不能上传合同 */}
              {(_get(record, 'contractflag') === '1' || _get(record, 'contractflag') === '3') &&
                (_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                (_get(record, 'registered_Flag') === '0' || _get(record, 'registered_Flag') === '2') && (
                  <AuthButton
                    authId="student/studentInfo:btn5"
                    onClick={() => {
                      _setGenerateVisible();
                      setCurrentRecord(record);
                      setTitle('重新生成合同');
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    重新生成合同
                  </AuthButton>
                )}
            </MoreOperation>

            <MoreOperation moreButtonName="资金账户">
              {/* status 报名，1学驾驶中 ，bankaccountflag：0 未开户,stuchargemode: 1-托管一次性 缴费  2-托管分批缴费*/}
              {(_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                _get(record, 'bankaccountflag') === '0' &&
                (_get(record, 'stuchargemode') === '1' || _get(record, 'stuchargemode') === '2') && (
                  <AuthButton
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && openAccountLoading}
                    authId="student/studentInfo:btn12"
                    onClick={() => {
                      _showConfirm({
                        title: '您将为学员创建资金账户，是否继续？',
                        handleOk: async () => {
                          openAccountRun({ sid: _get(record, 'sid', '') });
                        },
                      });
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    开户
                  </AuthButton>
                )}
              {/* statu：0 报名，1学驾驶中 ，bankaccountflag：1未开户,stuchargemode:2托管分批缴费*/}
              {(_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                _get(record, 'bankaccountflag') === '1' &&
                _get(record, 'stuchargemode') === '2' && (
                  <AuthButton
                    authId="student/studentInfo:btn13"
                    onClick={() => {
                      setCurrentRecord(record);
                      setReChargeVisible();
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    充值
                  </AuthButton>
                )}
            </MoreOperation>

            <MoreOperation>
              {_get(record, 'status') === '00' && (
                <AuthButton
                  authId="student/studentInfo:btn4"
                  onClick={() =>
                    _showConfirm({
                      handleOk: async () => {
                        const res = await _deleteStudent({ id: _get(record, 'sid') });
                        if (_get(res, 'code') === 200) {
                          setPagination({ ...pagination, current: 1 });
                          forceUpdate();
                        }
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
              )}

              {(_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                _get(record, 'registered_Flag') !== '1' && (
                  <AuthButton
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && recordLoading}
                    authId="student/studentInfo:btn6"
                    onClick={async () => {
                      setCurrentRecord(record);
                      recordRun({ id: _get(record, 'sid') });
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    备案
                  </AuthButton>
                )}

              {_get(record, 'status') === '01' && _get(record, 'registered_Flag') === '1' && (
                <AuthButton
                  authId="student/studentInfo:btn7"
                  onClick={async () => {
                    setCurrentRecord(record);
                    bindCard();
                  }}
                  className="operation-button"
                  type="primary"
                  ghost
                  size="small"
                >
                  绑定二代证
                </AuthButton>
              )}

              {/* '0':"未获取" ,'1':"已获取" */}
              {_get(record, 'traintype') === 'C1' &&
                _get(record, 'registered_NationalFlag') === '1' &&
                _get(record, 'status') === '01' && (
                  <AuthButton
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && transLoading}
                    authId="student/studentInfo:btn8"
                    onClick={() => {
                      _showConfirm({
                        title: '由C1车型修改为C2车型，将导致重新备案，修改后，无法重新转为C1，是否确认修改',
                        handleOk: async () => {
                          transRun({ id: _get(record, 'sid') });
                        },
                      });
                    }}
                    className="operation-button"
                    type="primary"
                    ghost
                    size="small"
                  >
                    转C2车型
                  </AuthButton>
                )}

              {/* 判断免签日期过期则显示免签；身份认证关闭标志(免签)  0-开启, 1-关闭 */}
              <AuthButton
                insertWhen={
                  (isExpire || _get(record, 'idauthclosed', '') !== '1') &&
                  _get(record, 'registered_Flag') === '1' &&
                  _get(record, 'status') === '01'
                }
                authId="student/studentInfo:btn16"
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  setCurrentRecord(record);
                  setNoVerifyVisible();
                }}
              >
                免签
              </AuthButton>

              <AuthButton
                insertWhen={
                  !isExpire &&
                  _get(record, 'idauthclosed', '') === '1' &&
                  _get(record, 'registered_Flag') === '1' &&
                  _get(record, 'status') === '01'
                }
                authId="student/studentInfo:btn17"
                loading={_get(currentRecord, 'sid') === _get(record, 'sid') && cancelLoading}
                className="operation-button"
                type="primary"
                ghost
                size="small"
                onClick={() => {
                  setCurrentRecord(record);
                  cancelRun({ sid: _get(currentRecord, 'sid'), idauthclosed: '0' });
                }}
              >
                取消免签
              </AuthButton>
            </MoreOperation>
          </>
        );
      },
    },
  ];

  function _handleAdd() {
    setCurrentRecord({});
    _switchVisible();
    setIsEdit(false);
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <>
      {noVerifyVisible && (
        <NoVerify
          onCancel={setNoVerifyVisible}
          onOk={() => {
            setNoVerifyVisible();
            forceUpdate();
          }}
          sid={_get(currentRecord, 'sid')}
        />
      )}
      <Search
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'registered_Flag',
            options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('stu_record_status_type')],
          },
          {
            type: 'Select',
            field: 'status',
            options: [{ label: '学员状态(全部)', value: '' }, ...useOptions('stu_drivetrain_status')],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
          },
          {
            type: 'RangePicker',
            field: ['applydatebegin', 'applydateend'],
            placeholder: ['报名日期起', '报名日期止'],
          },
          {
            type: 'Select',
            field: 'package_id',
            options: [{ value: '', label: '学员班级(全部)' }, ...classOptions],
          },
          {
            type: 'Select',
            field: 'busitype',
            options: [{ label: '业务类型(全部)', value: '' }, ...useOptions('businessType')],
          },
          {
            type: 'Select',
            field: 'contractflag',
            options: [{ label: '合同签订(全部)', value: '' }, ...useOptions('stu_contract_status')],
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
        authId="student/studentInfo:btn1"
        type="primary"
        onClick={_handleAdd}
        style={{ margin: '0 20px 20px 0' }}
      >
        新增
      </AuthButton>

      <AuthButton
        type="primary"
        style={{ marginRight: 20 }}
        onClick={async () => {
          const update: any = await isForceUpdatePlugin();
          if (update) {
            setLoading(false);
            setInfo('无法进行读二代证');
            return setUpdatePluginVisible();
          }
          const result = await getIdCardInfo();
          if (!_get(result, 'idNo', '')) {
            message.info('未检测到身份证');
            return;
          }
          let id = _get(result, 'idNo', '').trim();

          _handleSearch('idcard', id);
          setIdCard(id + Math.random());
        }}
      >
        读二代证
      </AuthButton>

      <AuthButton
        authId="student/studentInfo:btn14"
        type="primary"
        onClick={_switchTransferVisible}
        style={{ margin: '0 20px 20px 0' }}
      >
        转入
      </AuthButton>

      <AuthButton
        authId="student/studentInfo:btn11"
        // type="primary"
        icon={<DownloadOutlined />}
        onClick={async () => {
          if (!_get(search, 'applydatebegin') || !_get(search, 'applydateend')) {
            message.error('请选择报名时间');
            return;
          }

          if (
            _get(search, 'applydatebegin') &&
            _get(search, 'applydateend') &&
            moment(_get(search, 'applydateend')).diff(moment(_get(search, 'applydatebegin')), 'day') > 92
          ) {
            message.error('时间跨度不能超过3个月');
            return;
          }

          const query = {
            applydatebegin: _get(search, 'applydatebegin'),
            applydateend: _get(search, 'applydateend'),
          };

          const res = await _exportStudentBefore(query);

          if (_get(res, 'code') === 200) {
            _export(query).then((res: any) => {
              downloadFile(res, '学员名单', 'application/vnd.ms-excel', 'xlsx');
            });
          } else {
            message.error(_get(res, 'message'));
          }
        }}
        style={{ marginBottom: 20 }}
      >
        导出
      </AuthButton>

      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={isEdit ? '编辑学员信息' : '新增学员信息'}
          keyInfos={_get(currentRecord, 'registered_Flag', '') === '1' ? keyInfos : []} //已备案才需要传入敏感信息，未备案不需要，所有信息都可以编辑
          regInfos={regInfos}
        />
      )}

      {transferVisible && (
        <Transfer
          onCancel={_switchTransferVisible}
          onOk={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info={info} />}

      <Details
        visible={detailsVisible}
        onCancel={_switchDetailsVisible}
        sid={_get(currentRecord, 'sid')}
        idcard={_get(currentRecord, 'idcard')}
        isFrozenStudent={isFrozenStudent}
        showBtn={showBtn}
        currentRecord={currentRecord}
      />

      {generateVisible && (
        <GenerateContract
          onCancel={_setGenerateVisible}
          onOk={() => {
            _setGenerateVisible();
            forceUpdate();
          }}
          currentRecord={currentRecord}
          title={title}
        />
      )}

      {bindIdCardVisible && (
        <BindIdCard
          onCancel={setBindIdCardVisible}
          onOk={() => {
            setBindIdCardVisible();
            forceUpdate();
          }}
          currentRecord={currentRecord}
          idCardId={idCardId}
          certNum={certNum}
          setNoSoftWareVisible={setNoSoftWareVisible}
          loading={loading}
        />
      )}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      {reChargeVisible && <Recharge onCancel={setReChargeVisible} currentRecord={currentRecord} />}
      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'sid')}
        pagination={tablePagination}
      />
    </>
  );
}

export default StudentInfo;
