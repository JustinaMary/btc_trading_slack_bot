const { App } = require("@slack/bolt");
import {
  SLACK_OAUTH_TOKEN,
  BTC_SIGNAL,
  SIGNING_SECRET,
  SLACK_APP_TOKEN,
} from "./constants";
const axios = require("axios");
const cron = require("node-cron");

// Initialize your app with your bot token
const app = new App({
  token: SLACK_OAUTH_TOKEN,
  signingSecret: SIGNING_SECRET,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

// Scheduled the  btc signal to run every 8 hours
cron.schedule("0 */8 * * *", async () => {
  await invoke_btc_signal();
});

// app.message(async ({ message, say }) => {
//   var textMsg = message.text.toLowerCase();
//   if (textMsg == "hi" || textMsg == "hello" || textMsg == "hey") {
//     await hello(say, message);
//   }
//   if (isNumberCheck(textMsg)) {
//     await invoke_btc_signal(parseInt(textMsg));
//   }
// });

// async function hello(say, message) {
//   // say() sends a message to the channel where the event was triggered
//   await say({
//     text: `Hey there <@${message.user}>!\nPlease enter your current portfolio size`,
//   });
// }

async function invoke_btc_signal() {
  const apiUrl = `https://btc-trading-api-new.onrender.com/api/get_data`;
  const response = await axios.get(apiUrl);
  try {
    await app.client.chat.postMessage({
      token: SLACK_OAUTH_TOKEN,
      channel: BTC_SIGNAL, // Replace with your channel ID
      text: `BTCUSDT *${response.data.signal.toUpperCase()}* Signal! *Price:* ${
        response.data.price
      }`,
      blocks: [
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `BTCUSDT *${response.data.signal.toUpperCase()}* Signal! *Price:* ${
                response.data.price
              }`,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error sending signal response:", error);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for the specified time (e.g., 5 seconds)
    await invoke_btc_signal(); // Call the method again
  }
}

app.client.on("disconnect", async () => {
  await startBot();
});

async function startBot() {
  try {
    await app.start(3001);
  } catch (error) {
    console.error("Error starting the bot:", error);
    setTimeout(startBot, 5000); // Retry after 5 seconds
  }
}

// Start the app
(async () => {
  await app.start(3001);
  try {
    await invoke_btc_signal();
  } catch (error) {
    console.error("Error starting the bot..", error);
  }
})();
