// CLASSES
/**
 * @class
 * Represents the selected filters. For each filter type (eg: rank), contains a set of the selected values (eg: "Junior", "Senior")
 */
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

var isSenatorsLoaded = false;

// GLOBAL CONSTANTS
const PARTY = "party";
const STATE = "state";
const RANK = "rank";
const GENDER = "gender";

// 1. Fetch our senator data
const ALL_SENATORS = await fetch("./data/senators.json")
  .then((response) => response.json())
  .then((data) => {
    isSenatorsLoaded = true;
    return data.objects;
  })
  .catch(() => {
    // TODO: render some error element
  });

if (isSenatorsLoaded) {
  const FILTER_OPTIONS = loadFilterOptions(ALL_SENATORS);

  var CURRENT_FILTER = new FilterOptions();

  // 2. Fetch all our images
  fetch("./data/imgSources.json")
    .then((response) => response.json())
    .then((data) => {
      const imgSources = data;
      appendProfileImage(imgSources);
    });

  // 3. Draw our page
  drawFilters(FILTER_OPTIONS);
  drawHtml(ALL_SENATORS);
}

/**
 * Given a list of senators, finds all of the possible options for party, state, rank and gender
 *
 * @param {any[]} senators list of senators extracted from json
 * @returns
 */
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

/**
 * Function which is called when a filter is selected via an input el (eg: text input). It will check whether the element
 * has been selected or unselected. If selected, it will add the filter to our global FilterOptions object and draw a filter
 * tag. If unselected, it will remove the filter from our global FilterOptions object and remove the existing filter tag.
 * It will then apply the new filter to our senator elements (ie hiding/showing as necessary).
 *
 * @param {Event} e - Event received from an event listener (eg onchange)
 * @param {string} filterId - The identifier of the filter type (eg: Party, State, Rank, Gender)
 */
function handleFilterSelected(e, filterId) {
  let selected = e.target.checked;
  let value = e.target.id;
  if (selected) {
    CURRENT_FILTER.addFilter(filterId, value);
    drawFilterTag(filterId, value);
  } else {
    CURRENT_FILTER.removeFilter(filterId, value);
    removeFilterTag(filterId, value);
  }
  applyFilterToSenatorElements(CURRENT_FILTER);
}

/**
 * Function which takes in a FilterOptions object and returns a filtered array of senators filtered down based
 * on the filters passed.
 *
 * @param {FilterOptions} filterOptionsObj - An instance of the FilterOptions class
 * @param {array} senators - List of senators directly from our data (TODO: we should abstract out the senator data)
 * @returns
 */
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

/**
 * Given a FilterOptions instance, finds all senator elements that should be hidden and hides them
 * @param {FilterOptions} filterOptions
 */
function applyFilterToSenatorElements(filterOptions) {
  let senatorsToShow = filter(filterOptions);
  let senatorIds = senatorsToShow.map((s) => s.id);
  for (let senator of senators.objects) {
    let senatorEl = document.getElementById(senator.person.bioguideid);
    senatorEl.hidden = !senatorIds.includes(senator.person.bioguideid);
  }
}

function drawFilterTag(filterType, value) {
  var tagContainerEl = document.getElementById("filter-tag-container");

  var tagEl = document.createElement("div");
  tagEl.classList = `tag ${value}`;
  tagEl.innerText = value;

  var deleteEl = createFontAwesomeIcon("close", () =>
    removeFilterTag(filterType, value, tagEl, true)
  );
  tagEl.prepend(deleteEl);
  tagContainerEl.append(tagEl);
  return tagEl;
}

function removeFilterTag(filterType, value, el, shouldRemoveFilter) {
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

  // TODO
  // Update the filtered options
  const dropdownEl = document.getElementsByClassName(
    `dropdown-container ${filterType}`
  )[0];
  const optionEls = dropdownEl.getElementsByClassName(value);
  console.log(optionEls);
  filterOptionElements("", optionEls);

  applyFilterToSenatorElements(currentFilter);
}

/**
 * Function which, given a filter type, generates a searchable dropdown menu containing all the options.
 *
 * @param {string} filterId the filter type we are creating a dropdown for (eg: 'Party')
 * @param {Set<string>} options list of all possible options for the filter type (eg: 'Republican', 'Democrat')
 * @returns
 */

function createDropdown(filterId, options) {
  let dropdownContainerEl = document.createElement("div");
  dropdownContainerEl.classList.add("dropdown-container");
  dropdownContainerEl.classList.add(filterId);

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

  // Dictionary containing each option el so we can easily access them later
  const optionEls = {};
  Array.from(options)
    .sort()
    .forEach((option) => {
      let optionEl = document.createElement("div");
      optionEl.classList.add(option);

      let labelEl = document.createElement("label", { for: option });
      labelEl.innerText = capitalizeFirstLetter(option);
      let inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.id = `checkbox-${option}`;
      inputEl.onchange = (e) => {
        handleFilterSelected(e, filterId);
        // If the input has text, clear it
        textInputEl.value = "";
        filterOptionElements("", optionEls);
      };

      optionEl.appendChild(inputEl);
      optionEl.appendChild(labelEl);
      optionEls[option] = optionEl;

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

  // Handle input
  textInputEl.oninput = (e) => {
    const { value } = e.target;
    filterOptionElements(value, optionEls);
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

/**
 * Given an object filterOptions containing every filter type and its possible options, generates HTML elements:
 * filter container, sections for each filter type, drop down menus containining all options.
 *
 * @param {Object.<string, Set>} filterOptions - Dictionary of all possible filters, where key is the filterId (eg: Party),
 * and the value is the set of options (eg: Republican, Democrat)
 *
 * @return {null}
 *
 * DESIGN NOTES
 * This function is intended to only be called once on our initial load of the page.
 *
 */
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
    filterSectionEl.appendChild(filterSectionHeaderEl);

    let filterInputEl = createDropdown(filterId, filterOptions);
    filterSectionEl.appendChild(filterInputEl);
    filterContainer.appendChild(filterSectionEl);
  });
}

function filterOptionElements(value, els) {
  console.log(els);
  const optionsToUpdate = {
    hide: [],
    show: [],
  };
  Object.entries(els).forEach(([key, val]) => {
    if (!key.toLowerCase().startsWith(value.toLowerCase())) {
      optionsToUpdate["hide"].push(val);
    } else {
      optionsToUpdate["show"].push(val);
    }
  });

  optionsToUpdate["hide"].forEach((o) => (o.style.display = "none"));
  optionsToUpdate["show"].forEach((o) => (o.style.display = null));
}

// Utility functions

/**
 * Helped function to capitalize first letter of a string
 * @param {string} str
 * @returns str with first letter capitalized
 */
function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Creates an "i" element with the appropriate font awesome icon class. Does not append anywhere to the dom, just returns the element.
 *
 * @param {string} iconName name of the icon (eg: 'search')
 * @param {?function} handleClick optional function to bind to the onclick event listener of the icon
 * @returns {HTMLElement} the icon element
 */
function createFontAwesomeIcon(iconName, handleClick) {
  let icon = document.createElement("i");
  icon.classList = `fa fa-${iconName}`;
  if (handleClick) {
    icon.onclick = handleClick;
    return icon;
  }
  return icon;
}
// draw HTML elements

/**
 * Function which draws a list of senator elements onto our page
 *
 * @param {[]} senators senators to draw
 * @return {null}
 *
 * DESIGN NOTES
 * This function is intended to only be called once on our initial load of the page.
 *
 */
function drawHtml(senators) {
  const dem = [];
  const rep = [];
  const ind = [];

  senators.forEach((s) => {
    if (s.party == "Democrat") {
      dem.push(s);
    } else if (s.party == "Republican") {
      rep.push(s);
    } else {
      ind.push(s);
    }
  });
  const parties = [
    [dem, "Democrat"],
    [rep, "Republican"],
    [ind, "Independent"],
  ];
  parties.forEach((party) => {
    let partyBucket = document.createElement("div");
    partyBucket.setAttribute("id", `partyBucket-${party[1]}`); // creating top level party name divs
    document.getElementById("senator-container").appendChild(partyBucket);
    let partyTitle = document.createElement("h1"); // appending party names
    partyTitle.innerText = party[1];
    partyBucket.appendChild(partyTitle);

    // append card div with unique id to each grouping
    // may have to change later unless we are always grouping by party
    party[0].forEach((s) => {
      let child = document.createElement("div");
      child.setAttribute("id", s.person.bioguideid);
      child.setAttribute("class", "card");
      child.innerHTML = `
            <div class="name">${s.person.firstname} ${s.person.lastname}</div>
            <div class="party">${s.party}</div>
            <div class="state">${s.state}</div>
            <div class="gender">${s.person.gender}</div>
            <div clalss="rank">${s.senator_rank_label}</div>

          `;
          partyBucket.appendChild(child);
    });
  });
}

/**
 * TODO
 * @param {*} imgSources
 */
function appendProfileImage(imgSources) {
  Object.keys(imgSources).forEach((key) => {
    console.log(key);
    let image = document.createElement("img");
    image.setAttribute("src", imgSources[key]);
    console.log(imgSources[key]);
    // console.log(imgSources[key])
    document.getElementById([key]).appendChild(image);
  });
}
