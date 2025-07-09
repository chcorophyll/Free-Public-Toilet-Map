// src/utils/distance.ts

/**
 * 计算两个经纬度坐标之间的距离。
 * @returns {number} 距离，单位是公里(km)。
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半径，单位 km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // 距离，单位 km
  return distance;
}

/**
 * 将以公里为单位的距离格式化为用户友好的字符串。
 * @param distanceInKm {number} - 以公里为单位的距离。
 * @returns {string} 格式化后的字符串，例如 "520m" 或 "1.5km"。
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  } else {
    return `${distanceInKm.toFixed(1)}km`;
  }
}
