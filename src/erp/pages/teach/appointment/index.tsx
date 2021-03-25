// 理论约排课
import React, { useState } from 'react';
import moment from 'moment';
import { useTablePagination, useFetch, useForceUpdate, useVisible } from 'hooks';
import { _getSchBranchNetworkList, _getClassroomList, _getSchBranchClassroomList } from './_api';
import { Button, Table, Select } from 'antd';
import AddCourse from './AddCourse';
import CourseReservation from './CourseReservation';
import OrderCourse from './OrderCourse';
import { AuthButton } from 'components';
import { _get } from 'utils';

const { Option } = Select;

export default function SimulationAppointment(props: any) {
  const { traincode } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [visible, _switchVisible] = useVisible();
  const [courseReservationVisible, _switchCourseReservationVisible] = useVisible();
  const [orderCourseVisible, _switchOrderCourseVisible] = useVisible();
  const [selectedOrderCourse, setSelectedOrderCourse] = useState<any>(new Set());
  const [selectedCourseList, setSelectedCourseList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [branchValue, setBranchValue] = useState(''); // 营业网点
  const [classid, setClassid] = useState(''); // 教室
  const [currentClassId, setCurrentClassId] = useState('');

  const columns = [
    {
      title: '营业网点名称',
      dataIndex: 'branchname',
    },
    {
      title: '营业网点简称',
      dataIndex: 'shortname',
    },
    {
      title: '教室',
      dataIndex: 'classroom',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="teach/theoryAppointment:btn2"
            onClick={() => {
              setCurrentId(_get(record, 'sbnid'));
              setCurrentRecord(record);
              _switchVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            新增课程
          </AuthButton>
          <AuthButton
            authId="teach/theoryAppointment:btn2"
            onClick={() => {
              setCurrentId(_get(record, 'sbnid'));
              setCurrentRecord(record);
              setCurrentClassId(_get(record, 'classid'));
              _switchCourseReservationVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            约排课
          </AuthButton>
        </div>
      ),
    },
  ];

  function _handleReset() {
    setSelectedOrderCourse(new Set());
    setSelectedCourseList([]);
    setSelectedDate(moment().format('YYYY-MM-DD'));
  }

  // 营业网点下拉列表
  const { data: BranchNetworkList = [] } = useFetch({
    request: _getSchBranchNetworkList,
    query: { traincode },
  });

  // 教室下拉列表
  const { data: ClassroomList = [] } = useFetch({
    request: _getClassroomList,
    query: {
      sbnid: branchValue,
      traincode,
    },
    depends: [branchValue],
  });

  const { isLoading, data } = useFetch({
    request: _getSchBranchClassroomList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sbnid: branchValue,
      classid,
      traincode,
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

  return (
    <>
      {/* 教学课程 */}
      {courseReservationVisible && (
        <CourseReservation
          classroomId={currentClassId}
          traincode={traincode}
          _handleReset={_handleReset}
          setSelectedCourseList={setSelectedCourseList}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedOrderCourse={selectedOrderCourse}
          setSelectedOrderCourse={setSelectedOrderCourse}
          _switchCourseReservationVisible={_switchCourseReservationVisible}
          _switchOrderCourseVisible={_switchOrderCourseVisible}
          currentId={currentId}
          currentRecordPlan={currentRecord}
          networkInfo={{ branchname: _get(currentRecord, 'branchname'), classroom: _get(currentRecord, 'classroom') }}
        />
      )}

      {orderCourseVisible && (
        <OrderCourse
          traincode={traincode}
          _handleReset={_handleReset}
          selectedCourseList={selectedCourseList}
          selectedDate={selectedDate}
          currentRecord={currentRecord}
          selectedOrderCourse={[...selectedOrderCourse]}
          currentId={currentId}
          setSelectedOrderCourse={setSelectedOrderCourse}
          _switchOrderCourseVisible={_switchOrderCourseVisible}
          classRoom={{ classid: _get(currentRecord, 'classid'), classroom: _get(currentRecord, 'classroom') }}
        />
      )}

      {visible && (
        <AddCourse
          traincode={traincode}
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          currentRecord={currentRecord}
          title="新增课程"
        />
      )}

      <Select
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        style={{ margin: '0 20px 20px 0' }}
        onChange={(value: string) => {
          setBranchValue(value);
          setClassid('');
        }}
        placeholder="营业网点"
      >
        {[{ branchname: '营业网点(全部)', sbnid: '' }, ...BranchNetworkList].map((item: any) => {
          return (
            <Option key={item.sbnid} value={item.sbnid}>
              {item.branchname}
            </Option>
          );
        })}
      </Select>

      <Select
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        style={{ margin: '0 20px 20px 0' }}
        onChange={(value: string) => {
          setClassid(value);
        }}
        placeholder="教室"
        value={classid}
      >
        {[{ classroom: '教室(全部)', classid: '' }, ...ClassroomList].map((item: any) => {
          return (
            <Option key={item.classid} value={item.classid}>
              {item.classroom}
            </Option>
          );
        })}
      </Select>

      <Button
        type="primary"
        onClick={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      >
        查询
      </Button>

      <Table
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="classid"
        pagination={tablePagination}
      />
    </>
  );
}
