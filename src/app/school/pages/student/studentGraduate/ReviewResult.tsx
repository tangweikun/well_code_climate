import React, { useState } from 'react';
import { Modal, Radio, Input, message } from 'antd';
import { _endReview } from './_api';
import { _get } from 'utils';
import { useConfirm } from 'hooks';

const { TextArea } = Input;

export default function ReviewResult(props: any) {
  const { onCancel, onOk, selectedRowKeys, selectedRow } = props;
  const [isapply, setIsapply] = useState('2') as any; // 2:通过
  const [respmsg, setRespmsg] = useState(''); //拒绝原因
  const [loading, setLoading] = useState(false);
  const [_showConfirm] = useConfirm();

  return (
    <>
      <Modal
        visible
        title={'结业审核'}
        maskClosable={false}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={async () => {
          setLoading(true);
          let errCount = 0;
          let failName = [];
          for (let i = 0; i < selectedRow.length; i++) {
            const res = await _endReview({
              saidList: [_get(selectedRow[i], 'said')],
              isapply,
              respmsg,
            });
            if (_get(res, 'code') !== 200) {
              failName.push(_get(selectedRow[i], 'name'));
              errCount++;
            }
          }
          setLoading(false);
          if (errCount === 0) {
            message.success('全部上传成功');
          } else {
            _showConfirm({
              title: '信息提示',
              content: (
                <div>
                  学员: {[...failName]},{errCount}条记录上传失败,详情请查看核实说明。
                </div>
              ),
            });
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
