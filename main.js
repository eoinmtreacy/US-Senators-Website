import senators from "./data/senators.js";

document.addEventListener("DOMContentLoaded", async () => {
  const FILTER_LIST = filter()
  console.log(FILTER_LIST)
  const FILTER_OPTIONS = loadFilterOptions();
  // TODO: ISSUE13 - load into els
});

function loadFilterOptions() {
  var filterOptions = {
    party: new Set(),
    state: new Set(),
    rank: new Set(),
    gender: new Set(),
  };

  senators.objects.forEach(senator => {
    filterOptions["party"].add(senator.party);
    filterOptions["state"].add(senator.state);
    filterOptions["rank"].add(senator.senator_rank);
    filterOptions["gender"].add(senator.person.gender);
  })

  return filterOptions;
}

// filter function will accept filterType variables
// condense JSON into only the elements we need
// assignment details missing from brightspace, variables are placeholder

function filter(){
  let output = []
  senators.objects.forEach(senator => {
    let item = new Object()
    item.id = senator.person.bioguideid
    item.firstname = senator.person.firstname
    item.secondname = senator.person.lastname
    item.party = senator.party
    item.state = senator.state
    item.rank = senator.leadership_title // presume this is what the meant by role
    item.gender = senator.person.gender_label
    output.push(item)
  })
  return output
}
