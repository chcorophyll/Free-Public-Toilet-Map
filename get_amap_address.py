import requests
import json

def get_address_from_coordinates(coordinates_list, api_key):
    """
    使用高德地图逆地理编码API，从经纬度列表中获取地址信息。

    参数:
        coordinates_list (list): 包含 [经度, 纬度] 对的列表。
        api_key (str): 你的高德Web服务API Key。

    返回:
        list: 一个字典列表，每个字典包含原始坐标及其格式化后的地址（或错误信息）。
    """
    # 高德逆地理编码API的基础URL
    base_url = "https://restapi.amap.com/v3/geocode/regeo"
    
    # 将输入的经纬度列表格式化为API所需的字符串格式：
    # "经度1,纬度1|经度2,纬度2|..."，用于批量查询
    location_string = "|".join([f"{lon},{lat}" for lon, lat in coordinates_list])

    # API请求参数
    params = {
        "key": api_key,          # 你的高德API Key
        "location": location_string, # 经纬度坐标字符串
        "output": "json",        # 返回数据格式为JSON
        "batch": "true",         # 启用批量查询模式
        # extensions 参数：
        # 'base'：只返回地址信息（默认值）
        # 'all'：返回地址信息、周边POI（兴趣点）和AOI（区域）信息
        "extensions": "base" 
    }

    try:
        # 发送HTTP GET请求到高德API
        response = requests.get(base_url, params=params)
        # 检查HTTP响应状态码，如果不是200，则抛出HTTPError异常
        response.raise_for_status() 
        # 将JSON响应体解析为Python字典
        data = response.json()

        results = []
        # 检查API响应状态和是否有逆地理编码结果
        if data.get("status") == "1" and data.get("regeocodes"):
            # 遍历regeocodes列表，获取每个坐标的地址信息
            for i, regeocode in enumerate(data["regeocodes"]):
                original_coords = coordinates_list[i] # 原始坐标
                # 获取格式化后的地址，如果不存在则显示“地址未找到”
                formatted_address = regeocode.get("formatted_address", "地址未找到")
                results.append({
                    "coordinates": original_coords,
                    "address": formatted_address
                })
        else:
            # 处理API返回的错误信息
            print(f"高德API错误: {data.get('info', '未知错误')}")
            for coords in coordinates_list:
                results.append({
                    "coordinates": coords,
                    "address": f"错误: {data.get('info', '未知API错误')}"
                })
        return results

    # 异常处理：捕获不同类型的请求错误
    except requests.exceptions.HTTPError as e:
        print(f"发生HTTP错误: {e}")
        return [{
            "coordinates": coords,
            "address": f"HTTP错误: {e}"
        } for coords in coordinates_list]
    except requests.exceptions.ConnectionError as e:
        print(f"发生连接错误: {e}")
        return [{
            "coordinates": coords,
            "address": f"连接错误: {e}"
        } for coords in coordinates_list]
    except requests.exceptions.Timeout as e:
        print(f"发生请求超时: {e}")
        return [{
            "coordinates": coords,
            "address": f"请求超时: {e}"
        } for coords in coordinates_list]
    except requests.exceptions.RequestException as e:
        print(f"发生未知请求错误: {e}")
        return [{
            "coordinates": coords,
            "address": f"未知请求错误: {e}"
        } for coords in coordinates_list]

# --- 你的数据 ---
# 注意: 高德API的location参数是 [经度, 纬度] 的顺序
my_coordinates = [
    [110.313141, 20.033586],
    [110.15553, 20.05096],
    [110.350396, 20.034733],
    [110.298882, 19.702901],
    [110.363983, 20.030725]
]

# --- 重要提示: 请将 'YOUR_GAODE_API_KEY' 替换为你实际的高德Web服务API Key ---
# 你可以在高德开放平台 (lbs.amap.com) 注册并创建应用后获取。
# GAODE_API_KEY = "YOUR_GAODE_API_KEY" 
GAODE_API_KEY = "ceb210ea3eeef1588a689e2681aaa535" 

if GAODE_API_KEY == "YOUR_GAODE_API_KEY":
    print("警告: 请将 'YOUR_GAODE_API_KEY' 替换为你的实际高德API Key。")
    print("你需要从 lbs.amap.com 获取一个高德Web服务API Key 才能运行此脚本。")
else:
    print("正在获取地址信息...")
    addresses = get_address_from_coordinates(my_coordinates, GAODE_API_KEY)

    print("\n--- 结果 ---")
    for item in addresses:
        print(f"坐标: {item['coordinates']}")
        print(f"地址: {item['address']}")
        print("-" * 30)