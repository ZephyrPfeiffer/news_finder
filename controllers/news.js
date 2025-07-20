const getEditDistance = require("../utility/edit_distance");
const sortNews = require("../utility/date_sort");

module.exports = {
  getGameNews: async (req, res) => {
    console.log(req.body);

    // initialize default request parmeters and overwrite any default values with user provided ones
    let newsRequestParameters = {
      gameName: "lethal company",
      newsCount: 10,
      newsLength: 1000,
      dateSort: "",
      ...req.body,
    };

    // update news request parameters object with values from body object in request if it exists
    // if (req.body) {
    //   newsRequestParameters = { ...newsRequestParameters, ...req.body };
    // }

    // request game name and appid information for all steam games
    const response = await fetch(
      "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
    );
    const steamGames = await response.json();

    // create variable to hold first edit distance for comparsion later
    let minEditDistance = getEditDistance(
      newsRequestParameters.gameName.toLowerCase(),
      steamGames.applist.apps[0].name.toLowerCase()
    );

    // create object to hold info on game with (current) lowest edit distance to user provided game name
    let gameInfo = {
      appid: steamGames.applist.apps[0].appid,
      gameName: steamGames.applist.apps[0].name,
    };

    // iterate through game info to find game name with lowest edit distance when compared to user provided game name
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

    // fetch news for game that had lowest edit distance when compared to user provided game name
    const newsData = await fetch(
      `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${gameInfo.appid}&count=${newsRequestParameters.newsCount}&maxlength=${newsRequestParameters.newsLength}&format=json`
    );

    const gameNews = await newsData.json();

    // sort news based on user provided input
    if (newsRequestParameters.dateSort) {
      gameNews.appnews.newsitems = sortNews(
        gameNews.appnews.newsitems,
        newsRequestParameters.dateSort
      );
    }

    // create response object that will hold all news information that was requested by user in a more readable format
    let newsInformation = {
      gameName: gameInfo.gameName,
      newsItems: [],
    };

    // populate response object with news information
    for (let i = 0; i < gameNews.appnews.newsitems.length; i++) {
      newsInformation.newsItems.push({
        title: gameNews.appnews.newsitems[i].title,
        date: new Date(
          gameNews.appnews.newsitems[i].date * 1000
        ).toLocaleDateString(),
        author: gameNews.appnews.newsitems[i].author,
        url: gameNews.appnews.newsitems[i].url,
        newsContent: gameNews.appnews.newsitems[i].contents,
      });
    }

    res.json(newsInformation);
  },
};
