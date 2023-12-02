
/*https://rapidapi.com/kizil/api/feed-reader3/*/
const rssURLs = JSON.stringify([
  'https://krebsonsecurity.com/feed/',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://threatpost.com/feed/'
]);
const feedDescs = JSON.stringify(['BBC World News','KrebsOnSecurity','ThreatPost']);

document.cookie = `feed=${rssURLs}; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`;
document.cookie = `feedDesc=${feedDescs}; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`;

function getCookieValue(cookieName) {
  const name = cookieName + "=";
  //const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = document.cookie.split(';')//decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return JSON.parse(cookie.substring(name.length, cookie.length));
    }
  }
  return null;
}

// Usage
const cookieFeed = getCookieValue("feed");
const cookieFeedDescs = getCookieValue("feedDesc");
const maxArticles = 10;

async function getRSS(){

  let apiUrlPartial = `https://feed-reader3.p.rapidapi.com/load?${maxArticles}=10&url=`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4786031d7dmsh01cc3b12b2500f5p1b86b1jsn5af09d3dbd7e',
      'X-RapidAPI-Host': 'feed-reader3.p.rapidapi.com'
    }
  };

  let i = 0;
  const feedResults = {};
  for(let rssURL of cookieFeed){
    const rssDesc = cookieFeedDescs[i++];

    try {
      const apiUrl = apiUrlPartial + encodeURIComponent(rssURL);
      const response = await fetch(apiUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }

      feedResults[rssURL] = {
        'feedDescription': rssDesc,
        'data': (await response.json())['data']
      }

    } catch (error) {
      feedResults[rssURL] = {
        'error': error.message
      }
    }
  }
  return feedResults;
}

async function visualizePosts(){
  const rss = await getRSS();
  const feedsDiv = document.createElement("div");
  document.body.appendChild(feedsDiv);
  feedsDiv.id = "feeds";

  for(let postURL of Object.keys(rss)){

    const feedDiv = document.createElement("div")
    const feedDesc = document.createElement("h1");
    feedDesc.className = "feedDescription"
    feedDiv.className = "feed"
    feedDiv.appendChild(feedDesc);
    feedsDiv.appendChild(feedDiv);

    if('error' in rss[postURL]){
      feedDesc.appendChild(document.createTextNode(postURL));
      const errorNode = document.createElement("p");
      errorNode.appendChild((document.createTextNode(rss[postURL]['error'])));
      feedDiv.appendChild(errorNode);
      continue;
    }
    else{
      feedDesc.appendChild(document.createTextNode(rss[postURL]['feedDescription']));
    }

    for(let post of rss[postURL]['data']){
      const postDiv = document.createElement("div");
      postDiv.className = "post"

      const postComponents = ["title", "description", "publishDateFormatted", "link", "author"];
      for(let component of postComponents){
        const componentData = post[component];
        if(componentData) {
          const p = document.createElement("p")
          p.className = component;
          p.appendChild(document.createTextNode(post[component]));
          postDiv.appendChild(p);
        }
      }
      feedDiv.appendChild(postDiv);
    }


  }
}
visualizePosts();
async function gogo() {
  const url = 'https://feed-reader3.p.rapidapi.com/loadMultiple?maxCount=100';
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '4786031d7dmsh01cc3b12b2500f5p1b86b1jsn5af09d3dbd7e',
      'X-RapidAPI-Host': 'feed-reader3.p.rapidapi.com'
    },
    body: JSON.stringify([
      'https://krebsonsecurity.com/feed/',
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://threatpost.com/feed/'
    ])
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
//gogo();
