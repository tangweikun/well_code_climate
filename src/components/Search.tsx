import React, { useState } from 'react';
import { Button, Input, Select, DatePicker, TimePicker, message } from 'antd';
import { _get } from 'utils';

const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;

type ElementType =
  | 'Input'
  | 'Select'
  | 'RangePicker'
  | 'CustomSelect'
  | 'TimeRangePicker'
  | 'CustomSelectOfCoach'
  | 'RangePickerDisable'
  | 'DatePicker';
type OptionsType = IOption[];
type FiltersType = {
  type: ElementType;
  field: any;
  options?: OptionsType;
  placeholder?: any;
  rangeDay?: any;
  crossYear?: any;
  rangeAllowClear?: any; // 是否允许清除日期
  otherProps?: any;
  show?: boolean;
  onChangeCallback?(field?: any, value?: any): void;
}[];

type TProps = {
  search: object;
  _handleSearch(name: string, value: any): void;
  filters: FiltersType;
  refreshTable?(): void;
  customRequest?: any;
  extraParamsForCustomRequest?: object;
  customCoachRequest?: any;
  studentOptionData?: any[];
};

function Search(props: TProps) {
  const {
    search,
    _handleSearch,
    filters,
    refreshTable,
    customRequest,
    customCoachRequest,
    extraParamsForCustomRequest = {},
    studentOptionData = [],
  } = props;
  const [optionData, setOptionData] = useState<any>(studentOptionData);
  const [optionCoachData, setOptionCoachData] = useState<any>([]);
  const [customType, setCustomType] = useState('');
  const [coachCustomType, setCoachCustomType] = useState('');
  const [dateArr, setDateArr] = useState<any>();
  const [hackValue, setHackValue] = useState<any>();
  const [dateValue, setDateValue] = useState<any>();
  function fetchOptions(value: any, customType: any, field: any, type: any) {
    const query = { [customType]: value.trim(), ...extraParamsForCustomRequest };
    // 搜索条件小于2位时不发起请求
    if (_get(value.trim(), 'length', 0) < 2) {
      return;
    }

    // 身份证号小于18位时不发起请求
    if (customType === 'idcard' && _get(value.trim(), 'length', 0) < 5) {
      return;
    }
    if (type === 'CustomSelect') {
      customRequest(query).then((res: any) => {
        setOptionData(
          _get(res, 'data.rows', []).map((x: any) => ({ value: _get(x, 'sid', ''), label: `${x.name} ${x.idcard}` })),
        );
      });
    }
    if (type === 'CustomSelectOfCoach') {
      customCoachRequest(query).then((res: any) => {
        setOptionCoachData(
          _get(res, 'data', []).map((x: any) => ({ value: _get(x, 'cid', ''), label: `${x.coachname}` })),
        );
      });
    }
  }

  return (
    <div className="flex-wrap">
      {filters.map((x, index) => {
        const {
          type,
          options = [],
          placeholder,
          rangeDay,
          crossYear = false,
          rangeAllowClear = true,
          field,
          otherProps = {},
          show = true,
          onChangeCallback = () => {},
        } = x;

        if (!show) return null;

        function handleChange(field: any, value: any) {
          onChangeCallback(field, value);
          _handleSearch(field, value);
        }

        if (type === 'Input') {
          return (
            <Input
              {...otherProps}
              key={index}
              value={_get(search, field, '')}
              placeholder={placeholder}
              onChange={(e) => {
                handleChange(field, e.target.value);
              }}
              className="mr20 mb20 w180" //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
            />
          );
        }

        if (type === 'DatePicker') {
          return (
            <DatePicker
              {...otherProps}
              key={index}
              value={_get(search, field, '')}
              placeholder={placeholder}
              onChange={(date) => {
                handleChange(field, date);
              }}
              className="mr20 mb20 w180" //  添加宽度：在modal中，Input的宽度不受全局宽度配置限制，因此需要单独设置
            />
          );
        }

        if (type === 'CustomSelect') {
          return (
            <Input.Group
              key={index}
              compact
              style={{ margin: '0 20px 20px 0', width: 340, display: 'inline-block', marginRight: 20 }}
            >
              <Select
                defaultValue={_get(options, '0.value')}
                style={{ width: 100 }}
                onChange={(value) => {
                  setCustomType(value);
                  handleChange(field, undefined);
                }}
                options={options}
              />

              <Select
                value={_get(search, field, undefined)}
                placeholder={customType === 'idcard' ? '请输入全部证件号' : '请输入姓名'}
                onSearch={(value) => {
                  fetchOptions(value, customType || _get(x, 'options.0.value'), field, type);
                }}
                onClear={() => {
                  fetchOptions('', customType || _get(x, 'options.0.value'), field, type);
                }}
                showSearch
                filterOption={false}
                style={{ width: 240 }}
                allowClear={true}
                onChange={(value) => {
                  handleChange(field, value);
                }}
                options={optionData}
              />
            </Input.Group>
          );
        }

        if (type === 'CustomSelectOfCoach') {
          return (
            <Input.Group
              key={index}
              compact
              style={{ margin: '0 20px 20px 0', width: 340, display: 'inline-block', marginRight: 20 }}
            >
              <Select
                defaultValue={_get(options, '0.value')}
                style={{ width: 100 }}
                onChange={(value) => {
                  setCoachCustomType(value);
                  handleChange(field, undefined);
                }}
                options={options}
              />

              <Select
                value={_get(search, field, undefined)}
                placeholder={coachCustomType === 'idcard' ? '请输入全部证件号' : '请输入姓名'}
                onSearch={(value) => {
                  fetchOptions(value, coachCustomType || _get(x, 'options.0.value'), field, type);
                }}
                onClear={() => {
                  fetchOptions('', coachCustomType || _get(x, 'options.0.value'), field, type);
                }}
                showSearch
                filterOption={false}
                style={{ width: 240 }}
                allowClear={true}
                onChange={(value) => {
                  handleChange(field, value);
                }}
                options={optionCoachData}
              />
            </Input.Group>
          );
        }

        if (type === 'Select') {
          return (
            <Select
              {...otherProps}
              key={index}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              onChange={(value) => handleChange(field, value)}
              value={_get(search, field, '')}
              style={{ margin: '0 20px 20px 0', width: 180 }} // 添加宽度：在modal中，Select的宽度不受全局宽度配置限制，因此需要单独设置
              options={options}
            />
          );
        }

        if (type === 'RangePicker') {
          return (
            <RangePicker
              {...otherProps}
              key={index}
              placeholder={placeholder}
              onChange={(dates: any) => {
                if (dates) {
                  handleChange(field[0], _get(dates, '0').format('YYYY-MM-DD'));
                  handleChange(field[1], _get(dates, '1').format('YYYY-MM-DD'));
                } else {
                  handleChange(field[0], '');
                  handleChange(field[1], '');
                }
              }}
              className="mr20 mb20"
            />
          );
        }

        if (type === 'RangePickerDisable') {
          return (
            <RangePicker
              {...otherProps}
              key={index}
              placeholder={placeholder}
              value={hackValue || dateValue || [_get(search, `${field[0]}`), _get(search, `${field[1]}`)]}
              style={{ margin: '0 20px 20px 0' }}
              allowClear={rangeAllowClear}
              onCalendarChange={(date: any) => {
                setDateArr(date);

                if (_get(date, '0') && _get(date, '1')) {
                  // 限制选择日期不能跨年
                  if (crossYear) {
                    if (_get(date, '0').year() === _get(date, '1').year()) {
                      setDateValue(date);
                      handleChange(field[0], _get(date, '0').format('YYYY-MM-DD'));
                      handleChange(field[1], _get(date, '1').format('YYYY-MM-DD'));
                    } else {
                      message.error('选择日期不能跨年');
                    }
                  } else {
                    setDateValue(date);
                    handleChange(field[0], _get(date, '0').format('YYYY-MM-DD'));
                    handleChange(field[1], _get(date, '1').format('YYYY-MM-DD'));
                  }
                }
              }}
              disabledDate={(current: any) => {
                if (rangeDay) {
                  if (!dateArr || dateArr.length === 0) {
                    return false;
                  }
                  const tooLate = dateArr[0] && current.diff(dateArr[0], 'days') > rangeDay;
                  const tooEarly = dateArr[1] && dateArr[1].diff(current, 'days') > rangeDay;
                  return tooEarly || tooLate;
                }
              }}
              onOpenChange={(open: any) => {
                if (open) {
                  setHackValue([]);
                  setDateArr([]);
                  if (rangeAllowClear) {
                    setDateValue([]);
                    handleChange(field[0], '');
                    handleChange(field[1], '');
                  }
                } else {
                  setHackValue(undefined);
                }
              }}
            />
          );
        }

        if (type === 'TimeRangePicker') {
          return (
            <TimeRangePicker
              {...otherProps}
              key={index}
              placeholder={placeholder}
              onChange={(dates: any) => {
                if (dates) {
                  handleChange(field[0], _get(dates, '0').format(otherProps.format));
                  handleChange(field[1], _get(dates, '1').format(otherProps.format));
                } else {
                  handleChange(field[0], '');
                  handleChange(field[1], '');
                }
              }}
              style={{ margin: '0 20px 20px 0' }}
            />
          );
        }

        return null;
      })}

      <Button type="primary" onClick={refreshTable} className="mr20 mb20">
        查询
      </Button>
    </div>
  );
}

export default Search;
