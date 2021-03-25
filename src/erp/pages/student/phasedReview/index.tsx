// 阶段报审管理
import React, { useState } from 'react';
import { Table, Tooltip, message } from 'antd';
import Review from './Review';
import InputPIN from './InputPIN';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useVisible,
  useForceUpdate,
  useOptions,
  useHash,
  useRequest,
  useConfirm,
} from 'hooks';
import {
  _getFinalAssess,
  _cancelFinalAssess,
  _updateStuIsApply,
  _getResult,
  _getReport,
  _getReportType,
  _getUKeyData,
  _uploadByKeyAndSignature,
  _export,
  _exportStageApplyBefore,
  _submitSignature,
} from './_api';
import { _getStudentList, _uploadImg } from 'api';
import { AuthButton, Search, AuthWrapper, Signature } from 'components';
import { Auth, previewPdf, _getReaderName, _readSignature, base64ConvertFile, _doSign, _get } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { downloadFile } from 'utils';
import { DownloadOutlined } from '@ant-design/icons';

function AssesserInfo() {
  const [search, _handleSearch] = useSearch();
  const [visible, _switchVisible] = useVisible();
  const [pinVisible, _switchPinVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentRecord, setCurrentRecord] = useState({});
  const [currentId, setCurrentId] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [uKeyLoading, setUKLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [batch, setBatch] = useState(false);
  const [_showConfirm] = useConfirm();
  const [signVisible, setSignVisible] = useVisible();

  const { isLoading, data } = useFetch({
    request: _getFinalAssess,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      subject: _get(search, 'subject'),
      isapply: _get(search, 'isapply'),
      sdate: _get(search, 'sdate'),
      edate: _get(search, 'edate'),
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize, _get(search, 'isapply')],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const SubjectApplyStatusHash = useHash('SubjectApplyStatus'); // 核实状态
  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型

  const { loading: cancelLoading, run: cancelRun } = useRequest(_cancelFinalAssess, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const { loading: getResultLoading, run: getResultRun } = useRequest(_getResult, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  /**验证插件是否下载或更新或服务开启*/
  async function isSoftWareNotRun() {
    const res = await _getReaderName();
    return _get(res, 'result', '') === false;
  }

  /**验证USBKey设备连接状态 */
  async function isUKeyExist() {
    const res = await _getReaderName();
    return _get(res, 'readerName', '') && _get(res, 'readerName', '') !== -1;
  }

  const uKeyReport = async function (id: any, index?: any, errorCount?: any, isBatch?: any) {
    const pin = Auth.get('pin');
    const softWareNotRun = await isSoftWareNotRun();
    const isExist = await isUKeyExist();

    if (softWareNotRun) {
      message.error('请确认插件是否开启或已下载最新插件');
      if (isBatch) {
        setErrorCount((err) => err + 1);
        setIndex((index) => index + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }
      return;
    }
    // UKey未插入
    if (!isExist) {
      message.error('请确认UKey是否插入');
      if (isBatch) {
        setErrorCount((err) => err + 1);
        setIndex((index) => index + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return;
    }

    // pin码不存在
    if (!pin) {
      return _switchPinVisible();
    }

    // UKey已插入 && pin码存在
    if (isBatch) {
      setIndex((index) => index + 1);
    }
    const signatureRes = await _readSignature(); // 获取签章

    // 获取签章失败
    if (_get(signatureRes, 'return', '') === -1) {
      return;
    }

    const file = base64ConvertFile(_get(signatureRes, 'result', ''));
    let formData = new FormData();
    formData.append('file', file);

    const imgRes = await _uploadImg(formData); // 上传签章图片
    if (_get(imgRes, 'code') !== 200) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('签章上传失败');
    }

    const imgResId = _get(imgRes, 'data.id', '');
    const UKeyData = await _getUKeyData({ id }); // 获取UKey签字所需的报文原始数据
    // 获取数据失败
    if (_get(UKeyData, 'code') !== 200) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('获取数据失败');
    }

    // 加签
    const doSignRes = await _doSign({
      Content: _get(UKeyData, 'data', ''),
      len: _get(UKeyData, 'data.length', 0),
      PassWord: pin,
    });

    // 加签失败
    if (_get(doSignRes, 'result', '') === -1) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('加签失败');
    }

    // UKey盖章与签字内容提交报审
    const res = await _uploadByKeyAndSignature({
      id,
      fileId: imgResId,
      signatureData: _get(doSignRes, 'result', ''),
    });

    if (isBatch) {
      if (_get(res, 'code') !== 200) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      } else {
        index < selectedRowKeys.length && batchReport(index + 1, errorCount);
      }
    }

    return res;
  };

  const columns: any = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
    },
    {
      title: '初审日期',
      dataIndex: 'createtime',
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
    },
    {
      title: '学驾车型',
      dataIndex: 'traintype',
    },
    {
      title: '核实状态',
      dataIndex: 'isapply',
      render: (isapply: any) => SubjectApplyStatusHash[isapply],
    },
    {
      title: '提交人',
      dataIndex: 'applyname',
    },
    {
      title: '提交时间',
      dataIndex: 'applytime',
    },
    {
      title: '核实日期',
      dataIndex: 'resptime',
    },
    {
      title: '备注',
      dataIndex: 'respmsg',
    },
    {
      title: '三联单显示',
      dataIndex: 'preivewFlag',
      render: (preivewFlag: string, record: any) =>
        // preivewFlag (string)  0-不展示三联单  1-展示三联单
        preivewFlag === '1' && (
          <span
            className="color-primary pointer"
            onClick={async () => {
              const res = await _getReport({ id: _get(record, 'said') });
              previewPdf(_get(res, 'data'), false);
            }}
          >
            查看三联单
          </span>
        ),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 150,
      render: (_: void, record: any) => (
        <div>
          {record.isapply === '6' && ( //核实状态：待学员签字才显示
            <AuthButton
              authId="student/phasedReview:btn7"
              onClick={() => {
                setCurrentRecord(record);
                setSignVisible();
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              学员签字
            </AuthButton>
          )}
          {/* 已初审：0   已签字：7  上报中：5  */}
          {(record.isapply === '0' || record.isapply === '7' || record.isapply === '5') && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && uKeyLoading}
              authId="student/phasedReview:btn4"
              onClick={async () => {
                setBatch(false);
                setCurrentRecord(record);
                setCurrentId(_get(record, 'said', ''));
                setUKLoading(true);
                const res = await _getReportType({ id: _get(record, 'said') }); // 1:ukey盖章     0：传统方式不用ukey
                if (_get(res, 'data', '') === '1') {
                  const uKeyRes = await uKeyReport(_get(record, 'said'));

                  setUKLoading(false);
                  if (_get(uKeyRes, 'code') === 200) {
                    forceUpdate();
                  }
                } else {
                  const res = await _updateStuIsApply({ id: _get(record, 'said') });
                  setUKLoading(false);
                  if (_get(res, 'code') === 200) {
                    forceUpdate();
                  }
                }
              }}
              className="operation-button"
              type="primary"
              ghost
              size="small"
            >
              上报
            </AuthButton>
          )}
          {/* 已初审：0  学员待签字：6  已签字：7   */}
          {(record.isapply === '0' || record.isapply === '6' || record.isapply === '7') && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelLoading}
              authId="student/phasedReview:btn2"
              onClick={async () => {
                _showConfirm({
                  title: '是否要撤销上报本条记录？',
                  handleOk: async () => {
                    setCurrentRecord(record);
                    cancelRun({ id: _get(record, 'said') });
                  },
                });
              }}
              className="operation-button"
              size="small"
            >
              撤销
            </AuthButton>
          )}
          {/* 已上报：1 2监管拒绝、3监管同意都显示获取审核结果按钮*/}
          {(Number(record.isapply) === 1 || Number(record.isapply) === 2 || Number(record.isapply) === 3) && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && getResultLoading}
              authId="student/phasedReview:btn3"
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                setCurrentRecord(record);
                getResultRun({ id: record.said });
              }}
            >
              获取审核结果
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  //批量上报
  async function batchReport(index: any, errorCount: any) {
    if (index > selectedRowKeys.length) {
      return;
    }

    if (index === selectedRowKeys.length) {
      if (errorCount === 0) {
        message.success('全部上报成功');
      } else {
        message.error(`有${errorCount}条记录上报失败`);
      }
      setReportLoading(false);
      forceUpdate();
      return;
    }

    const reportTypeRes = await _getReportType({ id: selectedRowKeys[index] }); // 1:ukey盖章     0：传统方式不用ukey

    let res: any = {};
    if (_get(reportTypeRes, 'data', '') === '1') {
      setCurrentId(selectedRowKeys[index]);
      await uKeyReport(selectedRowKeys[index], index, errorCount, true);
    } else {
      res = await _updateStuIsApply(
        {
          id: selectedRowKeys[index],
        },
        false,
      );

      setIndex((index) => index + 1);
      if (_get(res, 'code') !== 200) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      } else {
        index < selectedRowKeys.length && batchReport(index + 1, errorCount);
      }
    }
  }

  return (
    <div>
      {signVisible && (
        <Signature
          onCancel={setSignVisible}
          onOk={async (result: any) => {
            const res = await _submitSignature({
              sid: _get(currentRecord, 'sid', ''),
              said: _get(currentRecord, 'said', ''),
              fileid: _get(result, 'data.id', ''),
            });
            if (_get(res, 'code') === 200) {
              setSignVisible();
              forceUpdate();
            }
          }}
        />
      )}
      {visible && <Review onCancel={_switchVisible} onOk={_handleOk} title="初审信息" />}
      {pinVisible && (
        <InputPIN
          onCancel={() => {
            _switchPinVisible();
            setIndex((index) => index + 1);
            setErrorCount((err) => err + 1);
            index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
          }}
          onOk={() => {
            _switchPinVisible();
            forceUpdate();
          }}
          currentId={currentId}
          uKeyReport={uKeyReport}
          index={index}
          errorCount={errorCount}
          batch={batch}
        />
      )}
      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['初审日期起', '初审日期止'],
          },
          {
            type: 'CustomSelect',
            field: 'sid',
            placeholder: '学员姓名',
            options: [
              { label: '学员姓名', value: 'name' },
              { label: '学员证件', value: 'idcard' },
            ],
          },
          {
            type: 'Select',
            field: 'subject',
            options: [{ value: '', label: '报审类型(全部)' }, ...useOptions('SchoolSubjectApply')],
          },
          {
            type: 'Select',
            field: 'isapply',
            options: [{ value: '', label: '核实状态(全部)' }, ...useOptions('SubjectApplyStatus')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        customRequest={_getStudentList}
      />

      <AuthButton
        authId="student/phasedReview:btn1"
        type="primary"
        onClick={() => _switchVisible()}
        className="mr20 mb20"
      >
        初审
      </AuthButton>

      <AuthButton
        authId="student/phasedReview:btn5"
        type="primary"
        loading={reportLoading}
        onClick={async () => {
          setBatch(true);

          if (selectedRowKeys.length < 1) {
            message.error('当前没有符合上报条件的记录');
            return;
          }

          setReportLoading(true);
          setIndex(0);
          setErrorCount(0);

          batchReport(0, 0);
        }}
        className="mr20 mb20"
        disabled={_get(search, 'isapply') !== '0' && _get(search, 'isapply') !== '5'}
      >
        批量上报
      </AuthButton>

      <AuthWrapper authId="student/phasedReview:btn5">
        <Tooltip color={'#333'} placement="right" title="请先查询核实状态为已初审学员或上报中，选择后，再点击批量上报">
          <QuestionCircleOutlined />
        </Tooltip>
      </AuthWrapper>

      <AuthButton
        authId="student/phasedReview:btn6"
        icon={<DownloadOutlined />}
        onClick={async () => {
          if (!_get(search, 'sdate') || !_get(search, 'edate')) {
            message.error('请选择初审日期');
            return;
          }

          if (
            _get(search, 'sdate') &&
            _get(search, 'edate') &&
            moment(_get(search, 'edate')).diff(moment(_get(search, 'sdate')), 'day') > 92
          ) {
            message.error('时间跨度不能超过3个月');
            return;
          }

          const query = {
            sdate: _get(search, 'sdate'),
            edate: _get(search, 'edate'),
          };

          const res = await _exportStageApplyBefore(query);

          if (_get(res, 'code') === 200) {
            _export(query).then((res: any) => {
              downloadFile(res, '报审名单', 'application/vnd.ms-excel', 'xlsx');
            });
          } else {
            message.error(_get(res, 'message'));
          }
        }}
        style={{ margin: '0 20px 20px 20px' }}
      >
        导出
      </AuthButton>

      <Table
        scroll={{ x: 2000 }}
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        rowKey={(record) => _get(record, 'said')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default AssesserInfo;
