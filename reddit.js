let puppeteer = require("puppeteer");
let self = {
  browser: null,
  page: null,
  initialize: async () => {
    self.browser = await puppeteer.launch({ headless: false });
    self.page = await self.browser.newPage();
  },
  login: async (username, password) => {
    await self.page.goto("https://old.reddit.com/", {
      waitUntil: "networkidle0",
    });
    await self.page.type("input[name=user]", username, { delay: 30 });
    await self.page.type("input[name=passwd]", password, { delay: 30 });
    await self.page.click("#login_login-main > div.submit > button");

    // Wait for "Logout" button to appear or error message
    await self.page.waitFor(
      "form[action='https://old.reddit.com/logout'], div[class='status error']"
    );
    let error = await self.page.$("div[class='status error']");
    if (error) {
      let errorMessage = await (await error.getProperty("innerText")).jsonValue;
      console.error("problem logging in", errorMessage);
    } else {
      console.log("we are logged in! ");
    }
  },
  getResults: async () => {
    await self.page.goto("https://old.reddit.com/message/inbox", {
      waitUntil: "networkidle0",
    });
    let newMessages = await self.page.$$(".new");
    if (newMessages.length == 0) {
      console.log("No new messages");
      return;
    }
    for (let newMessage of newMessages) {
      let sender = await newMessage.$eval(".author", (node) => node.innerText);
      if (sender == "-Elven-Supremacist-") {
        await self.page.click("a[data-event-action='reply']");
        await self.page.type("textarea[name=text]", process.env.MESSAGE, {
          delay: 30,
        });
        await self.page.click("button[type=submit]");
      }
    }
    return newMessages;
  },
};

module.exports = self;
