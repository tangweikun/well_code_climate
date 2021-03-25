import React from 'react';
import { Modal, Alert } from 'antd';

export default function AddOrEdit(props: any) {
  const { onCancel, studentList, setStudentData } = props;

  return (
    <Modal visible title={'选择人员'} maskClosable={false} onCancel={onCancel} footer={null}>
      {studentList.map((item: any, index: any) => {
        return (
          <div
            onClick={() => {
              setStudentData(item);
              onCancel();
            }}
            key={index}
            style={{ marginBottom: 10 }}
          >
            <Alert message={`${item.name} ${item.traintype}`} type="info" />
          </div>
        );
      })}
    </Modal>
  );
}
