var cors = require("cors");
var express = require("express");
const webpush = require("web-push");

var app = express();

const vapidKeys = {
  publicKey:
    "BBZQEV_ea7V9oLCkSnf-tK7vwfhBNy7ldKI3HNxhQDnn2e5H5SgbC2l_uTo2z7lOoeS2DMga8EBiljX0z-xxb-E",
  privateKey: "i964WzIXeX585J7xYs15f2oVWzOR22s3mG-gm5WHSgY",
};

webpush.setVapidDetails(
  "mailto:umer@revolvinggames.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = {};

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/api/hello", function (req, res) {
  return res.status(200).send({ message: "Hello world!" });
});

app.post("/api/save-subscription", function (req, res) {
  const { account, subscription } = req.body;
  if (!account || !subscription) {
    return res.status(400).send({ message: "Invalid data." });
  }
  subscriptions[account] = subscription;
  console.log("Successfully subscribed.");
  return res.status(201).send({ message: "Successfully subscribed." });
});

app.delete("/api/delete-subscription", function (req, res) {
  const account = req.body.account;
  if (!account) {
    return res.status(400).send({ message: "Invalid data." });
  }
  delete subscriptions[account];
  console.log("Successfully unsubscribed.");
  return res.status(200).send({ message: "Successfully unsubscribed." });
});

app.post("/api/send", async function (req, res) {
  const { account, message } = req.body;
  if (!account || !message) {
    return res.status(400).send({ message: "Invalid data." });
  }
  const subscription = subscriptions[account];
  if (!subscription) {
    return res.status(404).send({ message: "Subscription not found." });
  }
  try {
    const result = await webpush.sendNotification(subscription, message);
    if (result.statusCode === 201) {
      console.log("A notification was sent.");
      return res.status(200).send({
        message: "The notification was sent successfully.",
      });
    }
  } catch (error) {
    console.log(error.body);
    return res.status(500).send({
      message: `Error: ${error.body}`,
    });
  }
});

app.listen(3001);
