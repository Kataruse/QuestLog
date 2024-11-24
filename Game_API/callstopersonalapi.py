import requests


input = "Overwatch 2"

url = "http://127.0.0.1:8000/get-info"  # Update with your API's URL
data = {"name": f"{input}"}

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