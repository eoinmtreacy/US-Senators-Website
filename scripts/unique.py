# identify unique id for filtering

import json

with open('./data/senators.json', encoding="utf-8") as f:
  sen = json.load(f)

bioguideids = []

for s in sen["objects"]:
  bioguideids.append(s["person"]["bioguideid"])

isUnique = len(sen) == len(set(sen))

print(isUnique)
