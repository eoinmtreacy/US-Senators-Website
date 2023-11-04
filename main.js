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

const fetchSenators = fetch('./data/senators.json').then((response) => response.json());
const fetchImages = fetch('./data/imgSources.json').then((response) => response.json());

// 1. Fetch our senator data
var ALL_SENATORS = await Promise.all([fetchSenators, fetchImages])
  .then(([senators, images]) => {
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
  })
  .catch((e) => {
    // TODO: render some error element
    console.error(e);
  });

if (isSenatorsLoaded) {
  // console.log(ALL_SENATORS);
  // console.log(ALL_SENATORS);
  const FILTER_OPTIONS = loadFilterOptions(ALL_SENATORS);
  var CURRENT_FILTER = new FilterOptions();

  // 3. Draw our page
  drawFilters(FILTER_OPTIONS);
  drawSenators(ALL_SENATORS);
  drawStats(ALL_SENATORS);
  drawLeaders(ALL_SENATORS);
  drawSummary(ALL_SENATORS);
  drawSenatorPopup();
  circles(ALL_SENATORS);
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

function isIncluded(filterOptionsObj, filterType, value) {
  return filterOptionsObj.state[filterType].has(value) || !filterOptionsObj.state[filterType].size;
}

// TODO: we can refactor these two functions to be one!
function handleFilterIconClicked() {
  // show filter popup
  const filterContainer = document.getElementById('filter-container');
  const isHidden = filterContainer.style.visibility === 'hidden';
  filterContainer.style.visibility = isHidden ? 'visible' : 'hidden';
  filterContainer.style.right = isHidden ? '-225px' : '-500px';
}

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

function drawFilterTag(filterType, value) {
  var tagContainerEl = document.getElementById('filter-tag-container');

  var tagEl = document.createElement('div');
  tagEl.classList = `tag ${value}`;
  tagEl.innerText = capitalizeFirstLetter(value);

  var deleteEl = createFontAwesomeIcon('close', () => removeFilterTag(filterType, value, tagEl, true));
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
  const dropdownEl = document.getElementsByClassName(`dropdown-container ${filterType}`)[0];
  const optionEls = dropdownEl.getElementsByClassName(value);
  console.log(optionEls);
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
  let dropdownContainerEl = document.createElement('div');
  dropdownContainerEl.classList.add('dropdown-container');
  dropdownContainerEl.classList.add(filterId);

  let textInputContainer = createTextSearchBox();
  dropdownContainerEl.appendChild(textInputContainer);

  let textInputEl = textInputContainer.getElementsByTagName('input')[0];

  let dropdownEl = document.createElement('div');
  dropdownEl.className = 'dropdown';
  dropdownEl.style.visibility = 'hidden'; // Default to hidden

  // Dictionary containing each option el so we can easily access them later
  const optionEls = {};
  Array.from(options)
    .sort()
    .forEach((option) => {
      let optionEl = document.createElement('div');
      optionEl.classList.add(option);

      let labelEl = document.createElement('label', { for: option });
      labelEl.innerText = capitalizeFirstLetter(option);
      let inputEl = document.createElement('input');
      inputEl.type = 'checkbox';
      inputEl.id = `${option}`;
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

function createTextSearchBox(oninput) {
  let textInputContainer = document.createElement('div');
  textInputContainer.className = 'text-input-container';
  let textInputEl = document.createElement('input');
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
  let filterTagContainer = document.createElement('div');
  filterTagContainer.id = 'filter-tag-container';
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
  let filterContainer = document.createElement('div');
  filterContainer.id = 'filter-container';
  filterContainer.style.visibility = 'hidden';
  filterHeaderEl.appendChild(filterContainer);

  let filterContainerHeader = document.createElement('h2');
  filterContainerHeader.innerText = 'Filters';
  filterContainer.appendChild(filterContainerHeader);

  // Add filter dropdowns to the filter pop-up
  Object.entries(filterOptions).forEach(([key, val]) => {
    let filterId = key;
    let filterOptions = val;
    let filterSectionEl = document.createElement('div');
    let filterSectionHeaderEl = document.createElement('div');
    filterSectionHeaderEl.classList.add('filter-section-header', filterId);

    // Create a label
    let filterLabelEl = document.createElement('h5');
    filterLabelEl.innerText = capitalizeFirstLetter(filterId);
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
  let sortContainer = document.createElement('div');
  sortContainer.id = 'sort-container';
  sortContainer.style.visibility = 'hidden';
  filterHeaderEl.appendChild(sortContainer);

  let sortContainerHeader = document.createElement('h2');
  sortContainerHeader.innerText = 'Sort by';
  sortContainer.appendChild(sortContainerHeader);

  let nameSortButtonEl = createSortButton('secondname', 'Name');
  let stateSortButtonEl = createSortButton('state');
  sortContainer.append(nameSortButtonEl, stateSortButtonEl);
}

function createSortButton(id, value) {
  let buttonEl = document.createElement('button');
  buttonEl.classList = 'sort-button';
  buttonEl.id = `${id}-sort`;
  buttonEl.innerText = value || capitalizeFirstLetter(id);

  let sortByAscIconEl = createFontAwesomeIcon('sort-alpha-asc');
  let sortByDescIconEl = createFontAwesomeIcon('sort-alpha-desc');
  buttonEl.onclick = () => {
    // Remove any of the existing sorts
    let existingSorts = document.querySelectorAll('.desc,.asc');
    for (const sortButton of existingSorts) {
      if(!sortButton.id.includes(id)) {
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
    sortSenators(id, sortDirection);
  };
  return buttonEl;
}

function filterOptionElements(value, els) {
  // console.log(els);
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
function createFontAwesomeIcon(iconName, handleClick, className = '') {
  let icon = document.createElement('i');
  icon.classList = `fa fa-${iconName} ${className}`;
  if (handleClick) {
    icon.onclick = handleClick;
    return icon;
  }
  return icon;
}
// draw HTML elements

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
    let partyTitle = document.createElement('h4');
    partyTitle.innerText = `${capitalizeFirstLetter(party)}s`;
    const leadersContainer = document.getElementById('leaders-container');
    leadersContainer.appendChild(partyTitle);
    let partyContainer = document.createElement('div');
    partyContainer.setAttribute('id', `${party[1]}-leaders-container`);
    leadersContainer.appendChild(partyContainer);

    leadersByParty[party].forEach((senator) => {
      const leaderLine = document.createElement('div');
      leaderLine.setAttribute('class', 'leader-line');
      leaderLine.innerHTML = `
      <div class="leadership-title">${senator.leadership_title}</div>
      <div class="name">${senator.firstname} ${senator.nickname && `"${senator.nickname}" `} ${senator.secondname}</div>
        `;
      partyContainer.appendChild(leaderLine);
    });
  });
}

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
      let bubbleEl = document.createElement('div');
      bubbleEl.classList = `count-bubble ${key}`;
      let diameter, top, left, right, h1Size;
      switch (i) {
        case 0:
          diameter = '350px';
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

      let countEl = document.createElement('h1');
      countEl.classList = 'count';
      countEl.innerText = val;
      countEl.style.fontSize = h1Size;

      let labelEl = document.createElement('h3');
      labelEl.classList = key;
      labelEl.innerText = `${capitalizeFirstLetter(key)}s`;

      bubbleEl.append(countEl, labelEl);
      countsSectionContentEl.appendChild(bubbleEl);
    });
}

function drawSenators(senators) {
  let container = document.getElementById('senators-container');
  container.innerHTML = '';
  senators.forEach((senator) => {
    let card = document.createElement('div');
    card.id = senator.id;
    card.classList = 'senator-card';
    let image = document.createElement('img');
    image.setAttribute('src', senator.imageUrl);
    card.appendChild(image);

    let overlay = document.createElement('div');
    overlay.classList = `overlay ${senator.party.toLowerCase()}`;
    card.appendChild(overlay);

    let cardLine1 = document.createElement('div');
    cardLine1.classList = 'top';
    cardLine1.innerHTML = `
      <div class="name">${senator.firstname} ${senator.secondname}</div>
      <div class="state">${senator.state}</div>`;

    cardLine1.appendChild(createFontAwesomeIcon(senator.gender, null, 'gender'));
    card.appendChild(cardLine1);

    let cardLine2 = document.createElement('div');
    cardLine2.classList = 'bottom';
    cardLine2.innerHTML = `
      <div class="rank">${capitalizeFirstLetter(senator.rank)}</div>
      <div class="party">${capitalizeFirstLetter(senator.party)}</div>`;
    card.appendChild(cardLine2);

    card.onclick = () => renderPopUp(senator);

    container.appendChild(card);
  });
}

function drawAverageAgeStat(senators) {
  const avgAge = senators.reduce((acc, sen) => acc + sen.age, 0) / senators.length;
  let averageAgeContainerEl = document.getElementById('average-age-container');
  let labelEl = document.createElement('h3');
  labelEl.innerText = 'average age';
  let valueEl = document.createElement('h1');
  valueEl.innerText = parseInt(avgAge);
  averageAgeContainerEl.append(labelEl, valueEl);
  return averageAgeContainerEl;
}

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

  const title = document.createElement('h3');
  title.innerText = 'years in\noffice';
  containerEl.appendChild(title);

  const barsContainer = document.createElement('div');
  barsContainer.id = 'bars-container';

  const maxCount = Math.max(...Object.values(yearsInOffice));

  for (const [key, val] of Object.entries(yearsInOffice)) {
    let barEl = document.createElement('div');
    barEl.classList = 'graph-bar';
    barEl.style.width = `${(val / maxCount) * 100}%`;
    let barLabelEl = document.createElement('h1');
    barLabelEl.innerText = key;
    barEl.appendChild(barLabelEl);
    barsContainer.appendChild(barEl);
  }

  let barGraphAxis = document.createElement('div');
  barGraphAxis.setAttribute('id', 'bar-graph-axis');
  [0, parseInt(maxCount / 2), maxCount].forEach((num) => {
    let valueEl = document.createElement('h3');
    valueEl.innerText = num;
    barGraphAxis.appendChild(valueEl);
  });
  barsContainer.appendChild(barGraphAxis);

  containerEl.appendChild(barsContainer);
}

function drawStats(senators) {
  drawGenderStats(senators);
  drawAverageAgeStat(senators);
  drawYearsInOfficeStat(senators);
}

function drawGenderStats(senators) {
  const females = senators.filter((sen) => sen.gender === 'female');
  const males = senators.filter((sen) => sen.gender === 'male');
  let container = document.getElementById('gender-stats-container');

  let iconContainer = document.createElement('div');
  iconContainer.id = 'gender-icons';

  iconContainer.append(...females.map((f) => createFontAwesomeIcon('female')));
  iconContainer.append(...males.map((f) => createFontAwesomeIcon('male')));

  container.appendChild(iconContainer);

  // Add the percentages
  let percentagesContainer = document.createElement('div');
  percentagesContainer.classList = 'percentages-container';
  let femalePercentageEl = drawPercentStat(parseInt((females.length / senators.length) * 100), 'females');
  let malePercentageEl = drawPercentStat(parseInt((males.length / senators.length) * 100), 'males');

  percentagesContainer.append(femalePercentageEl, malePercentageEl);
  container.append(percentagesContainer);
  return container;
}

function drawPercentStat(value, label) {
  let percentageContainerEl = document.createElement('div');
  percentageContainerEl.classList = 'percentage';
  let percentageEl = document.createElement('h1');
  percentageEl.innerText = `${value}%`;
  let femaleLabelEl = document.createElement('h3');
  femaleLabelEl.innerText = label;
  percentageContainerEl.append(percentageEl, femaleLabelEl);
  return percentageContainerEl;
}

function drawSenatorPopup() {
  let popUp = document.getElementById('pop-up');
  popUp.style.visibility = 'hidden'; // Hidden by default

  const curtain = document.getElementById('curtain');
  curtain.style.visibility = 'hidden';

  const closeEl = createFontAwesomeIcon('close', () => {
    popUp.style.visibility = 'hidden';
    curtain.style.visibility = 'hidden';
  });

  let popupImage = document.createElement('div');
  popupImage.id = 'pop-up-image';

  let textContainerEl = document.createElement('div');
  textContainerEl.id = 'pop-up-text';

  let nameEl = createPopUpField({ id: 'name', elType: 'h2' });
  let descriptionEl = createPopUpField({ id: 'description' });
  let partyEl = createPopUpField({ id: 'party' });
  let officeEl = createPopUpField({ id: 'office', icon: 'building' });
  let phoneEl = createPopUpField({ id: 'phone', icon: 'phone' });

  textContainerEl.append(nameEl, partyEl, descriptionEl, officeEl, phoneEl);

  let socialsContainerEl = document.createElement('div');
  socialsContainerEl.id = 'pop-up-socials';

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
  let el = document.createElement(elType);
  el.id = `pop-up-${id}`;
  if (icon) {
    el.appendChild(createFontAwesomeIcon(icon));
    el.classList += ' with-icon';
  }
  return el;
}

function createPopUpUrlField(id, label, icon) {
  let el = document.createElement('div');
  el.classList = `pop-up-url ${id}`;
  if (label) {
    el.innerHTML = `${capitalizeFirstLetter(label)}: `;
  }
  let aEl = document.createElement('a');

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

  // TODO:
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

function handleCloseClicked() {}

function circles(senators) {
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
      let dot = document.createElement('div');
      target.appendChild(dot);
      dot.setAttribute('class', 'dot');
      let link = document.createElement('a');
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
    dist -= 4;
  });
}

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

document.addEventListener('click', (e) => {
  if (Array.from(e.target.classList).includes('cta')) {
    const senatorSectionEl = document.getElementById('senators-list');
    const rect = senatorSectionEl.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY, behavior: 'smooth' });
  }
});
