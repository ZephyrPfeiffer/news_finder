const getEditDistance = require("./utility/edit_distance");

const express = require("express");

// express
const app = express();

// register view engine
app.set("view engine", "ejs");

// listen for requests
app.listen(3000);

// routes
app.get("/gamenews", async (req, res) => {
  const response = await fetch(
    "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
  );
  const data = await response.json();

  const gameToFind = "Billy";

  let currentMinValue = 99999;
  let currentGame = { appid: 0, gameName: "" };

  for (let i = 0; i < data.applist.apps.length; i++) {
    let editDistance = getEditDistance(gameToFind, data.applist.apps[i].name);

    if (editDistance === 0) {
      currentGame.appid = data.applist.apps[i].appid;
      currentGame.gameName = data.applist.apps[i].name;
      break;
    } else if (editDistance < currentMinValue) {
      currentMinValue = editDistance;
      currentGame.appid = data.applist.apps[i].appid;
      currentGame.gameName = data.applist.apps[i].name;
    }
  }

  res.json(currentGame);
});

app.use((req, res) => {
  res.status(404).sendFile("./views/error404.html", { root: __dirname });
});
