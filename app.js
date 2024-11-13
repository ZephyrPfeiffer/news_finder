const getEditDistance = require("./utility/edit_distance");

const express = require("express");

// express
const app = express();

app.use(express.json());

// listen for requests
app.listen(3000);

// routes
app.get("/gamenews", async (req, res) => {
  // request game name and appid information for all steam games
  const response = await fetch(
    "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
  );
  const steamGames = await response.json();

  let newsRequestParameters = {
    gameName: "omega strikers",
    newsCount: 3,
    newsLength: 1000,
    ...req.body,
  };

  // intialize variable to hold first edit distance
  let minEditDistance = getEditDistance(
    newsRequestParameters.gameName.toLowerCase(),
    steamGames.applist.apps[0].name.toLowerCase()
  );

  // intialize object to hold info on game whose name has the current min edit distance value with user provided game name
  let gameInfo = {
    appid: steamGames.applist.apps[0].appid,
    gameName: steamGames.applist.apps[0].name,
  };

  // iterate through game info to find game name with lowest edit distance to user provided game name
  for (let i = 1; i < steamGames.applist.apps.length; i++) {
    let editDistance = getEditDistance(
      newsRequestParameters.gameName.toLowerCase(),
      steamGames.applist.apps[i].name.toLowerCase()
    );

    // if game name is exact match, update gameInfo object and exit loop
    if (editDistance === 0) {
      gameInfo.appid = steamGames.applist.apps[i].appid;
      gameInfo.gameName = steamGames.applist.apps[i].name;
      break;
    }
    if (editDistance < minEditDistance) {
      minEditDistance = editDistance;
      gameInfo.appid = steamGames.applist.apps[i].appid;
      gameInfo.gameName = steamGames.applist.apps[i].name;
    }
  }

  // fetch news for specified game
  const newsData = await fetch(
    `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${gameInfo.appid}&count=${newsRequestParameters.newsCount}&maxlength=${newsRequestParameters.newsLength}&format=json`
  );

  const gameNews = await newsData.json();

  // create initial response object
  let newsInformation = {
    gameName: gameInfo.gameName,
    newsItems: [],
  };

  // populate response object with relevent game news information
  for (let i = 0; i < gameNews.appnews.newsitems.length; i++) {
    newsInformation.newsItems.push({
      title: gameNews.appnews.newsitems[i].title,
      author: gameNews.appnews.newsitems[i].author,
      url: gameNews.appnews.newsitems[i].url,
      newsContent: gameNews.appnews.newsitems[i].contents,
    });
  }
  res.json(newsInformation);
});
