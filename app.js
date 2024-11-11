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

function getEditDistance(string1, string2) {
  if (string1 === string2) {
    return 0;
  }

  let matrix = [[0]];

  for (let i = 0; i < string1.length; i++) {
    matrix[0].push(i + 1);
  }

  for (let i = 0; i < string2.length; i++) {
    matrix.push([i + 1, ...Array(string1.length)]);
  }

  for (let i = 1; i < matrix.length; i++) {
    for (let j = 1; j < matrix[i].length; j++) {
      let minValue =
        matrix[i - 1][j - 1] + (string1[i - 1] === string2[i - 1] ? 0 : 1);

      if (matrix[i - 1][j] + 1 < minValue) {
        minValue = matrix[i - 1][j] + 1;
      } else if (matrix[i][j - 1] + 1 < minValue) {
        minValue = matrix[i][j - 1] + 1;
      }

      matrix[i][j] = minValue;
    }
  }

  return matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1];
}
