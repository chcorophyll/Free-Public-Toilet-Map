import requests
import json
import time
import certifi # 1. 导入 certifi 库

# ==================== 配置区 ====================
# 密钥已被隐藏，请确保你使用的是自己的有效Key
AMAP_KEY = "ceb210ea3eeef1588a689e2681aaa535" 
CITY_NAME = "海口"
KEYWORDS = "公共厕所"
OUTPUT_FILE = "haikou_toilets.json"
# ===============================================

SEARCH_API_URL = "https://restapi.amap.com/v3/place/text"
PAGE_SIZE = 50

def search_pois_by_page(page_num):
    """根据页码发起POI搜索请求"""
    params = {
        'key': AMAP_KEY,
        'keywords': KEYWORDS,
        'city': CITY_NAME,
        'citylimit': True,
        'offset': PAGE_SIZE,
        'page': page_num,
        'output': 'json'
    }
    try:
        # 2. 在请求时，使用 certifi 提供的证书路径进行验证
        # response = requests.get(SEARCH_API_URL, params=params, verify=certifi.where())
        response = requests.get(SEARCH_API_URL, params=params, verify=False)
        response.raise_for_status()
        data = response.json()
        if data['status'] == '1':
            return data
        else:
            # 打印更详细的错误信息，便于调试
            print(f"API返回错误: {data.get('info', '未知错误')}, InfoCode: {data.get('infocode', 'N/A')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"网络请求出错: {e}")
        return None

def main():
    """主函数，用于获取所有数据并保存"""
    if AMAP_KEY == "在这里粘贴你的Web服务API Key":
        print("错误：请先在代码中配置你的高德API Key！")
        return

    print(f"开始获取 '{CITY_NAME}' 的 '{KEYWORDS}' 数据...")
    
    all_toilets = []
    current_page = 1
    total_count = -1

    while True:
        print(f"正在获取第 {current_page} 页...")
        
        data = search_pois_by_page(current_page)
        
        if not data:
            # 增加对无效Key的判断
            if data and data.get('infocode') == '10001':
                 print("错误：API Key无效或过期，请检查你的Key。")
            else:
                 print("获取数据失败，脚本终止。")
            break

        if total_count == -1:
            total_count = int(data['count'])
            if total_count == 0:
                print("未找到任何相关数据。")
                break
            print(f"查询成功，总计约 {total_count} 条数据。")

        pois = data.get('pois', [])
        if not pois:
            print("当前页没有更多数据，获取完成。")
            break

        for poi in pois:
            location_parts = poi.get('location', '0,0').split(',')
            longitude = float(location_parts[0])
            latitude = float(location_parts[1])

            toilet_info = {
                'id': poi.get('id'),
                'name': poi.get('name'),
                'address': poi.get('address'),
                'location': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude]
                }
            }
            all_toilets.append(toilet_info)

        current_page += 1
        time.sleep(0.1)

    if all_toilets:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_toilets, f, ensure_ascii=False, indent=4)
        print(f"\n成功！所有数据已保存到文件: {OUTPUT_FILE}")
        print(f"共获取到 {len(all_toilets)} 条厕所数据。")

if __name__ == '__main__':
    main()