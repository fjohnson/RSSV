const maxArticles = 10;
let hasSaved = false;

async function getRSS(feedUrl){
  /*https://rapidapi.com/kizil/api/feed-reader3/*/

  const encodedUrl = encodeURIComponent(feedUrl);
  const apiUrl = `https://feed-reader3.p.rapidapi.com/load?url=${encodedUrl}&maxCount=${maxArticles}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4786031d7dmsh01cc3b12b2500f5p1b86b1jsn5af09d3dbd7e',
      'X-RapidAPI-Host': 'feed-reader3.p.rapidapi.com'
    }
  };

  try {
      const response = await fetch(apiUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return {'data':(await response.json())['data']};

  } catch (error) {
      return  {'error': error.message}
  }
}

function validateStorage(){
  const jsonUrls = window.localStorage.getItem("urls");
  const jsonDescriptions = window.localStorage.getItem("descriptions");
  if(!jsonUrls) return null;
  if(!jsonDescriptions) return null;

  const urls = JSON.parse(jsonUrls);
  const descriptions = JSON.parse(jsonDescriptions);

  if(urls.length !== descriptions.length) return null;
  return [urls,descriptions];
}
async function visualizePosts(){

  const localStorage = validateStorage();
  if(localStorage === null) return;

  const [urls, descriptions] = localStorage;

  const feedRoot = document.getElementById("feeds");
  if(feedRoot) feedRoot.remove();

  const feedsDiv = document.createElement("div");
  document.body.appendChild(feedsDiv);
  feedsDiv.id = "feeds";

  const menu = document.getElementById("usage-menu");
  while (menu.firstChild) {
    menu.removeChild(menu.firstChild);
  }

  const rssPromises = []
  for(let feedURL of urls){
    rssPromises.push(getRSS(feedURL));
  }

  let i = 0;
  for await(let rss of rssPromises){
    const feedDesc = descriptions[i++];
    addFeedHtml(rss, feedDesc, 'z'+i);
  }
}

function addFeedHtml(rss, feedDesc, id){
  const feedsDiv = document.getElementById("feeds");
  const feedDiv = document.createElement("div");
  const feedDescNode = document.createElement("h1");
  feedDescNode.appendChild(document.createTextNode(feedDesc));
  feedDescNode.className = "feedDescription";
  feedDiv.id = id
  feedDiv.className = "feed";
  feedDiv.appendChild(feedDescNode);
  feedsDiv.appendChild(feedDiv);

  if('error' in rss){
    const errorNode = document.createElement("p");
    errorNode.appendChild((document.createTextNode(rss.error)));
    feedDiv.appendChild(errorNode);
    return;
  }

  const menu = document.getElementById("usage-menu");
  menu.insertAdjacentHTML(
    'beforeend',
    `<md-menu-item href="#${id}">
             <div slot="headline">${feedDesc}</div>
         </md-menu-item>`
  );

  for(let post of rss['data']){
    const postDiv = document.createElement("div");
    const postHeader = document.createElement("div");
    const link = document.createElement("a");
    const date = document.createElement("p");
    const description = document.createElement("p");


    postDiv.className = "post";
    postDiv.appendChild(postHeader);
    postDiv.appendChild(description);
    postHeader.className = "postHeader";
    postHeader.append(link, date);

    link.setAttribute("href",post["link"]);
    link.appendChild(document.createTextNode(post["title"]));
    link.className = "rssLink";
    date.className="publishDate";
    date.appendChild(document.createTextNode(post["publishDateFormatted"]));
    description.appendChild(document.createTextNode(post["description"]));

    feedDiv.appendChild(postDiv);
  }
}
visualizePosts();

/* *
 Titlebar related code
 */
const titleBarCenter = document.getElementById("titleBarCenter");
const elements = document.querySelectorAll(".titleBarComponent");
const element = elements[0]; // target element that has animation ending last

element.addEventListener('animationend', function(event) {
  const nodeListArray = Array.from(elements);
  for(let e of nodeListArray.slice(0,3)){
    e.remove();
  }
  nodeListArray[nodeListArray.length-1].style.position = "static";
});

/* *
* Edit RSS URLs specific code
* */
const feedRow =
  `<div class="rss-entry">
    <md-outlined-text-field class="rss-url" label="RSS Url" type="url" required>
        <md-icon slot="leading-icon">rss_feed</md-icon>
    </md-outlined-text-field>

    <md-outlined-text-field class="rss-description" type="text" label="Title" value=""
                            required error-text="Please fill out this field">
    </md-outlined-text-field>

    <md-filled-tonal-icon-button class="shift-button">
        <md-icon>arrow_upward</md-icon>
    </md-filled-tonal-icon-button>

    <md-filled-tonal-icon-button class="delete-button">
        <md-icon>delete_forever</md-icon>
    </md-filled-tonal-icon-button>
</div>`;


document.addEventListener('DOMContentLoaded', function() {
  const newFeedButton = document.getElementById("new-feed-button");
  const rssUrlsDiv = document.getElementById("rss-urls");

  for (let dButton of document.getElementsByClassName("delete-button")){
    dButton.addEventListener("click", deleteButtonListener);
  }
  for (let shiftButton of document.getElementsByClassName("shift-button")){
    shiftButton.addEventListener("click", shiftButtonListener);
  }

  newFeedButton.addEventListener("click", function(){
    newRssUrlRow();
  });

  function deleteButtonListener(event){
    const button = event.target;
    rssUrlsDiv.removeChild(button.parentElement);

    if(rssUrlsDiv.children.length===1){
      const onlyRow = rssUrlsDiv.children[0];
      const shiftButton = onlyRow.getElementsByClassName("shift-button")[0];
      shiftButton.querySelector("md-icon").textContent = "arrow_downward";
    }
  }

  function shiftButtonListener(event){
    const thisRow = event.target.parentElement;
    const selector = ".shift-button > md-icon";

    let i = 0;
    for(let row of rssUrlsDiv.children){
      if(thisRow === row) break;
      else i++;
    }
    if(i===0){ //shift down
      if(rssUrlsDiv.children.length > 1) {
        const siblingRow = rssUrlsDiv.children[1];

        thisRow.remove();
        insertAfter(thisRow, siblingRow);
        thisRow.querySelector(selector).textContent = "arrow_upward";
        siblingRow.querySelector(selector).textContent = "arrow_downward";
      }

    }
    else{ //shift up
      const siblingRow = rssUrlsDiv.children[i-1];

      rssUrlsDiv.insertBefore(thisRow,siblingRow);
      if(i-1 === 0){
        thisRow.querySelector(selector).textContent = "arrow_downward";
        siblingRow.querySelector(selector).textContent = "arrow_upward";
      }
    }
  }
  function insertAfter(newElement, targetElement) {
    const parentElement = targetElement.parentNode;
    const siblingElement = targetElement.nextSibling;

    if (siblingElement) {
      parentElement.insertBefore(newElement, siblingElement);
    } else {
      parentElement.appendChild(newElement);
    }
  }

  const editButton = document.getElementById("rss-settings-edit-button");
  editButton.addEventListener("click", ()=>{
    const rssEditModal = document.getElementById("edit-feeds-modal");
    const controlPanel = document.getElementById("control-panel");

    rssEditModal.style.display = 'block';
    hasSaved = false;
    controlPanel.style.display='none';

    populateModal();
  });

  const exitButton = document.getElementById("rss-settings-exit-button");
  exitButton.addEventListener("click", ()=>{
    const rssEditModal = document.getElementById("edit-feeds-modal");
    const controlPanel = document.getElementById("control-panel");

    rssEditModal.style.display = 'none';
    controlPanel.style.display='flex';
    if(hasSaved){
      visualizePosts();
    }
  });

  const saveButton = document.getElementById("save-feeds-button");
  saveButton.addEventListener("click", () => {
    const urls = [];
    const descriptions = [];
    const validationResults = [];

    for(let url of document.getElementsByClassName("rss-url")){
      validationResults.push(url.reportValidity());
      urls.push(url.value);
    }

    for(let description of document.getElementsByClassName("rss-description")){
      validationResults.push(description.reportValidity());
      descriptions.push(description.value);
    }

    if(
       (validationResults.every((v)=>v) && urls.length && descriptions.length) ||
       (!urls.length && !descriptions.length) // case where there are no rows.
    ){
      window.localStorage.setItem("urls", JSON.stringify(urls));
      window.localStorage.setItem("descriptions", JSON.stringify(descriptions));
      hasSaved = true;
    }

  });

  const anchorEl = document.body.querySelector('#usage-anchor');
  const menuEl = document.body.querySelector('#usage-menu');
  anchorEl.addEventListener('click', () => { menuEl.open = !menuEl.open; });

  function newRssUrlRow(url=null, description=null){

    rssUrlsDiv.insertAdjacentHTML("beforeend", feedRow);

    const newRow = rssUrlsDiv.children[rssUrlsDiv.children.length-1];
    const shiftButton = newRow.getElementsByClassName("shift-button")[0];
    const dButton = newRow.getElementsByClassName("delete-button")[0];

    shiftButton.addEventListener("click", shiftButtonListener);
    dButton.addEventListener("click", deleteButtonListener);

    if(rssUrlsDiv.children.length===1){
      shiftButton.querySelector("md-icon").textContent = "arrow_downward";
    }

    if(url && description){
      const urlInput = newRow.getElementsByClassName("rss-url")[0];
      const descInput = newRow.getElementsByClassName("rss-description")[0];
      urlInput.value = url;
      descInput.value = description;
    }
  }
  function populateModal(){

    for(let child of rssUrlsDiv.children){
      child.remove();
    }

    const storage = validateStorage();
    if(!storage) return;

    const [urls, descriptions] = storage;
    let i = 0;
    for(let url of urls){
      newRssUrlRow(url, descriptions[i++]);
    }
  }

});
