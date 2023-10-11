import senators from "./data/senators.js";

class FilterOptions {
  constructor() {
    this.rank = new Set();
    this.gender = new Set();
    this.state = new Set();
    this.party = new Set();
  }

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
  const FILTER_LIST = filter();
  const FILTER_OPTIONS = loadFilterOptions();
  const currentFilter = new FilterOptions();

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

export function filter(filterOptionsObj) {
  let output = [];
  senators.objects.forEach((senator) => {
    if (
      filterOptionsObj.rank.has(senator.senator_rank) ||
      filterOptionsObj.gender.has(senator.person.gender_label) ||
      filterOptionsObj.state.has(senator.state) ||
      filterOptionsObj.party.has(senator.party)
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
