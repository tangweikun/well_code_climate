import React from 'react';
import { Modal, Form, Row, Tabs, Button } from 'antd';
import { useFetch, useHash, useVisible, useConfirm, useRequest } from 'hooks';
import { _getDetails, _uploadLog, _reviewLog } from './_api';
import { _get } from 'utils';
import { ItemCol, AuthWrapper } from 'components';
import Minutes from './Minutes';
import TrainMovie from './TrainMovie';
import VehicleTrajectory from './VehicleTrajectory';
import moment from 'moment';
import Reason from './Reason';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, currentRecord, defaultActiveKey, onOk } = props;
  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [_showConfirm] = useConfirm();

  const { data } = useFetch({
    query: {
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime'),
    },
    request: _getDetails,
  });

  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  // 上传
  const { loading: uploadLoading, run: uploadRun } = useRequest(_uploadLog, {
    onSuccess: () => {
      onOk();
    },
  });

  const traincodeHash = useHash('subject_type'); // 课程方式
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const sourcetypeHash = useHash('source_type'); // 数据来源
  const iscyzgTypeHash = useHash('iscyzg_type'); // 从业资格学时

  return (
    <Modal visible width={1300} title={'电子教学日志详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Tabs defaultActiveKey={defaultActiveKey}>
          <TabPane tab="监管审核信息" key="1">
            <Row>
              <ItemCol span={8} label="上传监管时间">
                {_get(data, 'checkjg_stime')}
              </ItemCol>
              <ItemCol span={8} label="监管审核状态">
                {checkstatusJgHash[_get(data, 'checkstatus_jg', 1)]}
              </ItemCol>
              <ItemCol span={8} label="审核有效学时">
                {_get(data, 'validtime_jg')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="审核有效里程">
                {_get(data, 'validmileage_jg')}
              </ItemCol>
              <ItemCol span={8} label="备注">
                {_get(data, 'reason')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="计时审核信息" key="2">
            <Row>
              <ItemCol span={8} label="计时审核状态">
                {checkstatusJxHash[_get(data, 'checkstatus_jx', '0')]}
              </ItemCol>
              <ItemCol span={8} label="初审时间">
                {_get(data, 'checkjx_etime')}
              </ItemCol>
              <ItemCol span={8} label="初审人员">
                {_get(data, 'checkjx_username')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="初审有效学时">
                {_get(data, 'validtime_jx')}
              </ItemCol>
              <ItemCol span={8} label="初审有效里程">
                {_get(data, 'validmileage_jx')}
              </ItemCol>
              <ItemCol span={8} label="不合格原因">
                {_get(data, 'msg_jx')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="日志详情" key="3">
            <Row>
              <ItemCol span={8} label="电子教学日志编号">
                {_get(data, 'recnum')}
              </ItemCol>
              <ItemCol span={8} label="教练姓名">
                {_get(data, 'coachname')}
              </ItemCol>
              <ItemCol span={8} label="教练证件号">
                {_get(data, 'coa_idcard')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="学员姓名">
                {_get(data, 'name')}
              </ItemCol>
              <ItemCol span={8} label="学员证件号">
                {_get(data, 'stu_idcard')}
              </ItemCol>
              <ItemCol span={8} label="培训部分">
                {subjectcodeHash[_get(data, 'subjectcode', '1')]}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="课程方式">
                {traincodeHash[_get(data, 'traincode', 1)]}
              </ItemCol>
              <ItemCol span={8} label="车牌号">
                {_get(data, 'licnum')}
              </ItemCol>
              <ItemCol span={8} label="终端编号">
                {_get(data, 'termcode')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="数据来源">
                {sourcetypeHash[_get(data, 'sourcetype', 1)]}
              </ItemCol>
              <ItemCol span={8} label="培训机构">
                {_get(data, 'ins_name')}
              </ItemCol>
              <ItemCol span={8} label="采集时间">
                {_get(data, 'create_date')}
              </ItemCol>
            </Row>
            <AuthWrapper authId="student/teachingJournal:iscyzg">
              <Row>
                <ItemCol span={8} label="从业资格学时">
                  {iscyzgTypeHash[_get(data, 'iscyzg')]}
                </ItemCol>
              </Row>
            </AuthWrapper>
          </TabPane>

          <TabPane tab="学时详情" key="4">
            <Row>
              <ItemCol span={8} label="签到时间">
                {_get(data, 'signstarttime')}
              </ItemCol>
              <ItemCol span={8} label="签退时间">
                {_get(data, 'signendtime')}
              </ItemCol>
              <ItemCol span={8} label="平均时速">
                {_get(data, 'avevelocity')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="训练时长">
                {_get(data, 'duration')}
              </ItemCol>
              <ItemCol span={8} label="车动时长">
                {_get(data, 'movetotaltime')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="点火时长">
                {_get(data, 'launchtotaltime')}
              </ItemCol>
              <ItemCol span={8} label="停车时长">
                {_get(data, 'speed')}
              </ItemCol>
              <ItemCol span={8} label="速度≤5时长">
                {_get(data, 'speed5')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="速度＞5时长">
                {_get(data, 'speed5up')}
              </ItemCol>
              <ItemCol span={8} label="训练里程">
                {_get(data, 'mileage')}
              </ItemCol>
              <ItemCol span={8} label="最高时速">
                {_get(data, 'maxspeed')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="分钟学时" key="5">
            <Minutes currentRecord={currentRecord} />
          </TabPane>

          <TabPane tab="培训照片" key="6">
            <TrainMovie currentRecord={currentRecord} />
          </TabPane>

          <TabPane tab="车辆轨迹" key="7">
            <VehicleTrajectory currentRecord={currentRecord} />
          </TabPane>
        </Tabs>
      </Form>

      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            onOk();
          }}
          query={{
            classids: _get(currentRecord, 'classid', ''),
            signstarttime: _get(currentRecord, 'signstarttime', ''),
            crstate: '3',
          }}
          invalidReasonWay={'all'}
        />
      )}

      <Row justify={'end'} style={{ marginTop: 20 }}>
        {(_get(data, 'checkstatus_jg') === '0' || _get(data, 'checkstatus_jg') === '4') && (
          <>
            <Button
              type="primary"
              style={{ marginLeft: 20 }}
              onClick={async () => {
                _switchVisible();
              }}
            >
              学时无效
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: 20 }}
              onClick={() => {
                _showConfirm({
                  title: '是否设置本条电子教育日志有效',
                  handleOk: async () => {
                    const res = await _reviewLog({
                      classids: _get(currentRecord, 'classid', ''),
                      signstarttime: _get(currentRecord, 'signstarttime', ''),
                      crstate: '1',
                    });

                    if (_get(res, 'code') === 200) {
                      onOk();
                    }
                  },
                });
              }}
            >
              学时有效
            </Button>
          </>
        )}
        {/*初审状态： 2:已初审 9:系统自动审批  */}
        {/*上传：（计时审核状态：已审核+系统自动审）&&（是否有效：部分有效+整体有效 ） &&（监管审核状态：未上传0+上传失败4+上传中5）才显示上传按钮*/}
        {(_get(data, 'checkstatus_jx') === '2' || _get(data, 'checkstatus_jx') === '9') &&
          (_get(data, 'crstate') === '1' || _get(data, 'crstate') === '2') &&
          (_get(data, 'checkstatus_jg') === '0' ||
            _get(data, 'checkstatus_jg') === '4' ||
            _get(data, 'checkstatus_jg') === '5') && (
            <Button
              type="primary"
              loading={uploadLoading}
              style={{ marginLeft: 20 }}
              onClick={async () => {
                uploadRun({
                  classid: _get(currentRecord, 'classid'),
                  year: moment(_get(data, 'signstarttime')).format('YYYY'),
                });
              }}
            >
              上传
            </Button>
          )}
      </Row>
    </Modal>
  );
}
