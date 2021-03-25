import React, { useState } from 'react';
import { Drawer, Table, Row, Input, Select, Form, Button, Upload, message } from 'antd';
import { Search, Title, ItemCol, Loading } from 'components';
import { _getStudentTableList, _getStudyDetail, _submit, _editSubmit } from './_api';
import { _getStudentList } from 'api';
import { useFetch, useHash, useOptions, useTablePro } from 'hooks';
import { UploadOutlined } from '@ant-design/icons';
import { Auth, _get } from 'utils';
import { USER_CENTER_URL } from 'constants/env';
import { isEmpty } from 'lodash';

export default function AddOrEdit(props: any) {
  const { onCancel, isEdit, currentRecord, onOk } = props;
  const [form] = Form.useForm();
  const { tableProps, search, _handleSearch, _refreshTable } = useTablePro({
    request: _getStudentTableList,
    extraParams: {
      traintimeApplyQueryType: '2', //查询类型
      trainTimeApplyStatus: '0', //学时未申报
      studenttype: '1', //转入学员
      trainTimeApply: '1', //需要学时申报
      isotherprovince: '1', //外省转入
    },
  });
  const [wellFileId, setWellFileId] = useState(''); // 交警技能证明id
  const [sid, setSid] = useState(isEdit ? _get(currentRecord, 'sid', '') : '');

  const cardTypeHash = useHash('card_type'); // 证件类型
  const stuDrivetrainStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const examResultTypeOptions = useOptions('exam_result_type'); // 考核结果

  // 获取学时详情
  const { data: detailsData = {} } = useFetch({
    request: _getStudyDetail,
    query: {
      sid,
    },
    requiredFields: ['sid'],
  });

  // form的展示，新增和编辑且获取到detailsData数据的时候正常展示 编辑的时候获取到detailsData之前loading展示
  const isFormLoading = !isEdit || !isEmpty(detailsData);

  const columns = [
    { title: '学号', dataIndex: 'studentnum' },
    { title: '学员姓名', dataIndex: 'name' },
    { title: '证件类型', dataIndex: 'cardtype', render: (cardtype: any) => cardTypeHash[cardtype] },
    { title: '证件号码', dataIndex: 'idcard' },
    { title: '学员状态', dataIndex: 'status', render: (status: any) => stuDrivetrainStatusHash[status] },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      setSid(_get(selectedRowKeys, '0'));
    },
  };

  const layout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } };

  return (
    <Drawer
      title="学时申报"
      closable={false}
      onClose={onCancel}
      visible
      width={1200}
      destroyOnClose
      footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      footer={
        <>
          <Button className="mr20" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={() => {
              form.validateFields().then(async (values: any) => {
                const query = { ...values, sid, wellFileId };
                const res = isEdit ? await _editSubmit(query) : await _submit(query);
                if (_get(res, 'code') === 200) {
                  onOk();
                }
              });
            }}
            disabled={false}
          >
            确定
          </Button>
        </>
      }
    >
      {!isFormLoading && <Loading />}
      {isFormLoading && (
        <>
          {!isEdit && (
            <>
              <Search
                filters={[
                  {
                    type: 'CustomSelect',
                    field: 'sid',
                    placeholder: '学员姓名',
                    options: [
                      { label: '学员姓名', value: 'name' },
                      { label: '学员证件', value: 'idcard' },
                    ],
                  },
                ]}
                search={search}
                _handleSearch={_handleSearch}
                refreshTable={_refreshTable}
                customRequest={_getStudentList}
              />
              <Table
                columns={columns}
                {...tableProps}
                rowKey="sid"
                rowSelection={{
                  type: 'radio',
                  ...rowSelection,
                }}
              />
            </>
          )}
          {isEdit && (
            <Row>
              <ItemCol span={8} {...layout} label="学员姓名">
                {_get(currentRecord, 'name', '')}
              </ItemCol>
              <ItemCol span={8} {...layout} label="证件号码">
                {_get(currentRecord, 'idcard', '')}
              </ItemCol>
            </Row>
          )}
          <Form form={form} {...layout} autoComplete="off" initialValues={{ ...detailsData }}>
            <Title>学时信息</Title>
            <Row>
              <ItemCol span={8} label="第一部分课堂理论" name="subjectOneClassroomTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第一部分网络理论" name="subjectOneNetworkTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="第二部分实操" name="subjectTwoVehicleTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第二部分模拟" name="subjectTwoSimulatorTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第二部分里程" name="subjectTwoMileage">
                <Input className="w200" addonAfter={'公里'} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="第三部分实操" name="subjectThreeVehicleTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第三部分模拟" name="subjectThreeSimulatorTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第三部分里程" name="subjectThreeMileage">
                <Input className="w200" addonAfter={'公里'} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="第四部分课堂理论" name="subjectFourClassroomTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
              <ItemCol span={8} label="第四部分网络理论" name="subjectFourNetworkTime" rules={[{ required: true }]}>
                <Input className="w200" addonAfter={'学时'} />
              </ItemCol>
            </Row>

            <Title>考核信息</Title>
            <Row>
              <ItemCol span={8} label="第一部分考核结果" name="subjectOneExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} />
              </ItemCol>
              <ItemCol span={8} label="第二部分考核结果" name="subjectTwoExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} />
              </ItemCol>
              <ItemCol span={8} label="第三部分考核结果" name="subjectThreeExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} />
              </ItemCol>
              <ItemCol span={8} label="第四部分考核结果" name="subjectFourExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} />
              </ItemCol>
            </Row>

            <Title>其他材料</Title>
            <ItemCol span={8} label="交警技能证明">
              <Upload
                name={'file'}
                action={USER_CENTER_URL + '/api/video-face/tmpFile/upload'}
                headers={{
                  token: String(Auth.get('token')),
                  Authorization: 'bearer' + Auth.get('token'),
                  username: String(Auth.get('username')),
                  schoolId: String(Auth.get('schoolId')),
                }}
                maxCount={1}
                onChange={(info: any) => {
                  if (info.file.status !== 'uploading') {
                  }
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} 文件上传成功`);
                    setWellFileId(_get(info, 'file.response.data.id', ''));
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败`);
                  }
                }}
              >
                {isEdit ? (
                  <>
                    <Button icon={<UploadOutlined />}>重新上传</Button>
                    {!wellFileId && <div>{_get(detailsData, 'wellFileId', '')}</div>}
                  </>
                ) : (
                  <Button icon={<UploadOutlined />}>上传文件</Button>
                )}
              </Upload>
            </ItemCol>
          </Form>
        </>
      )}
    </Drawer>
  );
}
