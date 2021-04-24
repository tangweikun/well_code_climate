import React, { useState } from 'react';
import { Select, Col, Row } from 'antd';
import { useFetch } from 'hooks';
import { _getCode } from 'api';

const { Option } = Select;

export default function Address(props: any) {
  const { cityCode, setCityCode } = props;
  const [provinceCode, setProvinceCode] = useState<any>(cityCode ? cityCode.slice(0, 2) + '0000' : '');

  // 直辖市
  const MUNICIPALITY = ['110000', '120000', '500000', '310000'];

  const { data: provinceData = [] } = useFetch({
    request: _getCode,
    query: {
      codeType: 'address_type',
      parentCodeKey: '-1',
    },
  });

  const { data: cityData = [] } = useFetch({
    request: _getCode,
    query: {
      codeType: 'address_type',
      parentCodeKey: provinceCode,
    },
    depends: [provinceCode],
  });

  return (
    <>
      <Row>
        <Col>
          <Select
            style={{ marginRight: 20 }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            onChange={(value: any) => {
              setProvinceCode(value);
              MUNICIPALITY.includes(value) ? setCityCode(value) : setCityCode('');
            }}
            value={provinceCode}
          >
            {provinceData.map((x: any) => {
              return (
                <Option key={x.value} value={x.value}>
                  {x.text}
                </Option>
              );
            })}
          </Select>
        </Col>

        {!MUNICIPALITY.includes(provinceCode) && (
          <Col>
            <Select
              style={{ marginRight: 20 }}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              onChange={(value: any) => {
                setCityCode(value);
              }}
              value={cityCode}
            >
              {cityData.map((x: any) => {
                return (
                  <Option key={x.value} value={x.value}>
                    {x.text}
                  </Option>
                );
              })}
            </Select>
          </Col>
        )}
      </Row>
    </>
  );
}
