# import requests
# import json
# import time
# import certifi # 1. 导入 certifi 库

# # ==================== 配置区 ====================
# # 密钥已被隐藏，请确保你使用的是自己的有效Key
# AMAP_KEY = "ceb210ea3eeef1588a689e2681aaa535" 
# CITY_NAME = "海口"
# KEYWORDS = "公共厕所"
# OUTPUT_FILE = "haikou_toilets.json"
# # ===============================================

# SEARCH_API_URL = "https://restapi.amap.com/v3/place/text"
# PAGE_SIZE = 50

# def search_pois_by_page(page_num):
#     """根据页码发起POI搜索请求"""
#     params = {
#         'key': AMAP_KEY,
#         'keywords': KEYWORDS,
#         'city': CITY_NAME,
#         'citylimit': True,
#         'offset': PAGE_SIZE,
#         'page': page_num,
#         'output': 'json'
#     }
#     try:
#         # 2. 在请求时，使用 certifi 提供的证书路径进行验证
#         # response = requests.get(SEARCH_API_URL, params=params, verify=certifi.where())
#         response = requests.get(SEARCH_API_URL, params=params, verify=False)
#         response.raise_for_status()
#         data = response.json()
#         if data['status'] == '1':
#             return data
#         else:
#             # 打印更详细的错误信息，便于调试
#             print(f"API返回错误: {data.get('info', '未知错误')}, InfoCode: {data.get('infocode', 'N/A')}")
#             return None
#     except requests.exceptions.RequestException as e:
#         print(f"网络请求出错: {e}")
#         return None

# def main():
#     """主函数，用于获取所有数据并保存"""
#     if AMAP_KEY == "在这里粘贴你的Web服务API Key":
#         print("错误：请先在代码中配置你的高德API Key！")
#         return

#     print(f"开始获取 '{CITY_NAME}' 的 '{KEYWORDS}' 数据...")
    
#     all_toilets = []
#     current_page = 1
#     total_count = -1

#     while True:
#         print(f"正在获取第 {current_page} 页...")
        
#         data = search_pois_by_page(current_page)
        
#         if not data:
#             # 增加对无效Key的判断
#             if data and data.get('infocode') == '10001':
#                  print("错误：API Key无效或过期，请检查你的Key。")
#             else:
#                  print("获取数据失败，脚本终止。")
#             break

#         if total_count == -1:
#             total_count = int(data['count'])
#             if total_count == 0:
#                 print("未找到任何相关数据。")
#                 break
#             print(f"查询成功，总计约 {total_count} 条数据。")

#         pois = data.get('pois', [])
#         if not pois:
#             print("当前页没有更多数据，获取完成。")
#             break

#         for poi in pois:
#             location_parts = poi.get('location', '0,0').split(',')
#             longitude = float(location_parts[0])
#             latitude = float(location_parts[1])

#             toilet_info = {
#                 'id': poi.get('id'),
#                 'name': poi.get('name'),
#                 'address': poi.get('address'),
#                 'location': {
#                     'type': 'Point',
#                     'coordinates': [longitude, latitude]
#                 }
#             }
#             all_toilets.append(toilet_info)

#         current_page += 1
#         time.sleep(0.1)

#     if all_toilets:
#         with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
#             json.dump(all_toilets, f, ensure_ascii=False, indent=4)
#         print(f"\n成功！所有数据已保存到文件: {OUTPUT_FILE}")
#         print(f"共获取到 {len(all_toilets)} 条厕所数据。")

# if __name__ == '__main__':
#     main()
import requests
import json
import time
from typing import Union # <-- 1. 添加这行导入 Union
# import certifi # If you need strict SSL verification, uncomment this and use certifi.where()

# ==================== 配置区 ====================
# 请确保你使用的是自己的有效Web服务API Key
AMAP_KEY = "ceb210ea3eeef1588a689e2681aaa535"
CITY_NAME = "海口"
KEYWORDS = "公共厕所"
OUTPUT_FILE = "haikou_toilets.json"
# ===============================================

SEARCH_API_URL = "https://restapi.amap.com/v3/place/text"
PAGE_SIZE = 50 # 每页获取的数据量

# 修改了这里的类型提示： dict | None -> Union[dict, None]
def search_pois_by_page(page_num: int) -> Union[dict, None]: # <-- 2. 修改这里
    """
    根据页码发起POI（Point of Interest）搜索请求。

    Args:
        page_num: 要请求的页码。

    Returns:
        包含POI数据的字典，如果请求失败则返回None。
    """
    params = {
        'key': AMAP_KEY,
        'keywords': KEYWORDS,
        'city': CITY_NAME,
        'citylimit': True,
        'offset': PAGE_SIZE, # 每页记录数，高德API建议值
        'page': page_num,   # 当前页码
        'output': 'json'
    }
    try:
        # 默认情况下 requests 会进行SSL验证。如果你遇到SSL证书问题，
        # 并且确定风险可控，可以加上 verify=False（不推荐），
        # 或者使用 verify=certifi.where() 进行更严格的验证（需要安装certifi库）
        # response = requests.get(SEARCH_API_URL, params=params)
        response = requests.get(SEARCH_API_URL, params=params, verify=False)
        response.raise_for_status() # 对4xx或5xx状态码抛出HTTPError异常
        data = response.json()

        if data['status'] == '1':
            return data
        else:
            # 打印高德API返回的详细错误信息
            print(f"高德API返回错误: {data.get('info', '未知错误')}, InfoCode: {data.get('infocode', 'N/A')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"网络请求出错或API响应异常: {e}")
        return None

def main():
    """
    主函数，用于获取指定城市的所有公共厕所数据并保存为JSON文件。
    数据结构会适配之前定义的 `Toilet` 接口。
    """
    if AMAP_KEY == "在这里粘贴你的Web服务API Key" or not AMAP_KEY:
        print("错误：请先在代码中配置你的高德Web服务API Key！")
        return

    print(f"🚀 开始获取 '{CITY_NAME}' 的 '{KEYWORDS}' 数据...")

    all_toilets = []
    current_page = 1
    total_count = -1

    while True:
        print(f"➡️ 正在获取第 {current_page} 页数据...")

        data = search_pois_by_page(current_page)

        if not data:
            # 检查是否因为API Key无效导致的问题
            if data is not None and data.get('infocode') == '10001':
                 print("⛔ 错误：高德API Key无效或已过期，请检查你的Key。")
            else:
                 print("❌ 获取数据失败，脚本终止。")
            break

        # 首次请求时获取总数
        if total_count == -1:
            total_count = int(data.get('count', 0))
            if total_count == 0:
                print("🤷‍♀️ 未找到任何相关数据。")
                break
            print(f"✅ 查询成功，总计约 {total_count} 条数据。")

        pois = data.get('pois', [])
        if not pois: # 当前页没有POI数据，说明已获取完毕或无更多数据
            print("🎉 当前页没有更多数据，所有数据获取完成。")
            break

        for poi in pois:
            # 提取经纬度
            location_parts = poi.get('location', '0,0').split(',')
            try:
                longitude = float(location_parts[0])
                latitude = float(location_parts[1])
            except (ValueError, IndexError):
                print(f"⚠️ 警告：无法解析POI '{poi.get('name', '未知')}' 的位置信息。跳过。")
                continue

            # 尝试从 tags 或其他字段推断属性
            # 高德POI数据通常不直接包含 isOpen24h, isAccessible, hasBabyCare 等布尔属性。
            # 这里我们根据常见POI tag进行简单的推断，实际应用可能需要更复杂的逻辑或手动标注。
            tags = poi.get('tag', '').lower() # 获取并转为小写
            type_description = poi.get('type', '').lower()

            # 假设性推断：
            is_open_24h = "24小时" in tags or "24h" in type_description
            is_accessible = "无障碍" in tags or "无障碍设施" in tags or "残疾人" in tags
            has_baby_care = "母婴室" in tags or "育婴" in tags or "哺乳" in tags

            # 构建符合 Toilet 接口的数据结构
            toilet_info = {
                '_id': poi.get('id', ''), # 使用高德POI的ID作为_id
                'name': poi.get('name', '未知厕所'),
                'address': poi.get('address', '无详细地址'),
                'location': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude]
                },
                'properties': {
                    'isOpen24h': is_open_24h,
                    'isAccessible': is_accessible,
                    'hasBabyCare': has_baby_care
                },
                'openingHours': poi.get('biz_ext', {}).get('open_time', None), # 尝试获取开放时间
                'updatedAt': time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) # 使用当前UTC时间作为更新时间
            }
            all_toilets.append(toilet_info)

        current_page += 1
        # 增加延迟以避免频繁请求导致IP被封，高德API有请求频率限制
        time.sleep(0.2)

    if all_toilets:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_toilets, f, ensure_ascii=False, indent=4)
        print(f"\n✨ 成功！所有 {len(all_toilets)} 条厕所数据已保存到文件: {OUTPUT_FILE}")
    else:
        print("\n😔 没有获取到任何厕所数据。")

if __name__ == '__main__':
    main()