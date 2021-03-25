/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Input } from 'antd';

// 地理位置
type TLocation = {
  lng: number;
  lat: number;
};

type TProps = {
  center?: TLocation;
};

export default function Foo(props: any) {
  const { callback, value, setValue } = props;

  useEffect(() => {
    var map = new BMap.Map('l-map');
    // 创建地图实例
    var point = new BMap.Point(116.404, 39.915);
    // 创建点坐标
    map.centerAndZoom(point, 16);

    function G(id: any): any {
      return document.getElementById(id);
    }

    var ac: any = new BMap.Autocomplete({ input: 'suggestId', location: map }); //建立一个自动完成的对象

    var myValue: any;
    ac.addEventListener('onconfirm', function (e: any) {
      //鼠标点击下拉列表后的事件

      var _value = e.item.value;
      myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
      G('searchResultPanel').innerHTML = 'onconfirm<br />index = ' + e.item.index + '<br />myValue = ' + myValue;
      setValue(myValue);
      setPlace();

      function setPlace() {
        map.clearOverlays(); //清除地图上所有覆盖物
        function myFun() {
          var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
          map.centerAndZoom(pp, 16);
          callback(pp);
          map.addOverlay(new BMap.Marker(pp)); //添加标注
        }
        var local: any = new BMap.LocalSearch(map, {
          //智能搜索
          onSearchComplete: myFun,
        });
        local.search(myValue);
      }
    });
  }, []);

  return (
    <>
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        id="suggestId"
        value={value}
        style={{ width: '100%' }}
      />
      <div
        id="searchResultPanel"
        style={{
          border: '1px solid #c0c0c0',
          width: 150,
          height: 'auto',
          display: 'none',
          zIndex: 1000,
          position: 'relative',
        }}
      ></div>
      <div id="l-map" style={{ height: 0 }}></div>
    </>
  );
}
