import senators from "./data/senators.js";

// GLOBAL VARIABLES
const PARTY = "party";
const STATE = "state";
const RANK = "rank";
const GENDER = "gender";

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
  drawFilters(FILTER_OPTIONS);

  // TODO: this variable is not actually being used anywhere;
  // When we do start adding/removing filters, we can call
  // currentFilter.addFilter()/removeFilter()
  const currentFilter = new FilterOptions();

  /** DEMO PURPOSE ONLY BELOW **/
  let filteredList = filter(currentFilter);
  drawSummary(senators)
  // console.log(filteredList); // filter is empty, should return all senators
  // currentFilter.addFilter("gender", "Female");
  // filteredList = filter(currentFilter);
  // console.log(filteredList); // Should only contain female senators
  /** END DEMO SECTION */
});

function loadFilterOptions() {
  var filterOptions = {
    [PARTY]: new Set(),
    [STATE]: new Set(),
    [RANK]: new Set(),
    [GENDER]: new Set(),
  };

  senators.objects.forEach((senator) => {
    filterOptions[PARTY].add(senator.party);
    filterOptions[STATE].add(senator.state);
    filterOptions[RANK].add(senator.senator_rank);
    filterOptions[GENDER].add(senator.person.gender);
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

function drawFilters(filterOptions) {
  let filterContainer = document.getElementById("filter-container");
  Object.entries(filterOptions).forEach(([key, val]) => {
    let filterId = key;
    let filterOptions = val;

    // Create a label
    let filterLabelEl = document.createElement("label");
    filterLabelEl.setAttribute("for", filterId);
    filterLabelEl.innerText = capitalizeFirstLetter(filterId);

    // Create select
    let selectEl = document.createElement("select", { multiple: true });

    // Create options
    Array.from(filterOptions)
      .sort()
      .forEach((option) => {
        let optionEl = document.createElement("option", { value: option });
        optionEl.innerText = option;
        selectEl.appendChild(optionEl);
      });

    filterContainer.appendChild(filterLabelEl);
    filterContainer.appendChild(selectEl);
  });
}

// Utility functions
function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function drawSummary(senators)
{
  let dem = [0,[], "democrat"]
  let rep = [0,[], "republican"]
  let ind = [0,[], "independent"]

  senators.objects.forEach(s =>
    {
      if (s.party == "Republican")
      {
        rep[0]++
        if (s.leadership_title != null) {
          rep[1].push({name: s.person.name, role: s.leadership_title})
        }
      } else if (s.party == "Democrat")
      {
        dem[0]++
        if (s.leadership_title != null) {
          dem[1].push({name: s.person.name, role: s.leadership_title})
        }
      } else {
        ind[0]++
        if (s.leadership_title != null) {
          ind[1].push({name: s.person.name, role: s.leadership_title})
        }
      }
    })

  let parties = [dem, rep, ind]
  parties.forEach(party => {
    let partyBucket = document.createElement("div")
    partyBucket.setAttribute("id", `${party[2]}-container`)
    document.getElementById("summary-container").appendChild(partyBucket)
    let bucketTitle = document.createElement("div")
    bucketTitle.innerText = `${capitalizeFirstLetter(party[2])}: ${party[0]}`
    document.getElementById(`${party[2]}-container`).appendChild(bucketTitle)
    party[1].forEach(senator => {
      let leader = document.createElement("div")
      leader.innerText = `${senator.role}: ${senator.name.slice(0, -6)}`
      document.getElementById(`${party[2]}-container`).appendChild(leader)
    })
  }
  )

  // child.append = `
  //   <div id="democrat-summary">
  //     <div>Democrats:<span>10</span></div>
  //     <div>Senate Minority Leader: Chuck Schumer (Democrat)</div>
  //     <div>Senate Minority Leader: Chuck Schumer (Democrat)</div>
  //     <div>Senate Minority Leader: Chuck Schumer (Democrat)</div>
  //   </div>
  // `
}