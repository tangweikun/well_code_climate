import React, { useState } from 'react';
import { Modal, Table, Button, Select, message } from 'antd';
import { useFetch, useTablePagination, useHash, useForceUpdate } from 'hooks';
import { _getWaitUpload, _uploadLog, _getTrainningTimeMinPatch, _getJsImageupPatch, _getClassrecord } from './_api';
import { _get } from 'utils';
import { AuthButton } from 'components';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { warning } = Modal;

export default function UploadArr(props: any) {
  const { onCancel, signstarttime_start } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [checkstatus_jg, setCheckstatus_jg] = useState('0');
  const [ignore, forceUpdate] = useForceUpdate();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [offsetLoading, setOffsetLoading] = useState(false);

  const { isLoading, data } = useFetch({
    query: { page: pagination.current, limit: pagination.pageSize, signstarttime_start, checkstatus_jg },
    request: _getWaitUpload,
    depends: [pagination.current, pagination.pageSize, checkstatus_jg, ignore],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态

  const columns = [
    {
      title: '上传时间',
      dataIndex: 'create_date',
    },
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
      title: '监管审核状态',
      dataIndex: 'checkstatus_jg',
      render: (checkstatus_jg: any) => checkstatusJgHash[checkstatus_jg],
    },
  ];

  return (
    <>
      <Modal visible width={1100} title={'批量上传'} maskClosable={false} onCancel={onCancel} footer={null}>
        <Button
          type="primary"
          loading={uploadLoading}
          style={{ margin: '0 20px 20px 0' }}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要上传的记录');
              return;
            }
            setUploadLoading(true);
            let errCount = 0;
            for (let i = 0; i < selectedRowKeys.length; i++) {
              const res = await _uploadLog(
                {
                  classid: selectedRowKeys[i],
                  year: signstarttime_start.slice(0, 4),
                },
                false,
              );
              if (_get(res, 'code') !== 200) {
                errCount++;
              }
            }
            if (errCount === 0) {
              message.success('全部上传成功');
            } else {
              message.error(`有${errCount}条记录上传失败`);
            }
            setUploadLoading(false);
            forceUpdate();
          }}
        >
          确定上传
        </Button>
        监管审核状态:
        <Select
          options={[
            { value: '0', label: '待上传' },
            { value: '4', label: '上传失败' },
            { value: '5', label: '上传中' },
          ]}
          value={checkstatus_jg}
          onChange={(value: any) => setCheckstatus_jg(value)}
          style={{ width: 180, marginLeft: 20 }}
        />
        <AuthButton
          authId="student/teachingJournal:btn7"
          className="ml20"
          insertWhen={checkstatus_jg === '4'}
          type="primary"
          loading={offsetLoading}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要上传的记录');
              return;
            }

            setOffsetLoading(true);

            let isAllSuccess = true; // 记录日志是否全部上传成功
            let errData = []; // 错误数据
            for (let i = 0; i < selectedRowKeys.length; i++) {
              // 分钟学时
              const res1 = await _getTrainningTimeMinPatch({
                classid: selectedRowKeys[i],
                year: signstarttime_start.slice(0, 4),
              });
              // 日志照片
              const res2 = await _getJsImageupPatch({
                classid: selectedRowKeys[i],
                year: signstarttime_start.slice(0, 4),
              });
              // 日志上报
              const res3 = await _getClassrecord({
                classid: selectedRowKeys[i],
                year: signstarttime_start.slice(0, 4),
              });
              if (_get(res1, 'code') !== 200 || _get(res2, 'code') !== 200 || _get(res3, 'code') !== 200) {
                isAllSuccess = false;
                errData.push(`
                编号:${_get(data, `rows.${i}.recnum`)}
                ${_get(res1, 'code') === 200 ? '' : `,分钟学时: ${_get(res1, 'message')}`}
                ${_get(res2, 'code') === 200 ? '' : `,日志照片: ${_get(res2, 'message')}`}
                ${_get(res3, 'code') === 200 ? '' : `,日志上报: ${_get(res3, 'message')}`}
                `);
              }
            }

            if (isAllSuccess) {
              message.success('全部教学日志补传成功');
            } else {
              warning({
                icon: <ExclamationCircleOutlined />,
                title: '补传失败日志信息',
                maskClosable: true,
                content: (
                  <>
                    {errData.map((x) => (
                      <div>{x}</div>
                    ))}
                  </>
                ),
              });
            }

            setOffsetLoading(false);
            forceUpdate();
          }}
        >
          批量补传
        </AuthButton>
        <Table
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record) => _get(record, 'classid')}
          pagination={tablePagination}
        />
      </Modal>
    </>
  );
}
