import senators from "./data/senators.js";

// Class which represents the selected filters
// For each filter type (eg: rank), contains a set of the selected values (eg: "Junior", "Senior")
class FilterOptions {
  constructor() {
    this.rank = new Set();
    this.gender = new Set();
    this.state = new Set();
    this.party = new Set();
  }

  // When a user selects a new filter, we call this to update our stored filter values
  addFilter(type, value) {
    switch (type) {
      case "rank":
        this.rank.add(value);
        break;
      case "gender":
        this.gender.add(value);
        break;
      case "party":
        this.party.add(value);
        break;
      case "state":
        this.state.add(value);
        break;
      default:
        break;
    }
  }

  // When a user unselects a filter, we call this to update our stored filter values
  removeFilter(type, value) {
    switch (type) {
      case "rank":
        this.rank.delete(value);
        break;
      case "gender":
        this.gender.delete(value);
        break;
      case "party":
        this.party.delete(value);
        break;
      case "state":
        this.state.delete(value);
        break;
      default:
        break;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const FILTER_OPTIONS = loadFilterOptions();

  // TODO: this variable is not actually being used anywhere;
  // When we do start adding/removing filters, we can call
  // currentFilter.addFilter()/removeFilter()
  const currentFilter = new FilterOptions();

  /** DEMO PURPOSE ONLY BELOW **/
  let filteredList = filter(currentFilter);
  console.log(filteredList); // filter is empty, should return all senators
  currentFilter.addFilter("gender", "Female");
  filteredList = filter(currentFilter);
  console.log(filteredList); // Should only contain female senators
  /** END DEMO SECTION */
});

function loadFilterOptions() {
  var filterOptions = {
    party: new Set(),
    state: new Set(),
    rank: new Set(),
    gender: new Set(),
  };

  senators.objects.forEach((senator) => {
    filterOptions["party"].add(senator.party);
    filterOptions["state"].add(senator.state);
    filterOptions["rank"].add(senator.senator_rank);
    filterOptions["gender"].add(senator.person.gender);
  });

  return filterOptions;
}

// Function which takes in a FilterOptions object and returns a filtered
// array of senators filtered down based on the filters passed.
function filter(filterOptionsObj) {
  let output = [];
  senators.objects.forEach((senator) => {
    if (
      (filterOptionsObj.rank.has(senator.senator_rank) ||
        !filterOptionsObj.rank.size) &&
      (filterOptionsObj.gender.has(senator.person.gender_label) ||
        !filterOptionsObj.gender.size) &&
      (filterOptionsObj.state.has(senator.state) ||
        !filterOptionsObj.state.size) &&
      (filterOptionsObj.party.has(senator.party) ||
        !filterOptionsObj.party.size)
    ) {
      let item = new Object();
      item.id = senator.person.bioguideid;
      item.firstname = senator.person.firstname;
      item.secondname = senator.person.lastname;
      item.party = senator.party;
      item.state = senator.state;
      item.rank = senator.senator_rank;
      item.gender = senator.person.gender_label;
      output.push(item);
    }
  });
  return output;
}
