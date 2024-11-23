import requests


input = "Wii Fit"

url = "http://127.0.0.1:8000/get-info"  # Update with your API's URL
data = {"name": f"{input}"}

response = requests.post(url, json=data)
print(response.json())

# input = "E.T. the Extra-Terrestrial"

# url = "http://127.0.0.1:80/get-games"  # Update with your API's URL
# data = {"name": f"{input}"}

# response = requests.post(url, json=data)
# print(response.json())
