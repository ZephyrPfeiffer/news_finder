const getEditDistance = require("./utility/edit_distance");

const express = require("express");

// express
const app = express();

// listen for requests
app.listen(3000);

// routes
app.get("/gamenews", async (req, res) => {
  const response = await fetch(
    "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
  );
  const data = await response.json();

  const gameToFind = "the last spell".toLowerCase();

  let currentMinValue = getEditDistance(
    gameToFind,
    data.applist.apps[0].name.toLowerCase()
  );

  let currentGame = {
    appid: data.applist.apps[0].appid,
    gameName: data.applist.apps[0].name,
  };

  for (let i = 1; i < data.applist.apps.length; i++) {
    let editDistance = getEditDistance(
      gameToFind,
      data.applist.apps[i].name.toLowerCase()
    );

    if (editDistance === 0) {
      currentGame.appid = data.applist.apps[i].appid;
      currentGame.gameName = data.applist.apps[i].name;
      break;
    }
    if (editDistance < currentMinValue) {
      currentMinValue = editDistance;
      currentGame.appid = data.applist.apps[i].appid;
      currentGame.gameName = data.applist.apps[i].name;
    }
  }

  console.log(currentGame);

  const newsData = await fetch(
    `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${currentGame.appid}&count=10&maxlength=1000&format=json`
  );

  const gameNews = await newsData.json();

  res.json(gameNews);
});

app.use((req, res) => {
  res.status(404).sendFile("./views/error404.html", { root: __dirname });
});
