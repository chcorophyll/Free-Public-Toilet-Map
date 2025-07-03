// src/data/mock-toilets.ts

// 定义 Toilet 类型，与我们的 API 规范一致
export interface Toilet {
  _id: string;
  name: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [经度, 纬度]
  };
  properties: {
    isOpen24h: boolean;
    isAccessible: boolean;
    hasBabyCare: boolean;
  };
}

// 模拟的厕所数据数组
export const mockToilets: Toilet[] = [
  {
    _id: "mock1",
    name: "海大南门模拟公厕",
    address: "模拟地址：人民大道58号",
    location: { type: "Point", coordinates: [110.3496, 20.0617] },
    properties: { isOpen24h: true, isAccessible: true, hasBabyCare: false }
  },
  {
    _id: "mock2",
    name: "世纪大桥模拟公厕",
    address: "模拟地址：世纪大桥下",
    location: { type: "Point", coordinates: [110.318, 20.048] },
    properties: { isOpen24h: false, isAccessible: true, hasBabyCare: true }
  },
  {
    _id: "mock3",
    name: "万绿园模拟公厕",
    address: "模拟地址：公园内部",
    location: { type: "Point", coordinates: [110.301, 20.035] },
    properties: { isOpen24h: false, isAccessible: false, hasBabyCare: false }
  }
];