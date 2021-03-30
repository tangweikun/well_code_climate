import React, { useState } from 'react';
import { Table, Button } from 'antd';
import { useFetch, useVisible, useHash, useRequest, useAuth } from 'hooks';
import { _getFinalAssess, _uploadLog, _getFinalAssessAll, _getVehicleTrajectory, _getResult } from './_api';
import moment from 'moment';
import Details from './Details';
import { AuthButton } from 'components';
import { GPS, insertWhen, _get } from 'utils';

export default function TeachingJournalTable(props: any) {
  const {
    query,
    isTraningDetail = false,
    ignore,
    forceUpdate,
    selectCallback,
    trackCallback,
    pagination,
    setPagination,
    tablePagination,
    radioOpen = false,
    selectType,
    withOutQueryTime = false,
  } = props;
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const iscyzgTypeHash = useHash('iscyzg_type'); // 从业学时

  // const [selectRecord, setSelectedRecord] = useState(null) as any;
  const [currentRecord, setCurrentRecord] = useState(null) as any;
  const [visible, _switchVisible] = useVisible();
  const [defaultActiveKey, setDefaultActiveKey] = useState('1'); // 详情的初始打开tab页
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const depends = [...[ignore, pagination.current, pagination.pageSize], isTraningDetail ? query.subjectcode : ''];
  const [trackLoading, setTrackLoading] = useState(false);

  const { isLoading, data } = useFetch({
    request: withOutQueryTime ? _getFinalAssessAll : _getFinalAssess, //判断是否培训明细审核调用
    query: query,
    depends: depends,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      let key = [_get(data, 'rows.0.classid')];
      setSelectedRowKeys(key);
      let selectRow = _get(data, 'rows', []).filter((x: any) => key.includes(x.classid));
      selectCallback(selectRow[0]);
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
      let selectRow = _get(data, 'rows', []).filter((x: any) => selectedRowKeys.includes(x.classid));
      selectCallback(selectRow[0]);
    },
    selectedRowKeys,
  };
  let btn = isTraningDetail ? 'student/trainingDetailReview:btn' : 'student/teachingJournal:btn';
  let detailButton = btn + '1';
  let checkStatusButton = btn + '2';
  let uploadButton = btn + '3';

  // 上传
  const { loading: uploadLoading, run: uploadRun } = useRequest(_uploadLog, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
    onFail: () => {
      //失败也要刷新
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  function _trackCompare() {
    setTrackLoading(true);
    Promise.all(
      selectedRowKeys.map(async (key: string) => {
        const record = _get(data, 'rows', []).find((x: any) => key === x.classid);
        return await _getVehicleTrajectory({
          carid: _get(record, 'carid', ''),
          signstarttime: _get(record, 'signstarttime', ''),
          signendtime: _get(record, 'signendtime', ''),
        });
      }),
    )
      .then((res) => {
        const tracks: any = res.map((x: any) =>
          _get(x, 'data', []).map((y: any) => {
            // 将GPS位置转换成BD位置
            // WGS-84 to GCJ-02
            const WCJ = GPS.gcj_encrypt(Number(y.lat), Number(y.lon));
            const { lat: gcjLat, lon: gcjLon } = WCJ;

            // GCJ-02 to BD-09
            const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
            return { lng: WGS.lon, lat: WGS.lat };
          }),
        );
        trackCallback([...tracks]);
      })
      .finally(() => {
        setTrackLoading(false);
      });
  }

  const { loading: getApplicationLoading, run: getApplicationRun } = useRequest(_getResult, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const columns: any = [
    {
      title: '编号',
      dataIndex: 'recnum',
    },
    {
      title: '教练姓名',
      dataIndex: 'coachname',
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '学员证件',
      dataIndex: 'stu_idcard',
    },
    {
      title: '车牌号',
      dataIndex: 'licnum',
    },
    {
      title: '培训部分',
      dataIndex: 'subjectcode',
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '课程方式',
      dataIndex: 'traincode',
      render: (traincode: any) => traincodeHash[traincode],
    },
    ...insertWhen(useAuth('student/teachingJournal:iscyzg'), [
      {
        title: '从业资格学时',
        dataIndex: 'iscyzg',
        render: (iscyzg: any) => iscyzgTypeHash[iscyzg],
      },
    ]),
    {
      title: '签到时间',
      dataIndex: 'signstarttime',
    },
    {
      title: '签退时间',
      dataIndex: 'signendtime',
    },
    {
      title: '训练时长/分钟',
      dataIndex: 'duration',
    },
    {
      title: '有效训练时长/分钟',
      dataIndex: 'validtime',
    },
    {
      title: '训练里程/公里',
      dataIndex: 'mileage',
    },
    {
      title: '有效训练里程/公里',
      dataIndex: 'validmileage',
    },
    {
      title: '是否有效',
      dataIndex: 'crstate',
      render: (crstate: any) => crstateHash[crstate],
    },
    {
      title: '学员状态',
      dataIndex: 'stu_status',
      render: (stu_status: any) => stuStatusHash[stu_status],
    },
    {
      title: '计时审核状态',
      dataIndex: 'checkstatus_jx',
      render: (checkstatus_jx: any) => checkstatusJxHash[checkstatus_jx],
    },
    {
      title: '上传监管时间',
      dataIndex: 'checkjg_stime',
    },
    {
      title: '监管审核状态',
      dataIndex: 'checkstatus_jg',
      render: (checkstatus_jg: any) => checkstatusJgHash[checkstatus_jg],
    },
    {
      title: '操作',
      fixed: 'right',
      width: 150,
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId={detailButton}
            onClick={() => {
              setCurrentRecord(record);
              _switchVisible();
              setDefaultActiveKey('1');
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          {_get(record, 'checkstatus_jg') === '0' &&
            _get(record, 'checkstatus_jx') !== '2' && ( //只有待上传才显示学时初审和上传按钮
              <AuthButton
                authId={checkStatusButton}
                className="operation-button"
                onClick={async () => {
                  setCurrentRecord(record);
                  _switchVisible();
                  setDefaultActiveKey('5');
                }}
              >
                学时初审
              </AuthButton>
            )}
          {/*初审状态： 2:已初审 9:系统自动审批  */}
          {/*上传：（计时审核状态：已审核+系统自动审）&&（是否有效：部分有效+整体有效 ） &&（监管审核状态：未上传0+上传失败4+上传中5）才显示上传按钮*/}
          {(_get(record, 'checkstatus_jx') === '2' || _get(record, 'checkstatus_jx') === '9') &&
            (_get(record, 'crstate') === '1' || _get(record, 'crstate') === '2') &&
            (_get(record, 'checkstatus_jg') === '0' ||
              _get(record, 'checkstatus_jg') === '4' ||
              _get(record, 'checkstatus_jg') === '5') && (
              <AuthButton
                loading={_get(currentRecord, 'classid') === _get(record, 'classid') && uploadLoading}
                authId={uploadButton}
                className="operation-button"
                onClick={async () => {
                  setCurrentRecord(record);
                  uploadRun({
                    classid: _get(record, 'classid'),
                    year: moment(_get(record, 'signstarttime')).format('YYYY'),
                  });
                }}
              >
                上传
              </AuthButton>
            )}
          {_get(record, 'checkstatus_jx') !== '2' && ( //已审核不显示该按钮
            <AuthButton
              authId="student/teachingJournal:btn6"
              loading={_get(currentRecord, 'classid') === _get(record, 'classid') && getApplicationLoading}
              onClick={() => {
                setCurrentRecord(record);
                getApplicationRun({
                  id: _get(record, 'classid', ''),
                  sid: _get(record, 'stuid', ''),
                  subject: _get(record, 'subjectcode', ''),
                });
              }}
              className="operation-button"
            >
              查询审核结果
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {visible && (
        <Details
          onCancel={_switchVisible}
          currentRecord={currentRecord}
          defaultActiveKey={defaultActiveKey}
          onOk={() => {
            _switchVisible();
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
        />
      )}
      {isTraningDetail && (
        <Button type="primary" loading={trackLoading} onClick={_trackCompare} style={{ marginBottom: 15 }}>
          开始轨迹对比
        </Button>
      )}
      <Table
        scroll={isTraningDetail ? { x: 1000, y: 280 } : { x: 2000 }}
        rowSelection={
          radioOpen
            ? {
                type: selectType,
                ...rowSelection,
              }
            : undefined
        }
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record) => _get(record, 'classid')}
        pagination={tablePagination}
      />
    </>
  );
}
