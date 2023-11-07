# COMP30680 Assignment 2

## Fulfilled Requirements
When this page is opened it should show the following:

- The total number of senators in each party affiliation
  - See `drawSummary()` or `div#party-counts`
- A list of all senators with leadership roles
  - See `drawLeaders()` or `div#leaders-container`
- Display all senators, with the following information given for each senator:  party, state, gender, rank. 
  - See `drawSenators()` or `div#senators-container`
- Filter senators by party.
- Filter senators by state.
- Filter senators by rank.
- It should be possible  to combine filters, e.g. filter by party and state.
  - see `drawFilters()` or `div#filter-container` 

- Where senators from different parties are shown they should be grouped by party.
  - See `drawSenators()` or `div#senators-list-republican` `div#senators-list-democrat` `div#senators-list-independent`

- Allow the user to choose a senator and view more detailed information on this senator. 
  - see `renderPopUp()` or `div#pop-up`
- Once chosen the following information should be presented for the selected senator:
- Office
  - see `div#office`
- Date of birth
  - see `div#description`
- Start date
  - see `div#office`
- Twitter and YouTube id where available.
  - see `div#twitter` & `div#youtube`
- Clickable website link. When clicked this link should open in a new tab. 
  - see `div#website`
- Appropriate and effective error handing
  - see `fetchSenators` and `fetchImages` promise objects - can uncomment the line above the `catch` to see the behavior.

## Added features
### Sorting
User can sort senators by last name or state, ascending or descending. On sort, any applied filters will persist.
### Searching
User can search by senator name. Inputted text will look for matches in the start of the senator's first name and second name (Eg: searching `Ber` or `San` will show `Bernard Sanders` but `ard` will not)
### Statistics container
Using the senator data, we calculated the proportion of men/women, average age and years in office and rendered an infographic.
### Senate floor graphic
Generated a visual representation of the senate floor using pure js/css. Each seat (or "dot") can be hovered to show and image of the senator and on click the page will scroll down to that senator.
### Images
Using a python script, we parsed the source website for each senator's image, storing each url in a json `imgSources.json` which we then used for the `src` attribute of each senator's card.

## Additional explorations
In addition to the requirements of this project, we explored other web application development concepts and techniques, such as:
- Using Font Awesome icons
- Smooth scroll behavior via css and js (2 different techniques)
- Using a class to store filter state
- Using modern web app UI components (CTA buttons, filter tags/badges)
- CSS animations (on dropdown menus)
- [MDN recommended](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Organizing) css file organization
- CSS custom properties ([Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties))
- Documentation using docstrings
- Advanced async techniques, such as using `Promise.all`
- Using the `reduce` array method
- Rendering html elements using dynamic position calculations


# Assignment
COMP30680 Web Application Development  

Assignment 2: JavaScript and JSON  

This assignment focuses on the use of JavaScript to read, manipulate, and present JSON data in a webpage.  The data for the assignment is taken from www.govtrack.us/. It provides information on members of the US  Senate. The data is contained in the file 'senators.json'. 

Your job is to present the JSON data on a webpage. To do this you will need to combine HTML, CSS, and JavaScript. Other languages are not permitted. The use of JavaScript frameworks (e.g. jQuery) is not  permitted.

Note: All steps outlined below can be achieved without the need to reload the page or navigate to a new  page. If your solution involves reloading the page or navigating to a new page (with the exception of  external websites in step 4) two grade points will be deducted from your final mark (e.g., A+ to A-). 

Note: all information needed to create the lists and filters below is available in the json file. Two grade points  (e.g., A+ to A-) will be deducted if information is hardcoded, instead of being read from the json data. For example, the information needed to identify leadership roles, or to create a list of US statesor political parties is available in the json data.

Requirements: 

1. Creating a webpage called senators.html. When this page is opened it should show the following:
- The total number of senators in each party affiliation, e.g., Democrats: 66
- A list of all senators with leadership roles, using the following format:
- Senate Minority Leader: Chuck Schumer (Democrat)
- Senate Minority Leader: Mitch McConnell (Republican)
- Leadership roles should be grouped by party. E.g., list all Democrats with leadership roles first.
2. Next, the webpage should display all senators, with the following information given for each senator:  party, state, gender, rank. 
3. senators.html should provide a way to filter the senators in step 2 above by:
- Filter senators by party (with 'show all' as the default option).
- Filter senators by state (with 'show all' as the default option).
- Filter senators by rank (with 'show all' as the default option).
- These filters can be implemented in a number of ways, e.g. using dropdown menus. It should be possible  to combine filters, e.g. filter by party and state. Where senators from different parties are shown (e.g.  when the party filter is set to 'show all') they should be grouped by party.
4. senator.html should also allow the user to choose a senator and view more detailed information on this senator. Once chosen the following information should be presented for the selected senator:
- Office
- Date of birth
- Start date
- Twitter and YouTube id where available.
- Clickable website link. When clicked this link should open in a new tab. 

Marking 

This assignment is worth 50% of the total module mark. You will receive an overall grade for the assignment. In determining the grade, the following weighting will be used: 

a) 25%: for implementing the functionality described in step 1 above. 

b) 10%: for implementing the functionality described in step 2 above. 

c) 25%: for implementing the functionality described in step 3 above. 

d) 30%: for implementing the functionality described in step 4 above. 

e) 10%: overall impression and quality of the overall design. For example, have you included appropriate and effective error handing? Is the information presented in a clear and uncluttered manner? Does  the website make appropriate use of HTML, CSS, and JavaScript. 

Submitting 

Submit a single zip file using BrightSpace. The zip file should include a folder containing your webpage and any associated files.

Please name your zip file using the following format: "GroupNo_Firstname_Lastname_A2_COMP30680.zip". The deadline for submission is listed on BrightSpace under assignment 2.

Viewing the JSON data 

To get an initial overview of the data in the JSON query, it is helpful to view it in a JSON viewer such as the  one available at http://jsonviewer.stack.hu/. This will give you a tree like view of the data.  

Code validation: 

Your webpage should be consistent with the HTML5 and CSS3 standards.  

Code reuse 

The webpage must be your own work. Any code snippets that are not directly written by you (e.g. used from  a tutorial) must be referenced as such within your code. You must directly comment the code to explain its source. Failure to reference code that is not yours will be treated as plagiarism.

Due on 06 November 2023 11:59 PM


# Developer notes
## How to start a new branch
1. Check out main, pull down from main to pull any changes
`git pull`
2. Checkout a new branch
`git checkout -b BRANCH_NAME`
3. Make changes in branch
4. Checkout main again, and then merge into your branch
```
git checkout main
git pull
git checkout MY_BRANCH
git merge main
git push
```
5. Resolve conflicts if any (might need to coordinate here)
6. Push to remote (MAKE SURE YOU ARE ON YOUR BRANCH)
`git push`
7. Open PR, from your branch into main - drop link to issue in the PR for reference; leave any comments questions etc
8. Other person must approve - then we can merge into main
