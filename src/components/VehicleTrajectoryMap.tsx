/* eslint-disable react-hooks/exhaustive-deps */
// 车辆轨迹地图
import React, { useRef, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Map, Polyline, Polygon, APILoader, MapTypeControl } from '@uiw/react-baidu-map';

export default function VehicleTrajectoryMap(props: any) {
  const { paths, center, zoom = 16, isTeachingJournal = false, mapType = 'Polygon' } = props;
  const colors = [
    '#C7000B ',
    '#0A824A',
    '#FF9966',
    '#00CC99',
    '#C79426',
    '#00CCFF',
    '#C7000B',
    '#9999FF',
    '#D7470E',
    '#3333FF',
  ];
  const otherProps = {};
  if (!isEmpty(center)) {
    Object.assign(otherProps, { center });
  }

  const mapRef: any = useRef(null);
  useEffect(() => {
    if (mapRef.current && mapRef.current.map) {
      const map = mapRef.current.map;
      if (paths.length === 0) {
        map.clearOverlays();
      }
      if (paths.length === 1 && isTeachingJournal) {
        map.clearOverlays();
        let drawMap;
        if (mapType === 'Polygon') {
          drawMap = new BMap.Polygon(paths[0], { strokeColor: '#C7000B', strokeWeight: 6, strokeOpacity: 0.5 });
        }

        if (mapType === 'Polygon') {
          drawMap = new BMap.Polygon(paths[0], { strokeColor: '#C7000B', strokeWeight: 6, strokeOpacity: 0.5 });
        }

        map.addOverlay(drawMap);
      } else {
        setTimeout(function () {
          map.setZoom(zoom); // setZoom 方法，负责设置级别，只有停留几秒，才能看到效果
        }, 0);
      }
    }
  }, [paths]);

  return (
    <>
      <APILoader akay="GTrnXa5hwXGwgQnTBG28SHBubErMKm3f">
        <Map
          ref={mapRef}
          autoLocalCity={isEmpty(center)}
          zoom={zoom}
          widget={['NavigationControl']}
          enableScrollWheelZoom
          enableMapClick={false}
          {...otherProps}
        >
          <MapTypeControl
            offset={new BMap.Size(60, 10)}
            mapTypes={[BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP]}
          />
          {mapType === 'Polygon' &&
            paths.map((x: any, index: number) => <Polygon key={index} path={x} strokeColor={colors[index % 10]} />)}

          {mapType === 'Polyline' &&
            paths.map((x: any, index: number) => <Polyline key={index} path={x} strokeColor={colors[index % 10]} />)}
        </Map>
      </APILoader>
    </>
  );
}
