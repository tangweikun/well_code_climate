// 帮学员预约

import React, { useState } from 'react';
import { _get } from 'utils';
import { Modal, Row, Button, Tooltip } from 'antd';
import moment from 'moment';
import { SearchStudent } from 'components';
import { _scheduleOrder } from './_api';
import { useHash } from 'hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function OrderCourse(props: any) {
  const {
    currentRecord,
    _handleReset,
    selectedDate,
    selectedCourseList,
    _switchOrderCourseVisible,
    selectedOrderCourse,
  } = props;
  const commonStyle = { display: 'inline-block', marginRight: 10, minWidth: 100 };
  const [sid, setSid] = useState('');
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分

  async function _handleOk(ifFree: string) {
    const res = await _scheduleOrder({
      sid,
      cid: _get(currentRecord, 'cid'),
      traincode: '1', // 实操
      skuIds: selectedOrderCourse,
      ifFree,
    });

    if (_get(res, 'code') === 200) {
      _handleReset();
      _switchOrderCourseVisible();
    }
  }

  return (
    <Modal visible onCancel={_switchOrderCourseVisible} footer={false} width={650}>
      <Row>
        <span style={commonStyle}>预约日期:</span>
        <span>{moment(selectedDate).format('YYYY-MM-DD')}</span>
      </Row>
      <Row style={{ display: 'flex', marginTop: 10 }}>
        <div className="mr20">
          <span style={commonStyle}>教练:</span>
          <span>{_get(currentRecord, 'coachname')}</span>
        </div>
        <div className="mr20">
          <span style={commonStyle}>准教车型:</span>
          <span>{_get(currentRecord, 'teachpermitted')}</span>
        </div>
        <div className="mr20">
          <span style={commonStyle}>身份证号:</span>
          <span>{_get(currentRecord, 'idcard')}</span>
        </div>
      </Row>
      <Row
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 600,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        {selectedCourseList.map((x: any, index: number) => (
          <div
            key={index}
            style={{
              margin: 10,
              width: 132,
              height: 90,
              borderRadius: 8,
              background: '#63c3a4',
              position: 'relative',
            }}
          >
            <div>
              {moment().hour(x.beginhour).minute(x.beginmin).format('HH:mm') +
                '-' +
                moment().hour(x.endhour).minute(x.endmin).format('HH:mm')}
            </div>
            <div>
              {Number(_get(x, 'classnum')) - Number(_get(x, 'applyNum'))}/{_get(x, 'classnum')}人
            </div>
            <div>{subjectcodeHash[x.subject] + ' ' + x.traintype}</div>
            <div>{x.price + '元'}</div>
          </div>
        ))}
      </Row>
      <Row style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
        <span style={commonStyle}>学员:</span>
        <SearchStudent value={sid} setValue={setSid} otherProps={{ registered_Flag: '1', status: '01' }} />
        <Tooltip title="只有学驾中和已备案的学员才能预约">
          <QuestionCircleOutlined style={{ marginLeft: '5px', color: '#a2a0a0' }} />
        </Tooltip>
      </Row>
      <Row style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button style={{ marginRight: 20 }} type="primary" onClick={_switchOrderCourseVisible}>
          关闭
        </Button>
        <Button style={{ marginRight: 20 }} type="primary" onClick={() => _handleOk('0')} disabled={!sid}>
          立即预约
        </Button>
        <Button type="primary" onClick={() => _handleOk('1')} disabled={!sid}>
          免单预约
        </Button>
      </Row>
    </Modal>
  );
}
