const getEditDistance = require("./utility/edit_distance");

const express = require("express");

// express
const app = express();

// listen for requests
app.listen(3000);

// routes
app.get("/gamenews", async (req, res) => {
  // request game name and appid information for all steam games
  const response = await fetch(
    "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
  );
  const steamGames = await response.json();

  const gameToFind = "omega strikers".toLowerCase();

  // intialize variable to hold first edit distance
  let minEditDistance = getEditDistance(
    gameToFind,
    steamGames.applist.apps[0].name.toLowerCase()
  );

  // intialize object to hold info on game whose name has the current min edit distance value with user provided game name
  let gameInfo = {
    appid: steamGames.applist.apps[0].appid,
    gameName: steamGames.applist.apps[0].name,
  };

  // iterate through game info to find game name with lowest edit distance to user provided game name
  for (let i = 1; i < data.applist.apps.length; i++) {
    let editDistance = getEditDistance(
      gameToFind,
      steamGames.applist.apps[i].name.toLowerCase()
    );

    // if game name is exact match, return the current game
    if (editDistance === 0) {
      gameInfo.appid = steamGames.applist.apps[i].appid;
      gameInfo.gameName = steamGames.applist.apps[i].name;
      break;
    }
    if (editDistance < currentMinValue) {
      currentMinValue = editDistance;
      gameInfo.appid = steamGames.applist.apps[i].appid;
      gameInfo.gameName = steamGames.applist.apps[i].name;
    }
  }

  console.log(gameInfo);

  // fetch news for specified game
  const newsData = await fetch(
    `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${gameInfo.appid}&count=10&maxlength=1000&format=json`
  );

  const gameNews = await newsData.json();

  res.json(gameNews);
});

app.use((req, res) => {
  res.status(404).sendFile("./views/error404.html", { root: __dirname });
});
