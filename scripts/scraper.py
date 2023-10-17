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

imgSources = []

urlTest = urls[0:3]

# for url in urlTest:
#   response = requests.get(url)
#   html = response.text
#   soup = BeautifulSoup(html, "html.parser")
#   imgs = soup.find_all("img", {"class": "img-fluid"})
#   src = "https://www.govtrack.us" + imgs[0].get("src")
#   imgSources.append(src)

# res = dict(zip(ids, imgSources))

# out_file = open("./data/imgSouces.json", "w")
# json.dump(res, out_file, indent = "")
# out_file.close()

for u in urlTest:
  print(u)