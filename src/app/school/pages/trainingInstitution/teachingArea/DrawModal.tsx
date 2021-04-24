import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { DrawVehicleTrajectoryMap } from 'components';

export default function DrawModal(props: any) {
  const { setDrawPaths, onCancel, center } = props;
  const [drawMap, setDrawMap] = useState();

  return (
    <Modal
      visible
      width={1300}
      onCancel={onCancel}
      title={'绘制电子围栏'}
      onOk={() => {
        if (drawMap) {
          setDrawPaths(drawMap);
          onCancel();
        } else {
          message.error('请绘制电子围栏');
        }
      }}
    >
      <DrawVehicleTrajectoryMap setDrawPaths={setDrawMap} center={center} />
    </Modal>
  );
}
