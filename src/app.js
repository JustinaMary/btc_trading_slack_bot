const { App } = require("@slack/bolt");
import {
  SLACK_OAUTH_TOKEN,
  BTC_SIGNAL,
  SIGNING_SECRET,
  SLACK_APP_TOKEN,
} from "./constants";
const axios = require("axios");

// Initialize your app with your bot token
const app = new App({
  token: SLACK_OAUTH_TOKEN,
  signingSecret: SIGNING_SECRET,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

app.message(async ({ message, say }) => {
  console.log("message", message);
  var textMsg = message.text.toLowerCase();
  if (textMsg == "hi" || textMsg == "hello" || textMsg == "hey") {
    await hello(say, message);
  }
  if (isNumberCheck(textMsg)) {
    await invoke_btc_signal(parseInt(textMsg));
  }
});

async function hello(say, message) {
  // say() sends a message to the channel where the event was triggered
  await say({
    text: `Hey there <@${message.user}>!\nPlease enter your current portfolio size`,
  });
}

async function invoke_btc_signal(equity) {
  // Make API request with parameters
  const apiUrl = `https://btc-trading-api-new.onrender.com/api/get_data/${equity}`;
  const response = await axios.get(apiUrl);
  try {
    await app.client.chat.postMessage({
      token: SLACK_OAUTH_TOKEN,
      channel: BTC_SIGNAL, // Replace with your channel ID
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `Requested data for equity: ${equity}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Price:*\n${response.data.price}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Average Entry:*\n${response.data.average_entry}`,
            },
            {
              type: "mrkdwn",
              text: `*Average Exit:*\n${response.data.average_exit}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Current Equity:*\n${response.data.current_equity}`,
            },
            {
              type: "mrkdwn",
              text: `*Percent Returns:*\n${response.data.percent_returns}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Position Size:*\n${response.data.position_size}`,
            },
            {
              type: "mrkdwn",
              text: `*Unrealized PNL:*\n${response.data.unrealized_pnl}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Realized PNL:*\n${response.data.realized_pnl}`,
            },
            {
              type: "mrkdwn",
              text: `*Starting Equity:*\n${response.data.starting_equity}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Symbol:*\n${response.data.symbol}`,
            },
            {
              type: "mrkdwn",
              text: `*Total PNL:*\n${response.data.total_pnl}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Message:*\n${response.data.message}`,
            },
            {
              type: "mrkdwn",
              text: `*Remaining Time:*\n${response.data.remaining_time}`,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error sending signal response:", error);
  }
}

function isNumberCheck(text) {
  return !isNaN(text);
}

// Start the app
(async () => {
  await app.start(5000);
  try {
    await app.client.chat.postMessage({
      token: SLACK_OAUTH_TOKEN,
      channel: BTC_SIGNAL, // Replace with your channel ID
      text: "Bot is now online and ready to assist!",
    });
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
})();
