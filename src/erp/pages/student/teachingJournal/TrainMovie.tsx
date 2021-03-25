import React from 'react';
import { useFetch, useHash } from 'hooks';
import { _getTrainingPhotosDetail } from './_api';
import { _get } from 'utils';
import { PopoverImg } from 'components';

export default function Details(props: any) {
  const { currentRecord } = props;

  const { data = [] } = useFetch({
    request: _getTrainingPhotosDetail,
    query: {
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime', ''),
    },
  });

  const photo_typeHash = useHash('photo_type'); // 照片类型

  const UPLOAD_STATUS: any = {
    0: '未上报',
    1: '已上报',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {data.map((x: any) => {
        return (
          <div style={{ display: 'flex' }}>
            <PopoverImg src={_get(x, 'url')} alt="照片" imgStyle={{ margin: '0 20px 20px 0' }} />
            <div style={{ width: 230 }}>
              {_get(x, 'phototype') !== '99' && <div>拍摄时间:{x.equtime}</div>}
              <div>照片类型:{photo_typeHash[x.phototype]}</div>
              {_get(x, 'phototype') !== '99' && <div>上传状态:{UPLOAD_STATUS[x.uploadstatus]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
