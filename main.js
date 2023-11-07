// CLASSES

/**
 * @class FilterOptions
 * Represents the selected filters. For each filter type (eg: rank), contains a set of the selected values (eg: "Junior", "Senior")
 */
class FilterOptions {
  constructor() {
    this.state = {
      rank: new Set(),
      gender: new Set(),
      state: new Set(),
      party: new Set(),
      name: '',
    };
  }

  hasFilter(type, value) {
    return this.state[type].has(value);
  }

  // When a user selects a new filter, we call this to update our stored filter values
  addFilter(type, value) {
    if (typeof this.state[type] === 'object') {
      return this.state[type].add(value);
    }
    if (typeof this.state[type] === 'string') {
      this.state[type] = value.toLowerCase();
      return this.state[type];
    }
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
const PARTY = 'party';
const STATE = 'state';
const RANK = 'rank';
const GENDER = 'gender';
const NAME = 'name';

// Create promises for fetching senators and images
const fetchSenators = fetch('./data/senators.json')
  .then((response) => response.json())
  .catch((e) => renderErrorPopup({ title: 'Failed to load senators', errorMessage: e.message }));
const fetchImages = fetch('./data/imgSources.json')
  .then((response) => response.json())
  .catch((e) => renderErrorPopup({ title: 'Failed to load senator images', errorMessage: e.message }));

// Fetch senators and images
var ALL_SENATORS = await Promise.all([fetchSenators, fetchImages]).then(([senators, images]) => {
  isSenatorsLoaded = true;
  return senators.objects.map((o) => ({
    id: o.person.bioguideid,
    firstname: o.person.firstname,
    secondname: o.person.lastname,
    nickname: o.person.nickname,
    description: o.description,
    party: o.party.toLowerCase(),
    state: o.state,
    rank: o.senator_rank,
    gender: o.person.gender,
    office: o.extra.address,
    phone: o.phone,
    dob: o.person.birthday,
    age: new Date().getFullYear() - new Date(o.person.birthday).getFullYear(),
    startdate: o.startdate,
    enddate: o.enddate,
    twitter: o.person.twitterid,
    youtube: o.person.youtubeid,
    website: o.website,
    leadership_title: o.leadership_title,
    imageUrl: images[o.person.bioguideid],
    yearsInOffice: new Date().getFullYear() - new Date(o.startdate).getFullYear(),
  }));
});

if (isSenatorsLoaded) {
  // Using the senators data, pull out all the possible values we can filter by
  const FILTER_OPTIONS = loadFilterOptions(ALL_SENATORS);

  // Create our global filter instance
  var CURRENT_FILTER = new FilterOptions();

  // Draw HTML elements
  drawErrorPopup();
  drawFilters(FILTER_OPTIONS);
  drawSenators(ALL_SENATORS);
  drawStats(ALL_SENATORS);
  drawLeaders(ALL_SENATORS);
  drawSummary(ALL_SENATORS);
  drawSenatorPopup();
  drawCircles(ALL_SENATORS);
}

//#region ERROR HANLDING

/**
 * Inserts the error pop-up HTML component into the DOM with default title, message and dismiss button.
 * When we want to render the popup, we can call renderErrorPopup and pass in optional customization params.
 *
 * @params {}
 * @return none
 */
function drawErrorPopup() {
  let popupEl = createElement({ id: 'error-pop-up', tagName: 'div' });

  const curtain = document.getElementById('curtain');
  curtain.style.visibility = 'hidden';
  popupEl.style.visibility = 'hidden';

  const errorIconEl = createFontAwesomeIcon('exclamation-triangle');
  const titleEl = createElement({ tagName: 'h2', innerText: 'oh no :(' });
  const errorMessageEl = createElement({ tagName: 'p', innerText: 'An unknown error has occurred.' });
  const buttonContainerEl = createElement({ tagName: 'div', classList: 'button-container' });
  const dismissButton = createElement({ tagName: 'button', id: 'dismiss', innerText: 'Dismiss', classList: 'filled' });
  dismissButton.onclick = () => {
    location.reload();
  };

  buttonContainerEl.append(dismissButton);

  popupEl.append(errorIconEl, titleEl, errorMessageEl, buttonContainerEl);
  document.getElementById('page-container').appendChild(popupEl);
}

/**
 *
 * Gets the existing error popup dom component (or creates it if it doesn't exist) and makes it visible. If parameters are passed, customizes the title, message and button behavior.
 *
 * @param { errorMessage, title, onDismiss }
 * errorMessage - optional, message to insert into the text section of the popup. Default is "An unknown error has occurred."
 * title - optional, customized title. Default is "uh oh :("
 * onDismiss - optional, function defining behavior to occur when the user clicks "Dismiss" button. Default is to refresh the page.
 * @returns void
 */
function renderErrorPopup({ errorMessage, title, onDismiss }) {
  if (!document.getElementById('error-pop-up')) {
    drawErrorPopup();
  }
  let popupEl = document.getElementById('error-pop-up');
  const curtain = document.getElementById('curtain');

  if (errorMessage) {
    popupEl.getElementsByTagName('p')[0].innerText = errorMessage;
  }
  if (title) {
    popupEl.getElementsByTagName('h2')[0].innerText = title;
  }

  if (onDismiss) {
    document.getElementById('dismiss').onclick = onDismiss;
  }

  curtain.style.visibility = 'visible';
  popupEl.style.visibility = 'visible';
}

//#endregion END ERROR HANLDING

//#region FILTERING

/**
 * Given a list of senators, finds all of the possible options for party, state, rank and gender
 *
 * @param {any[]} senators list of senators extracted from json
 * @returns void
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
 * Function which takes in a FilterOptions object and returns a filtered array of senators filtered down based
 * on the filters passed.
 *
 * @param {FilterOptions} filterOptionsObj - An instance of the FilterOptions class
 * @param {array} senators - List of senators directly from our data
 * @returns
 */
function filter(filterOptionsObj) {
  let output = [];
  ALL_SENATORS.forEach((senator) => {
    if (
      (filterOptionsObj.hasFilter(RANK, senator.rank) || !filterOptionsObj.state[RANK].size) &&
      (filterOptionsObj.hasFilter(GENDER, senator.gender) || !filterOptionsObj.state[GENDER].size) &&
      (filterOptionsObj.hasFilter(STATE, senator.state) || !filterOptionsObj.state[STATE].size) &&
      (filterOptionsObj.hasFilter(PARTY, senator.party) || !filterOptionsObj.state[PARTY].size) &&
      (senator.firstname.toLowerCase().startsWith(filterOptionsObj.state.name) || senator.secondname.toLowerCase().startsWith(filterOptionsObj.state.name))
    ) {
      output.push(senator);
    }
  });
  return output;
}

/**
 * Event handler for when the filter icon above the senators list is clicked. Renders a dropdown containing filter options.
 */
function handleFilterIconClicked() {
  // show filter popup
  const filterContainer = document.getElementById('filter-container');
  const isHidden = filterContainer.style.visibility === 'hidden';
  filterContainer.style.visibility = isHidden ? 'visible' : 'hidden';
  filterContainer.style.height = isHidden ? '65vh' : '0';
}

/**
 * Event handler for when the sort icon above the senators list is clicked. Renders a dropdown containing sort options.
 */
function handleSortIconClicked() {
  // show filter popup
  const sortContainer = document.getElementById('sort-container');
  const isHidden = sortContainer.style.visibility === 'hidden';
  sortContainer.style.visibility = isHidden ? 'visible' : 'hidden';
  sortContainer.style.height = isHidden ? '200px' : '0';
}

/**
 * Given a FilterOptions instance, finds all senator elements that should be hidden and hides them
 * @param {FilterOptions} filterOptions
 */
function applyFilterToSenatorElements(filterOptions) {
  let senatorsToShow = filter(filterOptions);
  let senatorIds = senatorsToShow.map((s) => s.id);
  for (let senator of ALL_SENATORS) {
    let senatorEl = document.getElementById(senator.id);
    senatorEl.hidden = !senatorIds.includes(senator.id);
  }
}

/**
 *
 * Given a filter type and value, injects a "tag" component in the DOM at the top of the senators list.
 * Tags visualize which filter values are currently selected and can be removed by clicking the "x".
 *
 * @param {string} filterType what type of filter the tag is for (eg. party)
 * @param {string} value what the filter value is (eg. democrat)
 * @returns
 */
function drawFilterTag(filterType, value) {
  let tagContainerEl = document.getElementById('filter-tag-container');

  let tagEl = createElement({ tagName: 'div', classList: `tag ${value}`, innerText: capitalizeFirstLetter(value) });

  let deleteEl = createFontAwesomeIcon('close', () => removeFilterTag(filterType, value, tagEl, true));
  tagEl.prepend(deleteEl);
  tagContainerEl.append(tagEl);
  return tagEl;
}

/**
 * Given a filter type and value, finds it's tag element and removes it from the dom.
 *
 * @param {string} filterType what type of filter the tag is for (eg. party)
 * @param {string} value what the filter value is (eg. democrat)
 * @param {HTMLElement} el optional, the tag element to remove. if not provided, the function will find it in the DOM
 * @param {bool} shouldRemoveFilter optional (default: false) - indicates whether we need to remove the filter from the current filter object as well. This should be true when we
 * are removing the tag via clicking the "x" and false when we are removing the filter tag due to a filter being deselected from the dropdown.
 */
function removeFilterTag(filterType, value, el, shouldRemoveFilter = false) {
  if (shouldRemoveFilter) {
    CURRENT_FILTER.removeFilter(filterType, value);
    let inputEl = document.getElementById(value);
    inputEl.checked = false;
  }
  if (!el) {
    el = document.getElementsByClassName(`tag ${value}`)[0];
  }
  el.remove();

  // Update the filtered options
  const dropdownEl = document.getElementsByClassName(`dropdown-container ${filterType}`)[0];
  const optionEls = dropdownEl.getElementsByClassName(value);
  filterOptionElements('', optionEls);

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
  let dropdownContainerEl = createElement({ tagName: 'div', classList: `dropdown-container ${filterId}` });

  let textInputContainer = createTextSearchBox();
  dropdownContainerEl.appendChild(textInputContainer);

  let textInputEl = textInputContainer.getElementsByTagName('input')[0];

  let dropdownEl = createElement({ tagName: 'div', classList: 'dropdown' });
  dropdownEl.style.visibility = 'hidden'; // Default to hidden

  // Dictionary containing each option el so we can easily access them later
  const optionEls = {};
  Array.from(options)
    .sort()
    .forEach((option) => {
      let optionEl = createElement({ tagName: 'div', classList: option });

      let labelEl = createElement({ tagName: 'label', innerText: capitalizeFirstLetter(option) });
      labelEl.for = option;

      let inputEl = createElement({ tagName: 'input', id: option });
      inputEl.type = 'checkbox';
      inputEl.onchange = (e) => {
        handleFilterSelected(e, filterId);
        // If the input has text, clear it
        textInputEl.value = '';
        filterOptionElements('', optionEls);
      };

      optionEl.appendChild(inputEl);
      optionEl.appendChild(labelEl);
      optionEls[option] = optionEl;

      dropdownEl.appendChild(optionEl);
    });
  dropdownContainerEl.appendChild(dropdownEl);

  textInputEl.onclick = () => {
    const isVisible = dropdownEl.style.visibility === 'visible';
    // If we are toggling this dropdown on, we need to hide all of the others!
    if (!isVisible) {
      let allVisibleDropdowns = Array.from(document.getElementsByClassName('dropdown')).filter((e) => e.style.visibility === 'visible');
      allVisibleDropdowns.forEach((d) => (d.style.visibility = 'hidden'));
      dropdownEl.style.visibility = 'visible';
    } else {
      dropdownEl.style.visibility = 'hidden';
    }
  };

  dropdownEl.onmouseleave = () => {
    dropdownEl.style.visibility = 'hidden';
  };

  // Handle input
  textInputEl.oninput = (e) => {
    const { value } = e.target;
    filterOptionElements(value, optionEls);
  };

  return dropdownContainerEl;
}

/**
 * Creates a text input to use for searching for values.
 *
 * @param {function} oninput optional, function defining the oninput behavior of the text input
 * @returns {HTMLDivElement} the created text input's container div
 */
function createTextSearchBox(oninput) {
  let textInputContainer = createElement({ tagName: 'div', classList: 'text-input-container' });
  let textInputEl = createElement({ tagName: 'input' });
  textInputEl.type = 'text';

  if (oninput) {
    textInputEl.oninput = oninput;
  }

  let searchIcon = createFontAwesomeIcon('search');
  textInputContainer.append(searchIcon, textInputEl);
  return textInputContainer;
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
  // Create the "filter header" at the top of our senator list (search box + filter icon)
  let filterHeaderEl = document.getElementById('filter-header');

  // Create container for the tags
  let filterTagContainer = createElement({ tagName: 'div', id: 'filter-tag-container' });
  filterHeaderEl.appendChild(filterTagContainer);

  // Create text input for searching by name
  let textInputContainerEl = createTextSearchBox((e) => {
    const { value } = e.target;
    CURRENT_FILTER.addFilter('name', value);
    applyFilterToSenatorElements(CURRENT_FILTER);
  });
  filterHeaderEl.appendChild(textInputContainerEl);

  // Create filter icon which opens filter menu when clicked
  let filterIconEl = createFontAwesomeIcon('filter', handleFilterIconClicked, 'dark');
  filterHeaderEl.appendChild(filterIconEl);

  // Create filter pop-up container
  let filterContainer = createElement({ tagName: 'div', id: 'filter-container' });
  filterContainer.style.visibility = 'hidden';
  filterHeaderEl.appendChild(filterContainer);

  let filterContainerHeader = createElement({ tagName: 'h2', innerText: 'Filters' });
  filterContainer.appendChild(filterContainerHeader);

  // Add filter dropdowns to the filter pop-up
  Object.entries(filterOptions).forEach(([key, val]) => {
    let filterId = key;
    let filterOptions = val;
    let filterSectionEl = createElement({ tagName: 'div' });
    let filterSectionHeaderEl = createElement({ tagName: 'div', classList: `filter-section-header ${filterId}` });

    // Create a label
    let filterLabelEl = createElement({ tagName: 'h5', innerText: capitalizeFirstLetter(filterId) });
    filterSectionHeaderEl.appendChild(filterLabelEl);
    filterSectionEl.appendChild(filterSectionHeaderEl);

    let filterInputEl = createDropdown(filterId, filterOptions);
    filterSectionEl.appendChild(filterInputEl);
    filterContainer.appendChild(filterSectionEl);
  });

  // Create sort icon which opens sort menu when clicked
  let sortIconEl = createFontAwesomeIcon('sort', handleSortIconClicked, 'dark');
  filterHeaderEl.appendChild(sortIconEl);

  // Create sort pop-up container
  let sortContainer = createElement({ tagName: 'div', id: 'sort-container' });
  sortContainer.style.visibility = 'hidden';
  filterHeaderEl.appendChild(sortContainer);

  let sortContainerHeader = createElement({ tagName: 'h2', innerText: 'Sort by' });
  sortContainer.appendChild(sortContainerHeader);

  let nameSortButtonEl = createSortButton('secondname', 'Name');
  let stateSortButtonEl = createSortButton('state');
  sortContainer.append(nameSortButtonEl, stateSortButtonEl);
}

/**
 * Creates a sort button for the given filter type. A sort button by default is unselected. On first click, it sorts the senators by the filterType
 * in ascending order. On second click, it sorts in descending. On third click, it goes back to unsorted.
 *
 * @param {string} filterType what type of filter the tag is for (eg. party)
 * @param {string} value optional, text to render on the button. Will default to the 'filterType' value
 * @returns {HTMLButtonElement} the created button
 */
function createSortButton(filterType, value) {
  let buttonEl = createElement({ tagName: 'button', id: `${filterType}-sort`, classList: 'sort-button', innerText: value || capitalizeFirstLetter(filterType) });

  let sortByAscIconEl = createFontAwesomeIcon('sort-alpha-asc');
  let sortByDescIconEl = createFontAwesomeIcon('sort-alpha-desc');
  buttonEl.onclick = () => {
    // Remove any of the existing sorts
    let existingSorts = document.querySelectorAll('.desc,.asc');
    for (const sortButton of existingSorts) {
      if (!sortButton.id.includes(filterType)) {
        sortButton.className = 'sort-button';
        let icon = sortButton.getElementsByTagName('i')[0];
        if (icon) {
          sortButton.removeChild(icon);
        }
      }
    }
    // Highlight the button
    let sortDirection;

    if (buttonEl.classList.contains('asc')) {
      // If ascending, toggle to descending
      sortDirection = 'desc';
      buttonEl.classList.replace('asc', sortDirection);

      buttonEl.replaceChild(sortByDescIconEl, sortByAscIconEl);
    } else if (buttonEl.classList.contains('desc')) {
      // If descending, toggle to unselected
      sortDirection = '';
      buttonEl.classList.remove('desc');
      buttonEl.removeChild(sortByDescIconEl);
    } else {
      // If unselected, toggle to ascending
      sortDirection = 'asc';
      buttonEl.classList += ' ' + sortDirection;
      buttonEl.appendChild(sortByAscIconEl);
    }
    // Sort the senators by the id
    sortSenators(filterType, sortDirection);
  };
  return buttonEl;
}

/**
 * Sorts senators list by the given key either ascending or descending
 *
 * @param {string} id key to sort by (eg: secondname)
 * @param {"asc" | "desc" | null} direction sort direction
 */
function sortSenators(id, direction) {
  let senators = [...ALL_SENATORS];

  switch (direction) {
    case 'asc':
      senators = senators.sort((a, b) => a[id].localeCompare(b[id]));
      break;
    case 'desc':
      senators = senators.sort((a, b) => b[id].localeCompare(a[id]));
      break;
    default:
      break;
  }

  drawSenators(senators);
  applyFilterToSenatorElements(CURRENT_FILTER);
}

/**
 * Given a value and a list of option elements, hides any options which do not start with the passed value.
 *
 * @param {string} value value to search for
 * @param {HTMLCollectionOf<Element>} els list of option elements
 */
function filterOptionElements(value, els) {
  const optionsToUpdate = {
    hide: [],
    show: [],
  };
  Object.entries(els).forEach(([key, val]) => {
    if (!key.toLowerCase().startsWith(value.toLowerCase())) {
      optionsToUpdate['hide'].push(val);
    } else {
      optionsToUpdate['show'].push(val);
    }
  });

  optionsToUpdate['hide'].forEach((o) => (o.style.display = 'none'));
  optionsToUpdate['show'].forEach((o) => (o.style.display = null));
}

//#endregion FILTERING

//#region LEADERSHIP SECTION

/**
 * Function which draws leaders names and titles.
 *
 * @param {[]} senators all senators
 * @return {null}
 *
 * DESIGN NOTES
 * This function is intended to only be called once on our initial load of the page.
 *
 */
function drawLeaders(senators) {
  const leadersByParty = { democrat: [], republican: [] };
  senators.forEach((senator) => {
    if (senator.leadership_title) {
      leadersByParty[senator.party].push(senator);
    }
  });

  Object.keys(leadersByParty).forEach((party) => {
    let partyTitle = createElement({ tagName: 'h4', innerText: `${capitalizeFirstLetter(party)}s` });
    const leadersContainer = document.getElementById('leaders-container');
    leadersContainer.appendChild(partyTitle);
    let partyContainer = createElement({ tagName: 'div', id: `${party}-leaders-container` });
    leadersContainer.appendChild(partyContainer);

    leadersByParty[party].forEach((senator) => {
      const leaderLine = createElement({ tagName: 'div', classList: 'leader-line' });
      leaderLine.innerHTML = `
      <div class="leadership-title">${senator.leadership_title}</div>
      <div class="name">${senator.firstname} ${senator.nickname && `"${senator.nickname}" `} ${senator.secondname}</div>
        `;
      partyContainer.appendChild(leaderLine);
    });
  });
}

//#region END LEADERSHIP SECTION

//#region SUMMARY SECTION

/**
 * Renders the count of democrats, republicans and independents
 *
 * @param {any[]} senators
 */
function drawSummary(senators) {
  const counts = senators.reduce(
    (acc, val) => {
      acc[val.party]++;
      return acc;
    },
    { democrat: 0, republican: 0, independent: 0 }
  );

  const countsSectionContentEl = document.getElementById('party-counts').getElementsByClassName('content')[0];
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, val], i) => {
      let bubbleEl = createElement({ tagName: 'div', classList: `count-bubble ${key}` });
      let diameter, top, left, right, h1Size;
      switch (i) {
        case 0:
          diameter = `350px`;
          top = '100px';
          h1Size = '10rem';
          break;
        case 1:
          diameter = '300px';
          top = '240px';
          right = '0';
          h1Size = '8rem';
          break;
        case 2:
          diameter = '200px';
          top = '390px';
          left = '300px';
          break;
      }
      bubbleEl.style.width = diameter;
      bubbleEl.style.height = diameter;
      bubbleEl.style.top = top;
      bubbleEl.style.left = left;
      bubbleEl.style.right = right;

      let countEl = createElement({ tagName: 'h1', classList: 'count', innerText: val });
      countEl.style.fontSize = h1Size;

      let labelEl = createElement({ tagName: 'h3', classList: key, innerText: `${capitalizeFirstLetter(key)}s` });

      bubbleEl.append(countEl, labelEl);
      countsSectionContentEl.appendChild(bubbleEl);
    });
}

//#endregion SUMMARY SECTION

//#region SENATORS LIST SECTION

/**
 * Given a list of senators, creates a card element and injects into the DOM.
 *
 * @param {any[]} senators list of senators to draw
 */
function drawSenators(senators) {
  let senatorContainerEl = document.getElementById('senators-container');
  senatorContainerEl.innerHTML = null;
  senators.forEach((senator) => {
    let card = createElement({ tagName: 'div', id: senator.id, classList: 'senator-card' });
    let image = createElement({ tagName: 'img' });
    image.setAttribute('src', senator.imageUrl);
    card.appendChild(image);

    let overlay = createElement({ tagName: 'div', classList: `overlay ${senator.party.toLowerCase()}` });
    card.appendChild(overlay);

    let cardLine1 = createElement({ tagName: 'div', classList: 'top' });
    cardLine1.innerHTML = `
      <div class="name">${senator.firstname} ${senator.secondname}</div>
      <div class="state">${senator.state}</div>`;

    cardLine1.appendChild(createFontAwesomeIcon(senator.gender, null, 'gender'));
    card.appendChild(cardLine1);

    let cardLine2 = createElement({ tagName: 'div', classList: 'bottom' });
    cardLine2.innerHTML = `
      <div class="rank">${capitalizeFirstLetter(senator.rank)}</div>
      <div class="party">${capitalizeFirstLetter(senator.party)}</div>`;
    card.appendChild(cardLine2);

    card.onclick = () => renderPopUp(senator);

    let partyContainerEl = document.getElementById(`senators-list-${senator.party}`);
    if (!partyContainerEl) {
      partyContainerEl = createElement({ tagName: 'div', id: `senators-list-${senator.party}` });
      senatorContainerEl.appendChild(partyContainerEl);
    }

    partyContainerEl.appendChild(card);
  });
}

//#endregion SENATORS LIST SECTION

//#region STATS SECTION

/**
 * Given a list of senators, calculates the average age and creates a stylized element containing the average.
 *
 * @param {any[]} senators list of senators
 * @returns {HTMLElement} created element
 */
function drawAverageAgeStat(senators) {
  const avgAge = senators.reduce((acc, sen) => acc + sen.age, 0) / senators.length;
  let averageAgeContainerEl = document.getElementById('average-age-container');
  let labelEl = createElement({ tagName: 'h3', innerText: 'average age' });
  let valueEl = createElement({ tagName: 'h1', innerText: parseInt(avgAge) });
  averageAgeContainerEl.append(labelEl, valueEl);
  return averageAgeContainerEl;
}

/**
 * Given a list of senators, calculates the number of years in office and generates a histogram element.
 *
 * @param {any[]} senators list of senators
 */
function drawYearsInOfficeStat(senators) {
  const yearsInOffice = senators.reduce((acc, sen) => {
    if (acc[sen.yearsInOffice]) {
      acc[sen.yearsInOffice]++;
    } else {
      acc[sen.yearsInOffice] = 1;
    }
    return acc;
  }, {});

  const containerEl = document.getElementById('years-in-office-container');
  containerEl.appendChild(createFontAwesomeIcon('calendar'));

  const title = createElement({ tagName: 'h3', innerText: 'years in\noffice' });
  containerEl.appendChild(title);

  const barsContainer = createElement({ tagName: 'div', id: 'bars-container' });

  const maxCount = Math.max(...Object.values(yearsInOffice));

  for (const [key, val] of Object.entries(yearsInOffice)) {
    let barEl = createElement({ tagName: 'div', classList: 'graph-bar' });
    barEl.style.width = `${(val / maxCount) * 100}%`;
    let barLabelEl = createElement({ tagName: 'h1', innerText: key });
    barEl.appendChild(barLabelEl);
    barsContainer.appendChild(barEl);
  }

  let barGraphAxis = createElement({ tagName: 'div', id: 'bar-graph-axis' });
  [0, parseInt(maxCount / 2), maxCount].forEach((num) => {
    let valueEl = createElement({ tagName: 'h3', innerText: num });
    barGraphAxis.appendChild(valueEl);
  });
  barsContainer.appendChild(barGraphAxis);

  containerEl.appendChild(barsContainer);
}

/**
 * Calls all of our stat drawing functions
 *
 * @param {any[]} senators
 */
function drawStats(senators) {
  drawGenderStats(senators);
  drawAverageAgeStat(senators);
  drawYearsInOfficeStat(senators);
}

/**
 * Given a list of senators, counts the number of females and number of males. Renders a visual using male/female
 * icons representing the count.
 *
 * @param {any[]} senators list of senators
 * @returns {HTMLElement} the gender-stats-container element
 */
function drawGenderStats(senators) {
  const females = senators.filter((sen) => sen.gender === 'female');
  const males = senators.filter((sen) => sen.gender === 'male');
  let container = document.getElementById('gender-stats-container');

  let iconContainer = createElement({ tagName: 'div', id: 'gender-icons' });

  iconContainer.append(...females.map((f) => createFontAwesomeIcon('female')));
  iconContainer.append(...males.map((f) => createFontAwesomeIcon('male')));

  container.appendChild(iconContainer);

  // Add the percentages
  let percentagesContainer = createElement({ tagName: 'div', classList: 'percentages-container' });
  let femalePercentageEl = drawPercentStat(parseInt((females.length / senators.length) * 100), 'females');
  let malePercentageEl = drawPercentStat(parseInt((males.length / senators.length) * 100), 'males');

  percentagesContainer.append(femalePercentageEl, malePercentageEl);
  container.append(percentagesContainer);
  return container;
}

function drawPercentStat(value, label) {
  let percentageContainerEl = createElement({ tagName: 'div', classList: 'percentage' });
  let percentageEl = createElement({ tagName: 'h1', innerText: `${value}%` });
  let femaleLabelEl = createElement({ tagName: 'h3', innerText: label });
  percentageContainerEl.append(percentageEl, femaleLabelEl);
  return percentageContainerEl;
}

//#region END STATS SECTION

//#region SENATOR DETAILS

function drawSenatorPopup() {
  let popUp = document.getElementById('pop-up');
  popUp.style.visibility = 'hidden'; // Hidden by default

  const curtain = document.getElementById('curtain');
  curtain.style.visibility = 'hidden';

  const closeEl = createFontAwesomeIcon('close', () => {
    popUp.style.visibility = 'hidden';
    curtain.style.visibility = 'hidden';
  });

  let popupImage = createElement({ tagName: 'div', id: 'pop-up-image' });
  let textContainerEl = createElement({ tagName: 'div', id: 'pop-up-text' });

  let nameEl = createPopUpField({ id: 'name', elType: 'h2' });
  let descriptionEl = createPopUpField({ id: 'description' });
  let partyEl = createPopUpField({ id: 'party' });
  let officeEl = createPopUpField({ id: 'office', icon: 'building' });
  let phoneEl = createPopUpField({ id: 'phone', icon: 'phone' });

  textContainerEl.append(nameEl, partyEl, descriptionEl, officeEl, phoneEl);

  let socialsContainerEl = createElement({ tagName: 'div', id: 'pop-up-socials' });

  let websiteEl = createPopUpUrlField('website', null, 'globe');
  let twitterEl = createPopUpUrlField('twitter', null, 'twitter');
  let youtubeEl = createPopUpUrlField('youtube', null, 'youtube');

  socialsContainerEl.append(websiteEl, twitterEl, youtubeEl);

  popUp.append(closeEl, popupImage, socialsContainerEl, textContainerEl);

  curtain.onclick = () => {
    popUp.style.visibility = 'hidden';
    curtain.style.visibility = 'hidden';
  };
}

function createPopUpField({ id, elType = 'div', icon }) {
  let el = createElement({ tagName: elType, id: `pop-up-${id}` });
  if (icon) {
    el.appendChild(createFontAwesomeIcon(icon));
    el.classList += ' with-icon';
  }
  return el;
}

function createPopUpUrlField(id, label, icon) {
  let el = createElement({ tagName: 'div', classList: `pop-up-url ${id}` });
  if (label) {
    el.innerHTML = `${capitalizeFirstLetter(label)}: `;
  }
  let aEl = createElement({ tagName: 'a' });

  if (icon) {
    aEl.appendChild(createFontAwesomeIcon(icon));
    el.classList += ' with-icon';
  }

  el.appendChild(aEl);

  return el;
}

function updatePopUpTextField({ id, value, classList = '' }) {
  let el = document.getElementById(`pop-up-${id}`);
  let icon = el.getElementsByTagName('i')[0];
  el.innerText = value;
  if (icon) {
    el.prepend(icon);
  }
  el.classList = classList;
  return el;
}

function updatePopUpUrlField({ id, href, text }) {
  let el = document.getElementsByClassName(`pop-up-url ${id}`)[0];
  el.style.display = 'unset';
  let aEl = el.getElementsByTagName('a')[0];
  aEl.href = href;
  aEl.target = '_blank';
  if (text) {
    aEl.text = text;
  }
  return el;
}

function removePopUpUrlField(id) {
  let el = document.getElementsByClassName(`pop-up-url ${id}`)[0];
  el.style.display = 'none';
  return el;
}

function renderPopUp(senator) {
  // Show the popup and curtain
  let popUp = document.getElementById('pop-up');
  popUp.style.visibility = 'visible';

  const curtain = document.getElementById('curtain');
  curtain.style.visibility = 'visible';

  let popupImage = document.getElementById('pop-up-image');
  popupImage.style.background = `url(${senator.imageUrl.replace('"')})`;
  popupImage.alt = `Pop up image for Senator ${senator.firstname} ${senator.secondname}`;

  let bioText = `${senator.secondname} is the ${senator.description} and is a ${capitalizeFirstLetter(senator.party)}. ${senator.gender === 'male' ? 'He' : 'She'} has served since ${senator.startdate}. ${senator.secondname} serves until ${
    senator.enddate
  }. ${senator.gender === 'male' ? 'He' : 'She'} is ${senator.age} years old.`;

  updatePopUpTextField({ id: 'name', value: `${senator.firstname} ${senator.nickname ? `(${senator.nickname})` : ''} ${senator.secondname}` });
  updatePopUpTextField({ id: 'description', value: bioText });
  updatePopUpTextField({ id: 'party', value: `${senator.party}`, classList: senator.party });
  updatePopUpTextField({ id: 'office', value: `${senator.office}` });
  updatePopUpTextField({ id: 'phone', value: `${senator.phone}` });

  if (senator.twitter) {
    updatePopUpUrlField({ id: 'twitter', href: `https://www.twitter.com/${senator.twitter}` });
  } else {
    removePopUpUrlField('twitter');
  }
  if (senator.youtube) {
    updatePopUpUrlField({ id: 'youtube', href: `https://www.youtube.com/${senator.youtube}` });
  } else {
    removePopUpUrlField('youtube');
  }
  updatePopUpUrlField({ id: 'website', href: senator.website });
}

//#endregion SENATOR DETAILS

//#region SENATOR SEATS GRAPHIC

function drawCircles(senators) {
  const buckets = [];
  const count = 20;
  for (let i = 0; i < senators.length; i += count) {
    const bucket = senators.slice(i, i + count);
    buckets.push(bucket);
  }

  let target = document.getElementById('senate-floor-graphic-container');

  function drawDots(bucket, rad, startX, startY, dist) {
    let x = startX;
    let y = startY;
    let inc = 10;
    bucket.forEach((b) => {
      //draw each dot link
      let dot = createElement({ tagName: 'div', classList: 'dot' });
      target.appendChild(dot);
      let link = createElement({ tagName: 'a' });
      link.setAttribute('href', `#${b.id}`);
      dot.appendChild(link);

      link.onmouseover = () => {
        let image = document.getElementById('hover-img');
        image.setAttribute('src', `${b.imageUrl}`);
      };

      //find coorindates for each dot based on previous
      x = calcX(x, inc, rad, dist);
      y = calcY(y, inc, rad, dist);
      inc++;
      dot.style.left = `${x}px`;
      dot.style.bottom = `${y}px`;

      //change color depending on party
      if (b.party == 'democrat') {
        dot.style.backgroundColor = 'blue';
      } else if (b.party == 'republican') {
        dot.style.backgroundColor = 'red';
      }
    });
  }

  function calcX(x, inc, rad, dist) {
    x += dist * Math.cos(rad * inc);
    return x;
  }

  function calcY(y, inc, rad, dist) {
    y += dist * Math.sin(rad * inc);
    return y;
  }

  let startX = 800;
  let dist = 40;

  buckets.forEach((bucket) => {
    drawDots(bucket, 0.1571, startX, 20, dist);
    startX -= 27.5;
    dist -= 4.4;
  });
}

//#endregion SENATOR SEATS GRAPHIC

//#region DOM LISTENERS

/**
 * DOM click listener which handles clicks on the CTA buttons and scrolls down the page
 */
document.addEventListener('click', (e) => {
  if (Array.from(e.target.classList).includes('cta')) {
    const senatorSectionEl = document.getElementById('senators-list');
    const rect = senatorSectionEl.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY, behavior: 'smooth' });
  }
});

//#endregion DOM LISTENERS

//#region UTILITY FUNCTIONS

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
function createFontAwesomeIcon(iconName, handleClick, className = '') {
  let icon = createElement({ tagName: 'i', classList: `fa fa-${iconName} ${className}` });
  if (handleClick) {
    icon.onclick = handleClick;
    return icon;
  }
  return icon;
}

function createElement({ id, tagName, classList, innerText }) {
  let el = document.createElement(tagName);
  if (id) {
    if (document.getElementById(id)) {
      console.warn(`WARNING: creating element with a duplicate id: ${id}`);
    }
    el.id = id;
  }
  if (innerText) {
    el.innerText = innerText;
  }
  if (classList) {
    el.classList = classList;
  }
  return el;
}

//#endregion UTILITY FUNCTIONS
