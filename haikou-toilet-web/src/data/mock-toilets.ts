// src/data/mock-toilets.ts

/**
 * 定义“公共厕所”对象的核心数据结构。
 * 这个接口（Interface）被项目中的多个文件共享，以确保数据类型的一致性。
 */
export interface Toilet {
  // 数据库生成的唯一ID
  _id: string;
  // 厕所的官方名称
  name: string;
  // 厕所的详细街道地址
  address: string;
  // 地理位置信息，遵循 GeoJSON 标准，便于数据库进行地理空间查询
  location: {
    type: "Point";
    // 坐标数组：[经度, 纬度]
    coordinates: [number, number];
  };
  // 描述厕所设施属性的对象
  properties: {
    // 是否24小时开放
    isOpen24h: boolean;
    // 是否有无障碍设施
    isAccessible: boolean;
    // 是否有母婴室
    hasBabyCare: boolean;
  };
  // 开放时间的文字描述，例如 "07:00 - 22:00"，可选属性
  openingHours?: string;
  // 数据最后更新时间的时间戳字符串，可选属性
  updatedAt?: string;
}