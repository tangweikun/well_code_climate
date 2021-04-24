import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _addFinalAssess, _getCoaList, _editFinalAssess, _getFinalAssessDetail } from './_api';
import { _get } from 'utils';
import { _getStudentList } from 'api';
import moment from 'moment';
import { RULES } from 'constants/rules';
// TODO:
// import { LabeledValue } from '_antd@4.15.0@antd/lib/select';

const { Option } = Select;

export default function AddFinalAssessment(props: any) {
  const { onCancel, onOk, currentId, isEdit } = props;
  const [form] = Form.useForm();
  const [student, setStudent] = useState({});
  const [appraise, setAppraise] = useState({});
  const [studentOptionData, setStudentOptionData] = useState([]);
  const [coaOptionData, setCoaOptionData] = useState([]);
  const [customType, setCustomType] = useState(''); // 学员姓名、证件号选择
  const [studentValue, setStudentValue] = useState(undefined as any | any[] | undefined);

  const examResultOptions = useOptions('appraisalresult_type'); // 考核结果
  const subjectOption = useOptions('SchoolSubjectApply'); //培训部分：根据配置中心大纲科目拉取
  // 考核员数据
  useFetch({
    request: _getCoaList,
    callback: (data) => {
      setCoaOptionData(data.rows);
    },
  });

  // 根据id获取详情
  const { data, isLoading } = useFetch({
    request: _getFinalAssessDetail,
    query: { id: currentId },
    depends: ['id'],
    requiredFields: ['id'],
    callback: async (data) => {
      setStudent({ studentnames: _get(data, 'studentname', ''), stuids: _get(data, 'stuid', '') });
      setAppraise({ appraisername: _get(data, 'appraisername', ''), appraiserid: _get(data, 'appraiserid', '') });

      // 学员姓名下拉数据默认初始值  status:01'学驾中' 此处始终获取学驾中的学员
      const res = await _getStudentList({ name: _get(data, 'studentname', ''), status: '01' });
      if (_get(res, 'code') === 200) {
        setStudentOptionData(_get(res, 'data.rows', []));
        setStudentValue(
          isEdit
            ? {
                value: _get(data, 'stuid', ''),
                label: `${_get(res, 'data.rows.0.name', '')}-${_get(res, 'data.rows.0.idcard', '')} `,
              }
            : undefined,
        );
      }
    },
  });

  function _changeStudent(students: any) {
    let studentnames: any = [];
    let stuids: any = [];
    if (isEdit) {
      setStudent({ studentnames: students.label, stuids: students.value });
      setStudentValue({ value: students.value, label: students.label });
    } else {
      for (let item of students) {
        studentnames.push(item.label.split('-')[0]); //label中包含name-身份证号，传参只需要name
        stuids.push(item.value);
      }
      setStudent({ studentnames, stuids });
    }
  }

  function _changeAppraise(appraise: any) {
    setAppraise({ appraisername: appraise.label, appraiserid: appraise.value });
  }

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editFinalAssess : _addFinalAssess, {
    onSuccess: onOk,
  });

  return (
    <>
      {isLoading && null}
      {!isLoading && (
        <>
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              appraisaltime: moment(_get(data, 'appraisaltime')),
              appraisername: { key: _get(data, 'appraiserid', ''), label: _get(data, 'appraisername', '') },
              subjectcode: _get(data, 'subjectcode'),
              appraisalresult: _get(data, 'appraisalresult', '1'), // appraisalresult:1 合格 此处默认合格
              achievement: String(_get(data, 'achievement', '90')),
            }}
          >
            <Form.Item label="考核时间" name="appraisaltime" rules={[{ required: true, message: '考核时间不能为空' }]}>
              <DatePicker
                allowClear={false}
                disabledDate={(current: any): any => {
                  return current >= moment().subtract(0, 'days');
                }}
              />
            </Form.Item>

            <Form.Item label="学员姓名" required>
              <Select
                defaultValue={'name'}
                style={{ width: 100 }}
                onChange={(value) => {
                  setCustomType(value);
                  setStudentValue(undefined);
                  setStudent({});
                }}
                options={[
                  { label: '学员姓名', value: 'name' },
                  { label: '学员证件', value: 'idCard' },
                ]}
              />

              <Select
                showSearch
                value={studentValue}
                mode={isEdit ? undefined : 'multiple'}
                placeholder={customType === 'idCard' ? '请输入全部证件号' : '请输入姓名'}
                labelInValue
                filterOption={false}
                onSearch={(value) => {
                  const query = customType === 'idCard' ? { idcard: value } : { name: value };
                  // status:01'学驾中' 此处始终获取学驾中的学员
                  _getStudentList({ ...query, status: '01' }).then((res: any) => {
                    setStudentOptionData(_get(res, 'data.rows', []));
                  });
                }}
                onChange={_changeStudent}
              >
                {studentOptionData.map((x: any, index: number) => (
                  <Option key={index} value={x.sid}>
                    {x.name + '-' + x.idcard}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              required
              label="考核员"
              name="appraisername"
              rules={[
                {
                  validator: (rule, value, callback) => {
                    if (!value.label || !value.key) {
                      callback('考核员不能为空');
                    }
                    callback();
                  },
                },
              ]}
            >
              <Select
                labelInValue
                onChange={_changeAppraise}
                filterOption={false}
                showSearch
                onSearch={(value) => {
                  const query = { coachname: value }; //显示已备案的考核员数据。
                  _getCoaList(query).then((res: any) => {
                    setCoaOptionData(_get(res, 'data.rows', []));
                  });
                }}
              >
                {coaOptionData.map((item: any) => {
                  return (
                    <Option key={item.cid} value={item.cid}>
                      {item.coachname}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item label="考核科目" name="subjectcode" rules={[{ required: true, message: '培训部分不能为空' }]}>
              <Select options={subjectOption} />
            </Form.Item>

            <Form.Item
              label="考核结果"
              name="appraisalresult"
              rules={[{ required: true, message: '考核结果不能为空' }]}
            >
              <Select options={examResultOptions} disabled={isEdit} />
            </Form.Item>

            <Form.Item
              label="考核成绩"
              name="achievement"
              rules={[{ whitespace: true, required: true, message: '考核成绩不能为空' }, RULES.SCORE]}
            >
              <Input />
            </Form.Item>
          </Form>
          <div className="text-center mt20">
            <Button
              className="mr20"
              type="primary"
              loading={confirmLoading}
              onClick={() => {
                form.validateFields().then(async (values) => {
                  if (_get(student, 'stuids', '').length === 0) {
                    message.error('请选择学员');
                    return;
                  }
                  const query = {
                    appraisaltime: moment(_get(values, 'appraisaltime')).format('YYYY-MM-DD'),
                    appraiserid: _get(appraise, 'appraiserid'),
                    appraisername: _get(appraise, 'appraisername'),
                    subjectcode: _get(values, 'subjectcode'),
                    appraisalresult: _get(values, 'appraisalresult'),
                    achievement: parseInt(_get(values, 'achievement')),
                    traincode: '1', // yapi中没定义的，属于bug。后端做了限制，后续要修正。作废的。实际不用传，但表结构设计了有这个字段
                  };
                  let studentId = isEdit ? _get(student, 'stuids', '') : _get(student, 'stuids', []).join(',');
                  let studentName = isEdit
                    ? _get(student, 'studentnames', '').split('-')[0]
                    : _get(student, 'studentnames', []).join(',');
                  const queryFinal = isEdit
                    ? {
                        ...query,
                        id: currentId,
                        stuid: studentId,
                        studentname: studentName,
                      }
                    : {
                        ...query,
                        stuids: studentId,
                        studentnames: studentName,
                      };
                  run(queryFinal);
                });
              }}
            >
              确定
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        </>
      )}
    </>
  );
}
