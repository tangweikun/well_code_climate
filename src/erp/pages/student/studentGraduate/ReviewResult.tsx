import React, { useState } from 'react';
import { Modal, Radio, Input, message } from 'antd';
import { _endReview } from './_api';
import { _get } from 'utils';

const { TextArea } = Input;

export default function UploadArr(props: any) {
  const { onCancel, onOk, selectedRowKeys } = props;
  const [isapply, setIsapply] = useState('2') as any; // 2:通过
  const [respmsg, setRespmsg] = useState(''); //拒绝原因

  return (
    <>
      <Modal
        visible
        title={'结业审核'}
        maskClosable={false}
        onCancel={onCancel}
        onOk={async () => {
          let errCount = 0;
          for (let i = 0; i < selectedRowKeys.length; i++) {
            const res = await _endReview({
              saidList: [selectedRowKeys[i]],
              isapply,
              respmsg,
            });
            if (_get(res, 'code') !== 200) {
              errCount++;
            }
          }
          if (errCount === 0) {
            message.success('全部上传成功');
          } else {
            message.error(`有${errCount}条记录上传失败`);
          }
          onOk();
        }}
      >
        <Radio.Group
          onChange={(e) => {
            setIsapply(e.target.value);
          }}
          value={isapply}
        >
          <Radio value={'2'}>通过</Radio>
          <Radio value={'3'}>不通过</Radio>
        </Radio.Group>
        {/*isapply：3 不通过 */}
        {isapply === '3' && (
          <TextArea
            rows={4}
            className="mt20"
            onChange={(e) => {
              setRespmsg(e.target.value);
            }}
          />
        )}
      </Modal>
    </>
  );
}
