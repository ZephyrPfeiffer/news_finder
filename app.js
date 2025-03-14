const getEditDistance = require("./utility/edit_distance");
const sortNews = require("./utility/date_sort");
const { body, validationResult } = require("express-validator");

const express = require("express");

// express
const app = express();

// middleware
app.use(express.json());

// listen for requests
app.listen(3000);

// routes

// retrieves news information for a specified game
app.get(
  "/gamenews",
  // check for properties that shouldn't be inside body object
  body()
    .custom((body, { req }) => {
      const validProperties = [
        "gameName",
        "newsCount",
        "newsLength",
        "dateSort",
      ];
      const userProvidedProperties = Object.keys(body);
      let invalidProperties = [];
      let bodyIsValid = true;

      for (let i = 0; i < userProvidedProperties.length; i++) {
        if (!validProperties.includes(userProvidedProperties[i])) {
          bodyIsValid = false;
          invalidProperties.push(userProvidedProperties[i]);
        }
      }

      req.invalidProperties = invalidProperties;

      return bodyIsValid;
    })
    .withMessage((value, { req }) => {
      return `Body object includes properties that shouldn't exist: ${req.invalidProperties.join(
        ", "
      )}`;
    }),
  // make sure that all required properties are inside body object
  body()
    .custom((body, { req }) => {
      const validProperties = [
        "gameName",
        "newsCount",
        "newsLength",
        "dateSort",
      ];
      const bodyProperties = Object.keys(body);
      let missingProperties = [];
      let bodyIsValid = true;

      for (let i = 0; i < validProperties.length; i++) {
        if (!bodyProperties.includes(validProperties[i])) {
          missingProperties.push(validProperties[i]);
          bodyIsValid = false;
        }
      }

      req.missingProperties = missingProperties;

      return bodyIsValid;
    })
    .withMessage((value, { req }) => {
      return `Body object is missing the following properties: ${req.missingProperties.join(
        ", "
      )}`;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    // fetch news for specified game
    const newsData = await fetch(
      `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${gameInfo.appid}&count=${newsRequestParameters.newsCount}&maxlength=${newsRequestParameters.newsLength}&format=json`
    );

    const gameNews = await newsData.json();

    if (newsRequestParameters.dateSort) {
      gameNews.appnews.newsitems = sortNews(
        gameNews.appnews.newsitems,
        newsRequestParameters.dateSort
      );
    }

    // create object that will hold all information that was requested into a more readable format
    let newsInformation = {
      gameName: gameInfo.gameName,
      newsItems: [],
    };

    // populate response object with relevent information
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
  }
);

// test routes

app.get(
  "/test",
  body("message").isEmpty().withMessage("Message can not be empty"),
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return res.status(200).json(req.body.userName);
    }

    res.status(400).json({ errors: errors.array() });
  }
);
