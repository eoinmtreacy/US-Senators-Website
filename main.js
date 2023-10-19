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

  hasFilter(type, value) {
    switch (type) {
      case "rank":
        return this.rank.has(value);
      case "gender":
        return this.gender.has(value);
      case "party":
        return this.party.has(value);
      case "state":
        return this.state.has(value);
      default:
        return;
    }
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

const currentFilter = new FilterOptions();
document.addEventListener("DOMContentLoaded", async () => {
  const FILTER_OPTIONS = loadFilterOptions();
  drawFilters(FILTER_OPTIONS);

  /** DEMO PURPOSE ONLY BELOW **/
  let filteredList = filter(currentFilter);
  drawHtml(filteredList);
  // console.log(filteredList); // filter is empty, should return all senators
  // currentFilter.addFilter("gender", "Female");
  // filteredList = filter(currentFilter);
  // console.log(filteredList); // Should only contain female senators
  // /** END DEMO SECTION */
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

function handleFilterSelected(e, id) {
  let selected = e.target.checked;
  let value = e.target.id;
  if (selected) {
    currentFilter.addFilter(id, value);
    drawFilterTag(id, value);
  } else {
    currentFilter.removeFilter(id, value);
    removeFilterTag(id, value);
  }

  applyFilterToSenatorElements(currentFilter);
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
      item.office = senator.extra.office;
      item.dob = senator.person.birthday;
      item.startdate = senator.startdate;
      item.twitter = senator.person.twitterid;
      item.youtube = senator.person.youtubeid;
      item.website = senator.website;
      output.push(item);
    }
  });
  return output;
}

function applyFilterToSenatorElements(filterOptions) {
  let senatorsToShow = filter(filterOptions);
  let senatorIds = senatorsToShow.map((s) => s.id);
  for (let senator of senators.objects) {
    let senatorEl = document.getElementById(senator.person.bioguideid);
    senatorEl.hidden = !senatorIds.includes(senator.person.bioguideid);
  }
}

function drawFilterTag(filterType, value) {
  console.log("drawFilterTag: ", filterType, value)
  var tagContainerEl = document.getElementById("filter-tag-container");

  var tagEl = document.createElement("div");
  tagEl.classList = `tag ${value}`;
  tagEl.innerText = value;

  var deleteEl = createFontAwesomeIcon(
    "close",
    () => removeFilterTag(filterType, value, tagEl, true)
  );
  tagEl.prepend(deleteEl);
  tagContainerEl.append(tagEl);
  return tagEl;
}

function removeFilterTag(filterType, value, el, shouldRemoveFilter) {
  console.info("removeFilterTag: ", filterType, value, el, shouldRemoveFilter)
  if (shouldRemoveFilter) {
    // TODO: uncheck the input
    currentFilter.removeFilter(filterType, value);
    let inputEl = document.getElementById(value);
    inputEl.checked = false;
  }
  if (!el) {
    el = document.getElementsByClassName(`tag ${value}`)[0];
  }
  el.remove();
}

function createDropdown(filterId, options) {
  let dropdownContainerEl = document.createElement("div");
  dropdownContainerEl.classList.add("dropdown-container");

  let textInputContainer = document.createElement("div");
  textInputContainer.className = "text-input-container";
  let textInputEl = document.createElement("input");
  textInputEl.type = "text";

  let searchIcon = createFontAwesomeIcon("search");
  textInputContainer.append(searchIcon, textInputEl);
  dropdownContainerEl.appendChild(textInputContainer);

  let dropdownEl = document.createElement("div");
  dropdownEl.className = "dropdown";
  dropdownEl.style.visibility = "hidden"; // Default to hidden
  Array.from(options)
    .sort()
    .forEach((option) => {
      let optionEl = document.createElement("div");
      optionEl.classList.add(option);

      let labelEl = document.createElement("label", { for: option });
      labelEl.innerText = capitalizeFirstLetter(option);
      let inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.id = `${option}`;
      inputEl.onchange = (e) => handleFilterSelected(e, filterId);

      optionEl.appendChild(inputEl);
      optionEl.appendChild(labelEl);

      dropdownEl.appendChild(optionEl);
    });
  dropdownContainerEl.appendChild(dropdownEl);

  textInputEl.onclick = () => {
    const isVisible = dropdownEl.style.visibility === "visible";
    // If we are toggling this dropdown on, we need to hide all of the others!
    if (!isVisible) {
      let allVisibleDropdowns = Array.from(
        document.getElementsByClassName("dropdown")
      ).filter((e) => e.style.visibility === "visible");
      allVisibleDropdowns.forEach((d) => (d.style.visibility = "hidden"));
      dropdownEl.style.visibility = "visible";
    } else {
      dropdownEl.style.visibility = "hidden";
    }
  };

  dropdownEl.onmouseleave = () => {
    dropdownEl.style.visibility = "hidden";
  };

  return dropdownContainerEl;
}

// TODO: use this for sorts
function createButtonGroup(options) {
  let filterInputEl = document.createElement("div");
  filterInputEl.classList.add("button-group");

  Array.from(options)
    .sort()
    .forEach((option) => {
      let optionEl = document.createElement("div");
      optionEl.classList.add(option);

      let buttonEl = document.createElement("button");
      buttonEl.innerText = capitalizeFirstLetter(option);
      // TODO
      buttonEl.onchange = (e) => handleFilterSelected(e, filterId);
      filterInputEl.appendChild(buttonEl);
    });
  return filterInputEl;
}

function drawFilters(filterOptions) {
  let filterContainer = document.getElementById("filter-container");

  Object.entries(filterOptions).forEach(([key, val]) => {
    let filterId = key;
    let filterOptions = val;
    let filterSectionEl = document.createElement("div");
    let filterSectionHeaderEl = document.createElement("div");
    filterSectionHeaderEl.classList.add("filter-section-header", filterId);

    // Create a label
    let filterLabelEl = document.createElement("h5");
    filterLabelEl.innerText = capitalizeFirstLetter(filterId);
    filterSectionHeaderEl.appendChild(filterLabelEl);

    let chevronIconEl = document.createElement("i");
    chevronIconEl.classList = ["fa fa-chevron-down"];
    filterSectionHeaderEl.appendChild(chevronIconEl);

    filterSectionEl.appendChild(filterSectionHeaderEl);

    let filterInputEl;
    switch (filterId) {
      case STATE:
        filterInputEl = createDropdown(filterId, filterOptions);
        break;
      case PARTY:
      case RANK:
      case GENDER:
        filterInputEl = createDropdown(filterId, filterOptions);
        break;
      default:
        // If its a filter we aren't expecting, default it to a dropdown
        filterInputEl = createDropdown(filterId, filterOptions);
        break;
    }

    filterSectionEl.appendChild(filterInputEl);
    filterContainer.appendChild(filterSectionEl);
  });
}

// Utility functions
function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function createFontAwesomeIcon(iconName, handleClick) {
  let icon = document.createElement("i");
  icon.classList = `fa fa-${iconName}`;
  if (handleClick) {
    icon.onclick = handleClick;
  }
  return icon;
}

// draw HTML elements
function drawHtml(senators) {
  senators.forEach((s) => {
    let child = document.createElement("div");
    child.setAttribute("id", s.id);
    child.innerHTML = `
      <span>${s.firstname}</span>
      <span>${s.secondname}</span>
      <span>${s.party}</span>
      <span>${s.state}</span>
      <span>${s.gender}</span>
      <span>${s.rank}</span>
      `;

    document.getElementById("senator-container").appendChild(child);
  });
}

// Pseudo code
// 1. Load JSON data
// 2. Draw all html on the page
//    a. Filter selectors
//    b. List of senators
//    c. "Summary" info of congress
// 3. Add filter event listeners
//    a. when a filter is selected or unselected, show/hide senators
//    b. when reset button is clicked, remove all filters
// 4. Add senator card event listeners
//    a. when a senator is clicked, open a pop-up window with senator info

// Methods:
// async loadData()
// drawHtml()
//   - drawSummary()
//   - drawSenators()
//   - drawFilters()
// handleFilterSelected() <- event listener
// handleResetClicked() <- event listener, button
// handleSenatorClicked() <- event listener, senator element
//   - drawSenatorPopUp()
// filter(senators: obj)
// filterSenatorElements()

// Constants:
// ALL_JSON_DATA <- constant, list of JSON data unmanipulated
// ALL_FILTER_OPTIONS <- constant, obj containing options for each filter (eg: party: [Democrat, Republican])

// Variables:
// currentFilters <- obj containing the currently selected filters
