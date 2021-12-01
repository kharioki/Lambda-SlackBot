require('dotenv').config();
const { App, AwsLambdaReceiver } = require('@slack/bolt');

// custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true
});

app.message('hello', async ({ message, say }) => {
  await say(`Hello <@${message.user}>!`);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
