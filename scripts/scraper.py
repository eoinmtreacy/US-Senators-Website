import json
import requests
from bs4 import BeautifulSoup

with open('./data/senators.json', encoding="utf-8") as f:
  sen = json.load(f)

urls = []
ids = []

for s in sen["objects"]:
  url = s["person"]["link"]
  urls.append(url)
  id = s["person"]["bioguideid"]
  ids.append(id)

imgSource = []

for url in urls:
  response = requests.get(url)
  html = response.text
  soup = BeautifulSoup(html, "html.parser")
  img = soup.find_all("img", {"class": "img-fluid"})
  src = "https://www.govtrack.us" + img[0].get("src")
  imgSource.append(src)
  print(src)

res = {}

for id in ids:
  res[id] = imgSource[ids.index(id)]

out_file = open("./data/imgSources.json", "w") 
   
json.dump(res, out_file, indent = "") 
   
out_file.close() 