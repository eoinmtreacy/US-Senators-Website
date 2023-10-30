// CLASSES
/**
 * @class
 * Represents the selected filters. For each filter type (eg: rank), contains a set of the selected values (eg: "Junior", "Senior")
 */
class FilterOptions {
  constructor() {
    this.state = {
      rank: new Set(),
      gender: new Set(),
      state: new Set(),
      party: new Set(),
    };
  }

  hasFilter(type, value) {
    return this.state[type].has(value);
  }

  // When a user selects a new filter, we call this to update our stored filter values
  addFilter(type, value) {
    return this.state[type].add(value);
  }

  // When a user unselects a filter, we call this to update our stored filter values
  removeFilter(type, value) {
    return this.state[type].delete(value);
  }

  resetFilters() {
    this.state = {
      rank: new Set(),
      gender: new Set(),
      state: new Set(),
      party: new Set(),
    };
  }
}

var isSenatorsLoaded = false;

// GLOBAL CONSTANTS
const PARTY = "party";
const STATE = "state";
const RANK = "rank";
const GENDER = "gender";

const fetchSenators = fetch("./data/senators.json").then((response) =>
  response.json()
);
const fetchImages = fetch("./data/imgSources.json").then((response) =>
  response.json()
);

// 1. Fetch our senator data
var ALL_SENATORS = await Promise.all([fetchSenators, fetchImages])
  .then(([senators, images]) => {
    console.log(senators, images);
    isSenatorsLoaded = true;
    return senators.objects.map((o) => ({
      id: o.person.bioguideid,
      firstname: o.person.firstname,
      secondname: o.person.lastname,
      nickname: o.person.nickname,
      party: o.party.toLowerCase(),
      state: o.state,
      rank: o.senator_rank,
      gender: o.person.gender,
      office: o.extra.office,
      dob: o.person.birthday,
      age: new Date().getFullYear() - new Date(o.person.birthday).getFullYear(),
      startdate: o.startdate,
      twitter: o.person.twitterid,
      youtube: o.person.youtubeid,
      website: o.website,
      leadership_title: o.leadership_title,
      imageUrl: images[o.person.bioguideid],
    }));
  })
  .catch((e) => {
    // TODO: render some error element
    console.error(e);
  });

if (isSenatorsLoaded) {
  console.log(ALL_SENATORS);
  const FILTER_OPTIONS = loadFilterOptions(ALL_SENATORS);
  var CURRENT_FILTER = new FilterOptions();

  // 3. Draw our page
  // drawFilters(FILTER_OPTIONS);
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
    filterOptions[RANK].add(senator.rank);
    filterOptions[GENDER].add(senator.gender);
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
 * Function which removes all filters
 */
function handleResetClicked() {
  CURRENT_FILTER.resetFilters();
}

/**
 * Function which takes in a FilterOptions object and returns a filtered array of senators filtered down based
 * on the filters passed.
 *
 * @param {FilterOptions} filterOptionsObj - An instance of the FilterOptions class
 * @param {array} senators - List of senators directly from our data (TODO: we should abstract out the senator data)
 * @returns
 */
function filter(filterOptionsObj) {
  let output = [];
  ALL_SENATORS.forEach((senator) => {
    if (
      (filterOptionsObj.rank.has(senator.senator_rank) ||
        !filterOptionsObj.rank.size) &&
      (filterOptionsObj.gender.has(senator.person.gender) ||
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
      item.gender = senator.person.gender;
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
  for (let senator of ALL_SENATORS) {
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
    CURRENT_FILTER.removeFilter(filterType, value);
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

  applyFilterToSenatorElements(CURRENT_FILTER);
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
      inputEl.id = `${option}`;
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
 * @param {?string} className optional class name to add to the element
 * @returns {HTMLElement} the icon element
 */
function createFontAwesomeIcon(iconName, handleClick, className) {
  let icon = document.createElement("i");
  icon.classList = `fa fa-${iconName} ${className}`;
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

  let container = document.getElementById("senators-container");
  senators.forEach((senator) => {
    let card = document.createElement("div");
    card.id = senator.id;
    card.classList = "senator-card";
    let image = document.createElement("img");
    image.setAttribute("src", senator.imageUrl);
    card.appendChild(image);

    let overlay = document.createElement("div");
    overlay.classList = `overlay ${senator.party.toLowerCase()}`;
    card.appendChild(overlay);

    let cardLine1 = document.createElement("div");
    cardLine1.classList = "top";
    cardLine1.innerHTML = `
      <div class="name">${senator.firstname} ${senator.secondname}</div>
      <div class="state">${senator.state}</div>`;
  
    cardLine1.appendChild(createFontAwesomeIcon(senator.gender, null, "gender"));
    card.appendChild(cardLine1);

    let cardLine2 = document.createElement("div");
    cardLine2.classList = "bottom";
    cardLine2.innerHTML = `
      <div class="rank">${capitalizeFirstLetter(senator.rank)}</div>
      <div class="party">${capitalizeFirstLetter(senator.party)}</div>`;
    card.appendChild(cardLine2);

    container.appendChild(card);
  });
}
