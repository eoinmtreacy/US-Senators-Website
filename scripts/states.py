import json

with open('./data/senators.json', encoding="utf-8") as f:
  sen = json.load(f)

states = {}

for s in sen["objects"]:
#   states.append(s["state"])
  chunk = s["description"].split()
  states[s.state] = chunk[-1]

print(states)
