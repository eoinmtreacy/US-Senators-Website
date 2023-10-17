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

urlTest = urls[0:2]
idsTest = ids[0:2]

imgSource = []

for url in urlTest:
  response = requests.get(url)
  html = response.text
  soup = BeautifulSoup(html, "html.parser")
  img = soup.find_all("img", {"class": "img-fluid"})
  src = "https://www.govtrack.us" + img[0].get("src")
  imgSource.append(src)

res = {}
for key in idsTest:
    for img in imgSource:
        res[key] = img
        break
 
# Printing resultant dictionary
print("Resultant dictionary is : " + str(res))