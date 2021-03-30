import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Input, Select, message, DatePicker, Button, Alert } from 'antd';
import { useFetch, useOptions, useRequest, useVisible, useHash } from 'hooks';
import {
  _getDetails,
  _addStudent,
  _updateStudent,
  _getCoachList,
  _getClassList,
  _getReviewDetails,
  _updateByKeyForExam,
  getCardMoney,
  _getTrainType,
  _getTrainCar,
  _addSchStudentAcceptinfo,
  _getListAssociated,
  _getPreSignUpDetail,
  _getPreSignUpTrainCar,
  _checkStudent,
  _updateSchStudentAcceptinfo,
  _confirmStudent,
  _getJGRequestPlatformType,
} from './_api';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { formatTime, Auth } from 'utils';
import { Loading, UploadPro, Title, ItemCol } from 'components';
import { RULES } from 'constants/rules';
import { _getCode } from 'api';
import Reason from '../forecastReview/Reason';
import { readIdCardData } from 'utils';
import Photograph from './Photograph';
import { isForceUpdatePlugin, _get } from 'utils';
import { UpdatePlugin } from 'components';
import CheckFail from './CheckFail';

const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

export default function AddOrEdit(props: any) {
  const {
    onCancel,
    currentRecord,
    isEdit,
    title,
    onOk,
    isReview,
    keyInfos = [],
    regInfos = [],
    studenttype = '0',
    stutransareatype = '0',
    isPreSignUp = false, //是否预报名受理
    isChecked = false, //是否预报名审核
    isTheoryCenter = false, //是否理科中心
    isConfirmation = false, //是否转正
  } = props;
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState();
  const [head_img_oss_id, setImgId] = useState('');
  const [driveUrl, setDriveUrl] = useState(''); // 驾驶证图片url
  const [drilicenceossid, setDrilicenceossid] = useState(''); // 驾驶证图片id

  // const [jump_fromarea, setJump_fromarea] = useState('');
  const [package_name, setPackage_name] = useState('');
  const [businessType, setBusinessType] = useState(_get(currentRecord, 'busitype', ''));
  const [cardtype, setCardtype] = useState('');
  const [drilicnum, setDrilicnum] = useState('');
  const [traintype, setTraintype] = useState();
  const [package_id, setPackage_id] = useState('');
  // const [isOtherProvince, setIsOtherProvince] = useState('');
  const [islocal, setIsLocal] = useState('1');
  const [nations, setNations] = useState<any>([]);
  const [optionData, setOptionData] = useState([]);
  const [nationality, setNationality] = useState('156');
  const [train_price_online, setTrain_price_online] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [idCardRules, setIdCardRules] = useState(RULES.ID_CARD);
  const [reviewVisible, setReviewVisible] = useVisible();
  const isCarTypeDisable = isEdit && _get(currentRecord, 'registered_Flag', '') === '1'; //编辑 已备案的情况
  const [readCardLoading, setReadCardLoading] = useState(false);
  const [photographVisible, setPhotographVisible] = useVisible();
  const [stuType, setStuType] = useState(studenttype);
  const [busitypeOptions, setBusitypeOptions] = useState([]);
  const [checkVisible, setCheckVisible] = useVisible();

  const isShowClassCoach = !isPreSignUp || !isTheoryCenter; //非预报名页面（学员档案页面）或预报名页面同时驾校不是理科中心
  const isShowOriginalDriverInfo = businessType === '1' || businessType === '11' || businessType === '12'; //是否显示原驾驶证号、初领日期、原准驾车型

  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const DETAIL_API = isReview ? _getReviewDetails : isPreSignUp ? _getPreSignUpDetail : _getDetails;
  const { data, isLoading } = useFetch({
    query: {
      id: _get(currentRecord, 'sid'),
    },
    requiredFields: ['id'],
    request: DETAIL_API,
    callback: (data) => {
      if (isReview) {
        //意向学员
        setImageUrl(_get(data, 'head_img_url'));
      } else {
        setImageUrl(_get(data, 'headImgVO.head_img_url_show'));
      }
      // setJump_fromarea(_get(data, 'jump_fromarea', ''));
      setPackage_name(_get(data, 'package_name', ''));
      setCardtype(_get(data, 'cardtype', ''));
      setDrilicnum(_get(data, 'drilicnum', ''));
      setTraintype(_get(data, 'traintype', ''));
      setPackage_id(_get(data, 'package_id', ''));
      setIsLocal(_get(data, 'islocal', ''));
      // setIsOtherProvince(_get(data, 'isotherprovince', ''));
      setNationality(_get(data, 'nationality', '156'));
      setTrain_price_online(_get(data, 'train_price_online', 0));
      if (_get(data, 'cardtype', '') === '1') {
        //若学员是身份证号：1、出生日期、性别 不允许修改；2、从身份证号，提取 出生日期、性别。
        setDisabled(true);
        setIdCardRules(RULES.ID_CARD); //身份证号 根据身份证号校验

        let idcardVal = _get(data, 'idcard', '');
        if (!_get(data, 'birthday', '') && idcardVal.length === 18) {
          //如果没有birthday字段，出生日期 从身份证号取
          let birthday = `${idcardVal.substring(6, 10)}-${idcardVal.substring(10, 12)}-${idcardVal.substring(12, 14)}`;
          form.setFieldsValue({ birthday: moment(birthday) });
        }
      } else {
        setIdCardRules(RULES.OTHER_IDCARD); //其他证件类型正则校验：40字符
        setDisabled(false);
      }
      setDriveUrl(_get(data, 'drilicenceImgVO.drilicenceurl_show'));
    },
  });

  const { data: schoolData = [] } = useFetch({
    request: _getListAssociated,
  });

  // 监管地址配置0：国交 1：至正
  const { data: jGRequestPlatformType } = useFetch({
    request: _getJGRequestPlatformType,
  });

  // 教练列表
  useFetch({
    request: _getCoachList,
    query: {
      registered_Flag: '2',
      employstatus: '01',
    },
    callback: (data) => {
      setOptionData(data);
    },
  });

  // 班级数据
  const { data: classList = [] } = useFetch({
    request: _getClassList,
    depends: [traintype, stuType],
    query: {
      page: 1,
      limit: 100,
      traintype,
      studenttype: isEdit ? _get(currentRecord, 'studenttype', '') : stuType,
    },
  });

  // 培训车型数据
  const { data: trainCarData = [] } = useFetch({
    request: _getTrainCar,
    query: {
      schId: Auth.get('schoolId'),
    },
  });

  //学员预报名培训车型
  const { data: preSignUpTrainCar = [] } = useFetch({
    request: _getPreSignUpTrainCar,
  });
  const businessScopeOptions = (isPreSignUp ? preSignUpTrainCar : trainCarData).map((x: any) => {
    return {
      label: x.text,
      value: x.value,
    };
  });

  // 业务类型数据
  useFetch({
    request: _getTrainType,
    depends: [traintype],
    requiredFields: ['traintype'],
    query: {
      traintype,
    },
    callback: (data) => {
      setBusitypeOptions(
        data.map((x: any) => {
          return {
            label: x.text,
            value: x.value,
          };
        }),
      );
    },
  });

  useFetch({
    request: _getCode,
    query: { codeType: 'nationality_type', parentCodeKey: '-1' },
    callback: (data) => {
      setNations((data || []).map((x: any) => ({ value: x.value, label: x.text })));
    },
  });
  const effectiveClass = _get(classList, 'rows', []).filter((x: any) => x.status_cd === '2'); // '2'为有效班级

  const { data: cardMoney, res } = useFetch({
    request: getCardMoney,
    query: {
      accounttype: '00', // 账户类型 00:普通 10-代理商 写死
      operator: '新平台驾校查询', //   操作人 编码+姓名+证件号码 写死
      subAccountType: '00', // 写死
    },
  });
  const accountbalance = _get(cardMoney, 'accountbalance', '0');

  useEffect(() => {
    if (res && _get(res, 'code') !== 200) {
      message.warn(_get(res, 'message', ''));
    }
  }, [res]);

  const carTypeOptions = useOptions('trans_car_type'); // 车辆类型
  const genderOptions = useOptions('gender_type'); // 性别
  const cardTypeOptions = useOptions('card_type'); // 证件类型
  const nationalityTypeOptions = useOptions('nationality_type'); // 国籍
  const studentFieldLabelMapping = useHash('studentFieldLabelMapping', true); // 学员字段、lable
  const busiTypeOptionsTransfer = useOptions('busi_type'); // 业务类型

  function getSaveApi() {
    if (!isEdit) {
      if (isPreSignUp) {
        //预报名 - 新增
        return _addSchStudentAcceptinfo;
      }
      return _addStudent; //学员档案 - 新增
    }
    if (isReview) {
      // 意向学员审核
      return _updateByKeyForExam;
    }
    if (isChecked) {
      // 预受理 - 审核
      return _checkStudent;
    }
    if (isConfirmation) {
      //预报名 - 转正
      return _confirmStudent;
    }
    if (isPreSignUp) {
      // 预报名 - 编辑
      return _updateSchStudentAcceptinfo;
    }
    return _updateStudent; //学员档案 - 编辑
  }

  const { loading: confirmLoading, run } = useRequest(getSaveApi(), {
    onSuccess: onOk,
  });

  const loading = isLoading || readCardLoading;

  function getChangedValueOfFields(values: any) {
    let strArr: any[] = [];
    let str = '';
    const fieldsNoMngByFormArr = [
      //无法被form管理的字段
      'cardtype',
      'nationality',
      'drilicnum',
      'traintype',
      'package_id',
      'package_name',
      // 'jump_fromarea',
      'train_price_online',
      'head_img_oss_id',
    ];
    const dateArr = ['birthday', 'fstdrilicdate', 'applydate']; //日期相关的字段
    if (form.isFieldsTouched(regInfos)) {
      regInfos.forEach((item: any) => {
        if (fieldsNoMngByFormArr.includes(item)) {
          if (eval(item) !== _get(data, item, '')) {
            strArr.push(studentFieldLabelMapping[item]);
          }
        } else {
          if (dateArr.includes(item)) {
            if (
              item !== 'applydate' && //前端没有报名日期配置（后端自动生成），无需判断
              _get(values, item) !== undefined &&
              formatTime(_get(values, item, ''), 'DATE') !== formatTime(_get(data, item, ''), 'DATE')
            ) {
              strArr.push(studentFieldLabelMapping[item]);
            }
          } else if (_get(values, item) !== undefined && _get(values, item, '') !== _get(data, item, '')) {
            strArr.push(studentFieldLabelMapping[item]);
          }
        }
      });

      str = strArr.join(',');
    }
    return str;
  }

  const requestData = () => {
    form.validateFields().then(async (values) => {
      if (!cardtype) {
        message.error('证件类型不能为空');
        return;
      }
      let idcardVal = _get(values, 'idcard');
      if (idcardVal !== _get(values, 'idcardVerify')) {
        message.error('证件号不一致');
        return;
      }
      if (cardtype === '1') {
        //证件类型：身份证
        let sex = Number(idcardVal.substring(16, 17)) % 2 === 0 ? '2' : '1';
        if (sex !== _get(values, 'sex')) {
          message.error('性别与身份证号不符');
          return false;
        }
        let birthday = `${idcardVal.substring(6, 10)}-${idcardVal.substring(10, 12)}-${idcardVal.substring(12, 14)}`;
        if (birthday !== moment(_get(values, 'birthday')).format('YYYY-MM-DD')) {
          message.error('出生日期与身份证号不符');
          return false;
        }
      }

      if (!imageUrl) {
        message.error('照片不能为空');
        return;
      }

      if (isShowOriginalDriverInfo && !drilicnum) {
        message.error('请输入原驾驶证号');
        return;
      }
      if (isShowClassCoach && !package_id) {
        message.error('请选择班级');
        return;
      }
      // if (isOtherProvince === '1' && !jump_fromarea) {
      //   message.error('请选择转出驾校省市');
      //   return;
      // }

      const query = {
        name: _get(values, 'name'),
        sex: _get(values, 'sex'),
        cardtype,
        idcard: _get(values, 'idcard'),
        nationality,
        phone: _get(values, 'phone'),
        address: _get(values, 'address'),
        head_img_oss_id,
        drilicenceossid,
        busitype: _get(values, 'busitype'),
        drilicnum,
        fstdrilicdate: formatTime(_get(values, 'fstdrilicdate'), 'DATE'),
        perdritype: _get(values, 'perdritype'),
        traintype,
        // applydate: formatTime(_get(values, 'applydate'), 'DATE'),
        // isotherprovince: _get(values, 'isotherprovince'),
        fileType: 'studentregister',
        package_id,
        package_name,
        cid: _get(values, 'cid'),
        // jump_fromarea,
        islocal,
        livecardnumber: _get(values, 'livecardnumber'),
        liveaddress: _get(values, 'liveaddress'),
        note: _get(values, 'note'),
        birthday: formatTime(_get(values, 'birthday'), 'DATE'),
        train_price_online,
        studenttype: isEdit ? _get(currentRecord, 'studenttype', '') : studenttype,
        stutransareatype: isEdit ? _get(currentRecord, 'stutransareatype', '') : stutransareatype,
      };
      const reviewQuery = { ...query, sid: _get(currentRecord, 'sid'), checkstatus: '2' }; //意向学员审核通过：checkstatus 0：待处理 ，  1：审核不通过 ，2：审核通过
      const isCheckedQuery = {
        ...query,
        sid: _get(currentRecord, 'sid'),
        applyerschoolid: _get(values, 'applyerschoolid'),
        checkstatus: '2',
      }; //预报名审核  2：审核通过
      const isConfirmationQuery = {
        ...query,
        applyerschoolid: _get(values, 'applyerschoolid'),
        sid: _get(currentRecord, 'sid'),
      }; // 预报名转正
      const isPreSignUpQuery = {
        ...query,
        applyerschoolid: _get(values, 'applyerschoolid'),
      }; //预报名受理
      const studentQuery = { ...query, sid: _get(currentRecord, 'sid') };

      function getQuery() {
        if (!isEdit) {
          if (isPreSignUp) {
            // 预报名受理
            return isPreSignUpQuery;
          }
          return query; //学员档案
        }
        if (isReview) {
          // 意向学员审核通过
          return reviewQuery;
        }
        if (isChecked) {
          // 预报名审核
          return isCheckedQuery;
        }
        if (isConfirmation) {
          // 预报名 - 转正
          return isConfirmationQuery;
        }
        if (isPreSignUp) {
          // 预报名受理
          return { ...isPreSignUpQuery, sid: _get(currentRecord, 'sid') };
        }
        return studentQuery; //学员档案
      }
      //编辑 状态下，如果当前状态为已备案,获取影响备案状态的字段并比较是否修改
      if (isEdit && _get(currentRecord, 'registered_Flag', '') === '1' && getChangedValueOfFields(values)) {
        return confirm({
          title: '信息提示',
          content:
            '你修改了' + getChangedValueOfFields(values) + '信息，保存后，将使备案状态修改为待备案，是否继续保存',
          onOk() {
            run(getQuery());
          },
          okText: '确认',
          cancelText: '取消',
        });
      }
      if (isPreSignUp) {
        //预报名审核 - 新增 点击确定需要弹出提醒
        const schoolId = _get(values, 'applyerschoolid');
        const selectSchool = _get(schoolData, 'rows', []).filter((item: any) => {
          return String(item.value) === String(schoolId);
        });
        return confirm({
          title: `请确认是否为该学员报名${_get(selectSchool, '0.text', '')}？报名后，驾校不可更改。`,
          onOk() {
            run(getQuery());
          },
          okText: '确认',
          cancelText: '取消',
        });
      }
      run(getQuery());
    });
  };

  return (
    <>
      {/* 审核取消原因 */}
      {reviewVisible && (
        <Reason
          currentId={_get(currentRecord, 'sid')}
          onReasonCancel={setReviewVisible}
          onOk={() => {
            setReviewVisible();
            onCancel();
            onOk();
          }}
        />
      )}
      {checkVisible && ( //预报名审核
        <CheckFail
          currentId={_get(currentRecord, 'sid')}
          onCancel={setCheckVisible}
          onOk={() => {
            setCheckVisible();
            onCancel();
          }}
        />
      )}
      {photographVisible && (
        <Photograph
          onCancel={setPhotographVisible}
          getImgData={(imgData: any) => {
            setImageUrl(_get(imgData, 'url'));
            setImgId(_get(imgData, 'id'));
          }}
          onOk={setPhotographVisible}
        />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行读取身份证信息" />}

      <Modal
        visible
        width={1100}
        title={title}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        footer={
          isReview || isChecked //意向学员 || 预报名审核
            ? [
                <Button key="close" style={{ marginLeft: 20 }} onClick={onCancel}>
                  关闭
                </Button>,
                <Button
                  key="reviewFail"
                  type="primary"
                  style={{ marginLeft: 20 }}
                  onClick={isReview ? setReviewVisible : setCheckVisible}
                >
                  审核失败
                </Button>,
                <Button
                  loading={confirmLoading}
                  key="reviewSuccess"
                  type="primary"
                  style={{ marginLeft: 20 }}
                  onClick={requestData}
                >
                  {isReview ? '审核并注册' : '审核通过'}
                </Button>,
              ]
            : [
                !isEdit && (
                  <Alert
                    message={`驾校剩余点卡数${accountbalance}`}
                    type="warning"
                    key="alert"
                    showIcon
                    style={{ display: 'inline-block', width: 185, marginRight: 740, textAlign: 'left' }}
                  />
                ),
                [
                  <Button key="back" onClick={onCancel}>
                    取消
                  </Button>,
                  <Button key="submit" loading={confirmLoading} type="primary" onClick={requestData}>
                    确定
                  </Button>,
                ],
              ]
        }
      >
        {
          <Button
            style={{ float: 'right' }}
            onClick={async () => {
              setReadCardLoading(true);
              const update: any = await isForceUpdatePlugin();
              if (update) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
              const readCardResult = await readIdCardData(form, 'name', (data: any, imgData: any) => {
                setCardtype('1');
                form.setFieldsValue({ idcard: _get(data, 'idNo', '') });
                setImageUrl(_get(imgData, 'url'));
                setImgId(_get(imgData, 'id'));
                setReadCardLoading(false);
              });
              if (isEmpty(readCardResult)) {
                setReadCardLoading(false);
                return setUpdatePluginVisible();
              }
            }}
          >
            读二代证
          </Button>
        }
        {loading && <Loading />}

        {!loading && (
          <>
            <Form
              form={form}
              autoComplete="off"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{
                name: _get(data, 'name'),
                sex: _get(data, 'sex'),
                cardtype,
                idcard: _get(data, 'idcard'),
                idcardVerify: _get(data, 'idcard'),
                nationality: _get(data, 'nationality', '156'),
                phone: _get(data, 'phone'),
                address: _get(data, 'address'),
                busitype: _get(data, 'busitype'),
                fstdrilicdate: moment(_get(data, 'fstdrilicdate')),
                perdritype: _get(data, 'perdritype'),
                traintype: _get(data, 'traintype'),
                // applydate: moment(_get(data, 'applydate')),
                // isotherprovince: _get(data, 'isotherprovince'),
                package_id,
                cid: _get(data, 'cid'),
                islocal,
                livecardnumber: _get(data, 'livecardnumber'),
                liveaddress: _get(data, 'liveaddress'),
                note: _get(data, 'note'),
                birthday: moment(_get(data, 'birthday')),
                drilicnum,
                applyerschoolid: _get(data, 'applyerschoolid', ''),
              }}
            >
              <Title>基本信息</Title>

              <Row>
                <ItemCol
                  span={8}
                  label="姓名"
                  name="name"
                  rules={[{ whitespace: true, required: true }, RULES.STUDENT_NAME]}
                >
                  <Input disabled={isEdit && keyInfos.includes('name')} />
                </ItemCol>

                <ItemCol
                  span={8}
                  label="联系电话"
                  name="phone"
                  rules={[{ whitespace: true, required: true }, RULES.TEL_TELEPHONE_MOBILE]}
                >
                  <Input disabled={isEdit && keyInfos.includes('phone')} />
                </ItemCol>
                <ItemCol required span={8} label="证件类型">
                  <Select
                    options={cardTypeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('cardtype')}
                    onChange={(value: string) => {
                      setCardtype(value);
                      if (value === '1') {
                        //若学员是身份证号：1、出生日期、性别 不允许修改；2、从身份证号，提取 出生日期、性别。
                        setDisabled(true);
                        setIdCardRules(RULES.ID_CARD); //身份证号 根据身份证号校验
                        let idcardVal = form.getFieldValue('idcard');
                        if (!isEmpty(idcardVal) && isShowOriginalDriverInfo) {
                          setDrilicnum(idcardVal);
                        }
                      } else {
                        setIdCardRules(RULES.OTHER_IDCARD); //身份证号 根据身份证号校验
                        setDisabled(false);
                      }
                    }}
                    value={cardtype}
                  />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol
                  name="idcard"
                  span={8}
                  label="证件号"
                  rules={[{ whitespace: true, required: true }, idCardRules]}
                >
                  <Input
                    disabled={isEdit && keyInfos.includes('idcard')}
                    onChange={(e: any) => {
                      // setIdCard(e.target.value);
                      cardtype === '1' && isShowOriginalDriverInfo && setDrilicnum(e.target.value); //业务类型是增领并且证件类型是身份证，默认帮用户填上身份证号
                      if (e.target.value.length === 18) {
                        if (cardtype === '1') {
                          //身份证类型，禁用出生日期和性别
                          setDisabled(true);
                        } else {
                          setDisabled(false);
                        }
                        let value = e.target.value;
                        let birthday = `${value.substring(6, 10)}-${value.substring(10, 12)}-${value.substring(
                          12,
                          14,
                        )}`;
                        let sex = value[16] % 2 === 0 ? '2' : '1';
                        form.setFieldsValue({ sex: sex });
                        form.setFieldsValue({ birthday: moment(birthday) });
                      }
                    }}
                  />
                </ItemCol>

                <ItemCol span={8} label="证件号确认" name="idcardVerify" rules={[{ whitespace: true, required: true }]}>
                  <Input disabled={isEdit && keyInfos.includes('idcard')} />
                </ItemCol>
                <ItemCol span={8} label="出生日期" name="birthday" rules={[{ required: true }]}>
                  <DatePicker
                    picker="date"
                    allowClear={false}
                    disabled={disabled || (isEdit && keyInfos.includes('birthday'))}
                    disabledDate={(current: any) => {
                      return current.diff(moment(new Date(), 'days')) > 0;
                    }}
                  />
                </ItemCol>
                <ItemCol span={8} required label="性别" name="sex" rules={[{ required: true }]}>
                  <Select
                    options={genderOptions}
                    disabled={disabled || (isEdit && keyInfos.includes('sex'))}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  />
                </ItemCol>
                <ItemCol span={8} label="国籍" name="nationality" rules={[{ required: true }]}>
                  <Select
                    options={nations}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('nationality')}
                    onChange={(value: string) => {
                      setNationality(value);
                    }}
                    showSearch
                    filterOption={false}
                    onSearch={(value) => {
                      setNations(
                        nationalityTypeOptions.filter((item: any) => {
                          return item.label.includes(value);
                        }),
                      );
                    }}
                  />
                </ItemCol>
                <ItemCol name="traintype" span={8} label="培训车型" rules={[{ required: true }]}>
                  <Select
                    options={businessScopeOptions}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={(isEdit && keyInfos.includes('traintype')) || isCarTypeDisable}
                    value={traintype}
                    onChange={(value: any) => {
                      form.setFieldsValue({ busitype: '' });
                      setStuType(isEdit ? _get(currentRecord, 'studenttype', '') : studenttype);
                      setTraintype(value);
                      setPackage_id('');
                      setPackage_name('');
                      setTrain_price_online(0);
                    }}
                  />
                </ItemCol>
              </Row>

              <Row>
                <ItemCol
                  span={16}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="地址"
                  name="address"
                  rules={[{ whitespace: true, required: true }, RULES.ADDRESS]}
                >
                  <Input style={{ width: '102%' }} disabled={isEdit && keyInfos.includes('address')} />
                </ItemCol>

                <ItemCol span={8} label="业务类型" name="busitype" rules={[{ whitespace: true, required: true }]}>
                  <Select
                    options={studenttype === '0' ? busitypeOptions : busiTypeOptionsTransfer}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('busitype')}
                    onChange={(value: string) => {
                      setBusinessType(value);
                      setDrilicenceossid('');
                      setDriveUrl('');
                      setPackage_id('');
                      if (value === '1' || value === '11' || value === '12') {
                        if (cardtype === '1') {
                          //业务类型是增领并且证件类型是身份证，默认帮用户填上身份证号
                          setDrilicnum(form.getFieldValue('idcard'));
                        }
                        if (value === '11' || value === '12') {
                          setStuType('2');
                        } else {
                          setStuType(isEdit ? _get(currentRecord, 'studenttype', '') : studenttype);
                        }
                      } else {
                        setDrilicnum('');
                        setStuType(isEdit ? _get(currentRecord, 'studenttype', '') : studenttype);
                      }
                    }}
                  />
                </ItemCol>
                {isShowOriginalDriverInfo && (
                  <>
                    <ItemCol required span={8} label="原驾驶证号" rules={[RULES.DRIVER_LICENSE]}>
                      <Input
                        disabled={isEdit && keyInfos.includes('drilicnum')}
                        value={drilicnum}
                        onChange={(e: any) => {
                          if (cardtype !== '1' || isEmpty(form.getFieldValue('idcard'))) {
                            setDrilicnum(e.target.value);
                          }
                        }}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="初领日期" name="fstdrilicdate" rules={[{ required: true }]}>
                      <DatePicker
                        disabled={isEdit && keyInfos.includes('fstdrilicdate')}
                        disabledDate={(current: any): any => {
                          return current.diff(moment(new Date(), 'days')) > 0;
                        }}
                      />
                    </ItemCol>
                    <ItemCol span={8} label="原准驾车型" name="perdritype" rules={[{ required: true }]}>
                      <Select
                        options={carTypeOptions}
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        disabled={isEdit && keyInfos.includes('perdritype')}
                      />
                    </ItemCol>
                  </>
                )}
              </Row>
              <Row>
                <ItemCol required span={8} label="照片">
                  <UploadPro
                    disabled={isEdit && keyInfos.includes('head_img_oss_id')}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    setImgId={setImgId}
                  />
                  <span className="color-primary pointer" onClick={setPhotographVisible}>
                    拍照
                  </span>
                </ItemCol>
                {/*业务类型为货运运营初领或货运运营增领，且配置监管地址为国交时才显示该项 jGRequestPlatformType:0 国交  businessType：11：初领 12：增领*/}
                {jGRequestPlatformType === '0' && (businessType === '11' || businessType === '12') && (
                  <ItemCol required span={8} label="驾驶证图片">
                    <UploadPro imageUrl={driveUrl} setImageUrl={setDriveUrl} setImgId={setDrilicenceossid} />
                  </ItemCol>
                )}
              </Row>

              <Title>培训信息</Title>

              <Row>
                {isPreSignUp && ( //编辑禁用报名驾校
                  <ItemCol span={8} label="报名驾校" name="applyerschoolid" rules={[{ required: true }]}>
                    <Select
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      disabled={isEdit}
                      filterOption={false}
                    >
                      {_get(schoolData, 'rows', []).map((item: any) => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.text}
                          </Option>
                        );
                      })}
                    </Select>
                  </ItemCol>
                )}
                {isShowClassCoach && (
                  <>
                    <ItemCol span={8} label="学车教练" name="cid">
                      <Select
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        disabled={isEdit && keyInfos.includes('cid')}
                        // value={value}
                        allowClear
                        onClear={() => {
                          const query = { coachname: '' };
                          _getCoachList(query).then((res: any) => {
                            setOptionData(_get(res, 'data', []));
                          });
                        }}
                        showSearch
                        filterOption={false}
                        onSearch={(value) => {
                          const query = { coachname: value };
                          _getCoachList(query).then((res: any) => {
                            setOptionData(_get(res, 'data', []));
                          });
                        }}
                      >
                        {optionData.map((item: any) => {
                          return (
                            <Option key={item.cid} value={item.cid}>
                              {item.coachname}
                            </Option>
                          );
                        })}
                      </Select>
                    </ItemCol>
                    <ItemCol required span={8} label="学员班级" rules={[{ required: true }]}>
                      <Select
                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                        disabled={isEdit && keyInfos.includes('package_id')}
                        value={package_id}
                        onChange={(value: any) => {
                          const effectiveClassData: any = effectiveClass.filter((x: any) => x.packid === value);
                          setPackage_name(_get(effectiveClassData, '0.packlabel', ''));
                          setPackage_id(_get(effectiveClassData, '0.packid', ''));
                          setTrain_price_online(_get(effectiveClassData, '0.train_price_online', ''));
                        }}
                      >
                        {effectiveClass.map((item: any) => {
                          return (
                            <Option key={item.packid} value={item.packid}>
                              {item.packlabel}
                            </Option>
                          );
                        })}
                      </Select>
                      {train_price_online !== 0 && (
                        <div style={{ marginTop: 10 }}>需学员在线缴费{train_price_online}</div>
                      )}
                    </ItemCol>
                  </>
                )}
              </Row>

              <Title>其他信息</Title>
              <Row>
                <ItemCol required span={8} label="是否本地">
                  <Select
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    disabled={isEdit && keyInfos.includes('islocal')}
                    onChange={(value) => {
                      setIsLocal(value);
                    }}
                    value={islocal}
                  >
                    <Option key={'0'} value={'0'}>
                      否
                    </Option>
                    <Option key={'1'} value={'1'}>
                      是
                    </Option>
                  </Select>
                </ItemCol>
                {String(islocal) === '0' && ( //不是本地，才显示该字段
                  <>
                    <ItemCol span={8} label="居住证号" name="livecardnumber" rules={[RULES.RESIDENCE_PERMIT_NO]}>
                      <Input disabled={isEdit && keyInfos.includes('livecardnumber')} />
                    </ItemCol>

                    <ItemCol span={8} label="居住地址" name="liveaddress" rules={[RULES.RESIDENCE_PERMIT_ADDRESS]}>
                      <Input disabled={isEdit && keyInfos.includes('liveaddress')} />
                    </ItemCol>
                  </>
                )}
              </Row>
              <Row>
                <ItemCol
                  span={16}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="备注"
                  name="note"
                  rules={[RULES.MEMO]}
                >
                  <TextArea
                    style={{ width: '102%', maxWidth: '102%' }}
                    disabled={isEdit && keyInfos.includes('note')}
                  />
                </ItemCol>
              </Row>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
