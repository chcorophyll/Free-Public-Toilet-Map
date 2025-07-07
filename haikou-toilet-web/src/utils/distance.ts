// src/utils/distance.ts

/**
 * 使用 Haversine 公式计算两个经纬度坐标之间的距离。
 * @param lat1 第一个点的纬度
 * @param lon1 第一个点的经度
 * @param lat2 第二个点的纬度
 * @param lon2 第二个点的经度
 * @returns 格式化后的距离字符串，例如 "520m" 或 "1.5km"
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // 地球半径，单位：千米
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // 计算出的距离，单位是千米

  // 根据距离大小返回不同单位的格式化字符串
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`; // 小于1公里，显示米
  } else {
    return `${distance.toFixed(1)}km`; // 大于等于1公里，显示公里，保留一位小数
  }
}