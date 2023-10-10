import json

with open('senators.json', encoding="utf-8") as f:
  sen = json.load(f)

bioguideids = []

for s in sen["objects"]:
  bioguideids.append(s["person"]["bioguideid"])

