
/*https://rapidapi.com/kizil/api/feed-reader3/*/
const rssURLs = JSON.stringify([
  'https://krebsonsecurity.com/feed/',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://threatpost.com/feed/'
]);
const feedDescs = JSON.stringify(['KrebsOnSecurity','BBC World News','ThreatPost']);

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

async function getRSS(feedUrl){

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

function visualizePosts(){

  const feedsDiv = document.createElement("div");
  document.body.appendChild(feedsDiv);
  feedsDiv.id = "feeds";

  let i = 0;
  for(let feedURL of cookieFeed){

    const feedDesc = cookieFeedDescs[i++];
    const rssPromise = getRSS(feedURL);
    rssPromise.then((rss)=>{
      const feedDiv = document.createElement("div");
      const feedDescNode = document.createElement("h1");
      feedDescNode.appendChild(document.createTextNode(feedDesc));
      feedDescNode.className = "feedDescription";
      feedDiv.className = "feed";
      feedDiv.appendChild(feedDescNode);
      feedsDiv.appendChild(feedDiv);

      if('error' in rss){
        const errorNode = document.createElement("p");
        errorNode.appendChild((document.createTextNode(rss.error)));
        feedDiv.appendChild(errorNode);
        return;
      }

      for(let post of rss['data']){
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
    });
  }
}

visualizePosts();
