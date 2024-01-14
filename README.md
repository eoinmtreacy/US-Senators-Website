# COMP30680 (Web Dev) Assignment 2
<p>Available here: <a href="https://eoinmtreacy.github.io/US-Senators-Website/">https://eoinmtreacy.github.io/US-Senators-Website/</a></p>
<p>
  I learned...
</p>
<ul>
  <li>How to work closely with another programmer and effectively manage the workflow with git</li>
  <li>How to dynamically render site contents with Javascript</li>
  <li>How to read, interpret and manipulate large, complex JSON files</li>
  <li>Webscraping</li>
  <li>How to draw CIRCLES with CSS (joking aside, I am unreasoably proud of <code>drawDots()</code>, my school-boy geometry needed a good refresh anyway)</li>
</ul>

## Contents
- `data/`
  - `imgSources.json` - json containing image sources for each senator
  - `senators.json` - senator json
- `images/` - image files used in the web app
- `scripts/` - scripts which were used to aid in the development of the web app; not essential to run the app, just stored here for documentation
- `index.html`
- `main.css`
- `main.js`

## Fulfilled Requirements

- Allow the user to choose a senator and view more detailed information on this senator. 
  - see `renderPopUp()` or `div#pop-up`
- Once chosen, here is some of the information should be presented for the selected senator:
- Office
  - see `div#office`
- Twitter and YouTube id where available.
  - see `div#twitter` & `div#youtube`
- Clickable website link. When clicked this link should open in a new tab. 
  - see `div#website`

### Images
Using a python script, we parsed the source website for each senator's image, storing each url in a json `imgSources.json` which we then used for the `src` attribute of each senator's card.

