// src/utils/navigation.ts

import { Toilet } from '@/data/mock-toilets';

/**
 * 打开高德地图进行步行导航。
 * @param startCoords - 起点坐标 [纬度, 经度] | null
 * @param endToilet - 终点厕所对象
 */
export function openAmapNavigation(
  startCoords: [number, number] | null,
  endToilet: Toilet | null
) {
  // 检查起点和终点是否存在
  if (!startCoords) {
    alert("无法获取您的当前位置，无法开启导航。请检查定位权限。");
    return;
  }
  if (!endToilet) {
    console.error("目标厕所信息不存在。");
    return;
  }

  // 从参数中提取经纬度
  const [startLat, startLon] = startCoords;
  const [endLon, endLat] = endToilet.location.coordinates;
  
  // 对终点名称进行URL编码，防止特殊字符导致链接失效
  const endName = encodeURIComponent(endToilet.name);

  // 构建高德地图步行导航的 URL Scheme
  // from=[经度],[纬度],[名称]
  // to=[经度],[纬度],[名称]
  const url = `https://uri.amap.com/navigation?from=${startLon},${startLat},我的位置&to=${endLon},${endLat},${endName}&mode=walk&src=hainan-toilet-map`;

  // 在新标签页中打开链接，移动设备会自动尝试唤起高德地图App
  window.open(url, '_blank');
}