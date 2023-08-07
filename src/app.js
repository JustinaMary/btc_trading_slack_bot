import { RTMClient } from "@slack/rtm-api";
import { SLACK_OAUTH_TOKEN, BTC_SIGNAL } from "./constants";
import { WebClient } from "@slack/web-api";
const packageJson = require("../package.json");

const rtm = new RTMClient(SLACK_OAUTH_TOKEN);
const web = new WebClient(SLACK_OAUTH_TOKEN);

rtm.start().catch(console.error);

rtm.on("ready", async () => {
  console.log("bot started");
  sendMessage(BTC_SIGNAL, `Bot version ${packageJson.version} is online.`);
});

rtm.on("slack_event", async (eventType, event) => {
  if (event && event.type === "message") {
    if (event.text === "!hello") {
      hello(event.channel, event.user);
    }
    if (isNumberCheck(event.text)) {
      invoke_btc_signal(parseInt(event.text), event.channel, event.user);
    }
  }
});

function hello(channelId, userId) {
  sendMessage(
    channelId,
    `Heya! <@${userId}>\nPlease enter your current portfolio size`
  );
}

async function invoke_btc_signal(equity, channelId, userId) {
  // Make API request with parameters
  const apiUrl = `https://btc-trading-api-new.onrender.com/api/get_data/${equity}`;
  const response = await axios.get(apiUrl);
  const responseText = `User <@${userId}> requested data for equity: ${equity}\nAPI Response: \nAverage Entry: ${response.average_entry}\nAverage Exit: ${response.average_exit}
 \nCurrent Equity: ${response.current_equity}\nPercent Returns: ${response.percent_returns}\nPosition Size: ${response.position_size}\nPrice: ${response.price}\nRealized PNL: ${response.realized_pnl}
 \nStarting Equity: ${response.starting_equity}\nSymbol: ${response.symbol}\nTotal PNL: ${response.total_pnl}\nUnrealized PNL: ${response.unrealized_pnl}`;
  sendMessage(channelId, responseText);
}

async function sendMessage(channel, message) {
  await web.chat.postMessage({
    channel: channel,
    text: message,
  });
}

function isNumberCheck(text) {
  return !isNaN(text);
}
