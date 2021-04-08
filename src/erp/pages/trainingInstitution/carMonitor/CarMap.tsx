/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { _get } from 'utils';
import { Map, InfoWindow, APILoader, Label, Control } from '@uiw/react-baidu-map';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { findDOMNode } from 'react-dom';
import screenfull from 'screenfull';

export default function CarMap(props: any) {
  const { mapData, carHash, mapKey, currentRecord, isMonitor = false } = props;
  const [currentMark, setCurrentMark] = useState({}) as any;
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoLocalCity, setIsAutoLocalCity] = useState(mapData.length === 0);
  const [centerPoint, setCenterPoint] = useState() as any;
  const mapRef = useRef(null);
  const [screenText, setScreenText] = useState('全屏');

  let screen = screenfull as any;

  useEffect(() => {
    if (screen.isFullscreen) {
      return setScreenText('退出全屏');
    }
    setScreenText('全屏');
  }, [screen.isFullscreen]);
  useEffect(() => {
    if (_get(currentRecord, 'lon', '') && _get(currentRecord, 'lat', '')) {
      setCenterPoint({
        lng: _get(currentRecord, 'lon', ''),
        lat: _get(currentRecord, 'lat', ''),
      });
    }
  }, [_get(currentRecord, 'lon', ''), _get(currentRecord, 'lat', '')]);

  useEffect(() => {
    if (mapData.length > 0) {
      setCenterPoint({
        lng: _get(mapData, '0.lon', ''),
        lat: _get(mapData, '0.lat', ''),
      });
      setIsAutoLocalCity(false);
    }
  }, [_get(mapData, '0.lon'), _get(mapData, '0.lat', '')]);

  useEffect(() => {
    if (mapKey === 'empty') {
      setIsAutoLocalCity(true);
    }
  }, [mapKey]);

  useEffect(() => {
    transAddress(_get(currentMark, 'lon', ''), _get(currentMark, 'lat', ''));
  }, [currentMark.carid]);

  function transAddress(lat: number, lng: number) {
    let myGeo = new BMap.Geocoder();
    // 根据坐标得到地址描述
    myGeo.getLocation(new BMap.Point(lat, lng), function (result) {
      if (result) {
        setCurrentMark({ ...currentMark, address: result.address });
      }
    });
  }

  // FIXME: 解决ts校验问题
  const CustomLabel: any = Label;

  const CarMap: any = Map;

  const titleStyle = 'width:60px;display:inline-block;text-align:right';

  return (
    <div className="mb20 full-width " style={isMonitor ? { height: 680 } : { height: 500 }}>
      <APILoader akay="GTrnXa5hwXGwgQnTBG28SHBubErMKm3f" ref={mapRef}>
        <>
          <CarMap
            zoom={13}
            enableScrollWheelZoom
            autoLocalCity={isAutoLocalCity}
            enableMapClick={false}
            center={centerPoint}
            key={mapKey}
          >
            {/* FIXME:临时方案 */}
            {mapKey === 'empty'
              ? []
              : mapData.map((item: any, index: any) => {
                  return (
                    <CustomLabel
                      onClick={() => {
                        setIsOpen(false);
                        setCurrentMark(item);
                        setIsOpen(true);
                      }}
                      key={index}
                      content={isMonitor ? _get(item, 'CarLicence', '') : carHash[_get(item, 'carid', '')]}
                      style={{ color: PRIMARY_COLOR, fontSize: '16px', fontWeight: 'bold' }}
                      position={{ lng: _get(item, 'lon', ''), lat: _get(item, 'lat', '') }}
                    />
                  );
                })}
            {!isMonitor && (
              <InfoWindow
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                position={{ lng: _get(currentMark, 'lon', ''), lat: _get(currentMark, 'lat', '') }}
                content={`
                    <div><label style="${titleStyle}">培训科目：</label>${_get(currentMark, 'examname', '')}<div>
                    <div><label style="${titleStyle}">教练员：</label>${_get(currentMark, 'coaname', '')}<div>
                    <div><label style="${titleStyle}">学员：</label>${_get(currentMark, 'stuname', '')}<div>
                    <div><label style="${titleStyle}">经纬度：</label> ${_get(currentMark, 'lon', '')},${_get(
                  currentMark,
                  'lat',
                  '',
                )} <div>
                    <div><label style="${titleStyle}">速度：</label>${_get(currentMark, 'gps_speed', '')}<div>
                    <div><label style="${titleStyle}">时间：</label>${_get(currentMark, 'gpstime', '')}<div>
                    <div><label style="${titleStyle}">地址：</label>${_get(currentMark, 'address', '')}<div>
                `}
                width={320}
                title={`<div class='bold'>${carHash[_get(currentMark, 'carid', '')]}<div>`}
              />
            )}
            {isMonitor && (
              <Control anchor={BMAP_ANCHOR_BOTTOM_RIGHT}>
                <div
                  style={{
                    background: 'gray',
                    padding: '10px',
                    fontSize: 12,
                    display: 'inline-block',
                    color: '#ffffff',
                  }}
                  onClick={() => {
                    const instanceMap = mapRef.current;

                    if (instanceMap) {
                      screen.toggle(findDOMNode(instanceMap));
                      if (!screen.isFullscreen) {
                        setScreenText('退出全屏');
                      } else {
                        setScreenText('全屏');
                      }
                    }
                  }}
                >
                  {screenText}
                </div>
              </Control>
            )}
          </CarMap>
        </>
      </APILoader>
    </div>
  );
}
