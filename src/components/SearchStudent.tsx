/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Input, Select } from 'antd';
import { _getStudentList } from 'api';
import { Auth, _get } from 'utils';

type TProps = {
  value: any;
  setValue: Function;
  options?: IOption[];
  otherProps?: any;
  stuschoolid?: string;
};

export default function SearchStudent(props: TProps) {
  const {
    value,
    setValue,
    options = [
      { label: '学员姓名', value: 'name' },
      { label: '学员证件', value: 'idcard' },
    ],
    otherProps = {},
    stuschoolid = Auth.get('schoolId'),
  } = props;
  const [optionData, setOptionData] = useState<any>([]);
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    setOptionData([]);
    setValue('');
  }, [stuschoolid]);

  function fetchOptions(value: any, customType: any, stuschoolid: any) {
    const query = { [customType]: value.trim() };

    // 搜索条件小于2位时不发起请求
    if (_get(value.trim(), 'length', 0) < 2) {
      return;
    }

    // 身份证号小于18位时不发起请求
    if (customType === 'idcard' && _get(value.trim(), 'length', 0) < 5) {
      return;
    }
    _getStudentList({ ...query, ...otherProps, stuschoolid: stuschoolid }).then((res: any) => {
      setOptionData(_get(res, 'data.rows', []).map((x: any) => ({ value: x.sid, label: `${x.name} ${x.idcard}` })));
    });
  }

  return (
    <Input.Group compact style={{ width: 340, display: 'inline-block', marginRight: 20 }}>
      <Select
        defaultValue={_get(options, '0.value')}
        style={{ width: 100 }}
        onChange={(value) => {
          setCustomType(value);
          setValue('');
          setOptionData([]);
        }}
        options={options}
      />

      <Select
        placeholder={customType === 'idcard' ? '请输入全部证件号' : '请输入姓名'}
        value={value}
        onSearch={(value) => {
          fetchOptions(value, customType || _get(options, '0.value'), stuschoolid);
        }}
        showSearch
        filterOption={false}
        style={{ width: 240 }}
        onChange={(value) => {
          setValue(value);
        }}
        options={optionData}
      />
    </Input.Group>
  );
}
