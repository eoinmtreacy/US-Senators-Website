import senators from "./data/senators.js";
// filter function will accept filterType variables
// condense JSON into only the elements we need

document.addEventListener("DOMContentLoaded", async () => {
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
