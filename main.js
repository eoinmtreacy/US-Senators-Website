// import senators from "./data/senators.js";

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
  await fetch("./data/senators.json")
    .then((response) => response.json())
    .then((data) => {
      const senators = data.objects
      const FILTER_OPTIONS = loadFilterOptions(senators);
      drawFilters(FILTER_OPTIONS);
      const currentFilter = new FilterOptions();
    
      let filteredList = filter(currentFilter, senators);
      // filtererdList called by function to hide/show the html right?
      drawHtml(senators)
    })

    fetch("./data/imgSources.json")
      .then((response) => response.json())
        .then((data) => {
          const imgSources = data
          appendProfileImage(imgSources)
        })
    
  // TODO: this variable is not actually being used anywhere;
  // When we do start adding/removing filters, we can call
  // currentFilter.addFilter()/removeFilter()
  
  // console.log(filteredList); // filter is empty, should return all senators
  // currentFilter.addFilter("gender", "Female");
  // filteredList = filter(currentFilter);
  // console.log(filteredList); // Should only contain female senators
  // /** END DEMO SECTION */
});

function loadFilterOptions(senators) {
  var filterOptions = {
    [PARTY]: new Set(),
    [STATE]: new Set(),
    [RANK]: new Set(),
    [GENDER]: new Set(),
  };

  senators.forEach((senator) => {
    filterOptions[PARTY].add(senator.party);
    filterOptions[STATE].add(senator.state);
    filterOptions[RANK].add(senator.senator_rank);
    filterOptions[GENDER].add(senator.person.gender);
  });

  return filterOptions;
}

// Function which takes in a FilterOptions object and returns a filtered
// array of senators filtered down based on the filters passed.
function filter(filterOptionsObj, senators) {
  let output = [];
  senators.forEach((senator) => {
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
      item.office = senator.extra.office
      item.dob = senator.person.birthday
      item.startdate = senator.startdate
      item.twitter = senator.person.twitterid
      item.youtube = senator.person.youtubeid
      item.website = senator.website
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

// draw HTML elements

function drawHtml(senators)
{
  const dem = []
  const rep = []
  const ind = []

  senators.forEach(s => {
    if (s.party == "Democrat") {
      dem.push(s)
    } else if (s.party == "Republican") {
      rep.push(s)
    } else {
      ind.push(s)
    }
  }
  )

  const parties = [[dem, "Democrat"], [rep, "Republican"], [ind, "Independent"]]
  parties.forEach(party => 
    {
      let partyBucket = document.createElement("div")
      partyBucket.setAttribute("id", party[1]) // creating top level party name divs
      document.getElementById("senator-container").appendChild(partyBucket)
      let partyTitle = document.createElement("h1") // appending party names
      partyTitle.innerText = party[1]
      document.getElementById(party[1]).appendChild(partyTitle)
      
      // append card div with unique id to each grouping
      // may have to change later unless we are always grouping by party
      party[0].forEach(s =>
        {
          let child = document.createElement("div")
          child.setAttribute("id", s.person.bioguideid)
          child.setAttribute("class", "card")
          child.innerHTML = `
            <div class="name">${s.person.firstname} ${s.person.lastname}</div>
            <div class="party">${s.party}</div>
            <div class="state">${s.state}</div>
            <div class="gender">${s.person.gender}</div>
            <div clalss="rank">${s.senator_rank_label}</div>

          `
          document.getElementById(party[1]).appendChild(child)
        }
      )
    }
  )
}

function appendProfileImage (imgSources)
{
  Object.keys(imgSources).forEach((key) => {
    console.log(key)
    let image = document.createElement("img")
    image.setAttribute("src", imgSources[key])
    console.log(imgSources[key])
    // console.log(imgSources[key])
    document.getElementById([key]).appendChild(image)
  })
  
}

