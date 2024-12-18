import requests


input = "Wii Fit"

url = "http://127.0.0.1:8000/sort-games"  # Update with your API's URL
data = {"availability": 100,
        "algorithm": 0,
        "user_id": 1}

response = requests.post(url, json=data)
print(response.json())

# input = "E.T. the Extra-Terrestrial"

# url = "http://127.0.0.1:80/get-games"  # Update with your API's URL
# data = {"name": f"{input}"}

# response = requests.post(url, json=data)
# print(response.json())


# url = "http://127.0.0.1:8000/register-library"
# data = {"user_id": 1, "game_id": 2186}

# crt_acc_req = requests.post(url, json=data)
# print(crt_acc_req.json())

# [(1, 1011, 'wilki', 'Borderlands 2', 83.95323371904513, 1639, '94379', '[5, 12]', '[3, 6, 9, 12, 14, 34, 46, 48, 49, 130]', 202800), (1, 2181, 'wilki', 'Wii Sports', 75.25894294402642, 354, '180734', '[13, 14]', '[5]', 0)]