const reddit = require("./reddit.js");

(async () => {
  await reddit.initialize();
  await reddit.login(process.env.USERNAME, process.env.PASSWORD);

  setInterval(async () => {
    reddit.getResults();
  }, 30000);
})().catch(console.error);
