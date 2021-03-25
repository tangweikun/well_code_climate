/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { APILoader, useMap, useDrawingManager, useMapTypeControl } from '@uiw/react-baidu-map';

// 地理位置
type TLocation = {
  lng: number;
  lat: number;
};

type TProps = {
  setDrawPaths: Function;
  center?: TLocation;
};

const offset = new BMap.Size(60, 10);

export default function DrawVehicleTrajectoryMap(props: TProps) {
  const { setDrawPaths, center } = props;

  const styleOptions = {
    strokeColor: 'red', // 边线颜色。
    fillColor: 'red', // 填充颜色。当参数为空时，圆形将没有填充效果。
    strokeWeight: 3, // 边线的宽度，以像素为单位。
    strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
    fillOpacity: 0.6, // 填充的透明度，取值范围0 - 1。
    strokeStyle: 'solid', // 边线的样式，solid或dashed。
  };

  const divElm: any = useRef(null);

  const mapConfig: any = {
    zoom: 16,
    enableScrollWheelZoom: true,
    autoLocalCity: isEmpty(center),
    enableMapClick: false,
    widget: ['GeolocationControl', 'NavigationControl'],
  };

  if (center) {
    Object.assign(mapConfig, { center });
  }

  const { setContainer, map } = useMap(mapConfig);

  const { drawingManager } = useDrawingManager({
    map,
    isOpen: false, // 是否开启绘制模式
    enableDrawingTool: true, // 是否显示工具栏

    drawingToolOptions: {
      anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
      offset: new BMap.Size(5, 5), // 偏离值
      drawingModes: ['polygon'],
    },
    circleOptions: styleOptions, // 圆的样式
    polylineOptions: styleOptions, // 线的样式
    polygonOptions: styleOptions, // 多边形的样式
    rectangleOptions: styleOptions, // 矩形的样式
  });

  useMapTypeControl({
    map,
    anchor: BMAP_NAVIGATION_CONTROL_LARGE,
    mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP],
    offset,
  });

  useEffect(() => {
    if (divElm.current && !map) {
      setContainer(divElm.current);
    }
  }, [map]);

  useEffect(() => {
    drawingManager?.addEventListener('overlaycomplete', function (e) {
      setDrawPaths(e.overlay.getPath());
    });
  }, [drawingManager]);

  return (
    <div style={{ width: '100%', height: '450px' }}>
      {/* 高度450pxModal刚好不出高度进度条可更好完成电子围栏的绘制*/}
      <APILoader akay="GTrnXa5hwXGwgQnTBG28SHBubErMKm3f">
        <div ref={divElm} style={{ height: '100%' }} />
      </APILoader>
    </div>
  );
}
