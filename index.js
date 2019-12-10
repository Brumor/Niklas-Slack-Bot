const htmlParser = require("node-html-parser");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

const PORT = process.env.PORT || 3000;
const SLACK_HOOK = process.env.SLACK_HOOK;

app.listen(process.env.PORT || PORT, function() {
  console.log("Bot is listening on port " + PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const getDaylyMenuFromHTML = html => {
  const parsedHTML = htmlParser.parse(html);
  const pages = parsedHTML.querySelector("p").text;
  const menu = pages.split(/(Meny vecka|THANK)/)[2];
  const date = new Date();
  const day = date.getDay();

  switch (day) {
    case 1:
      return menu.split(/(Måndag|Tisdag)/)[2];
      break;
    case 2:
      return menu.split(/(Tisdag|Onsdag)/)[2];
      break;
    case 3:
      return menu.split(/(Onsdag|Torsdag)/)[2];
      break;
    case 4:
      return menu.split(/(Torsdag|Fredag)/)[2];
      break;
    case 5:
      return menu.split(/(Fredag|Hela Veckan)/)[2];
      break;
    default:
      return "No niklas today!";
  }
};

const getWeeklyMenuFromHTML = html => {
  const parsedHTML = htmlParser.parse(html);
  const pages = parsedHTML.querySelector("p").text;
  const menu = pages.split(/(Meny vecka|THANK)/)[2];
  return menu.split(/(Hela Veckan)/)[2];
};

app.post("/today", (req, res) => {
  request("http://niklasandfriends.se/hem/", (error, response, body) => {
    const dailyMenu = getDaylyMenuFromHTML(body);

    const data = {
      response_type: "in_channel",
      text: dailyMenu
    };

    request.post(
      SLACK_HOOK,
      {
        "content-type": "application/json",
        body: JSON.stringify(data)
      },
      function(error, response, body) {
        // Sends welcome message
        console.log(body);
        res.json();
      }
    );
  });
});

app.post("/weekly", (req, res) => {
  request("http://niklasandfriends.se/hem/", (error, response, body) => {
    const weeklyMenu = getWeeklyMenuFromHTML(body);

    const data = {
      response_type: "in_channel",
      text: weeklyMenu
    };

    request.post(
      SLACK_HOOK,
      {
        "content-type": "application/json",
        body: JSON.stringify(data)
      },
      function(error, response, body) {
        // Sends welcome message
        console.log(body);
        res.json();
      }
    );
  });
});
