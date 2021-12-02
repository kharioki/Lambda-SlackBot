# Lambda-SlackBot

A Slack app(bot) that performs CRUD operations on a Postgres database.

This app is built on top of the [Lambda](https://aws.amazon.com/lambda/) services.

## Installation

To use this app, you're need some prerequisites:

- AWS configuration on your machine
- A Postgres database
- A Slack workspace
- Serverless Framework configuration
- ngrok - a local tunneling service (optional)

To get started:

```bash
npm install

```

add a `.env` file with your Slack app token, signing secret and the Postgres database credentials.
You can copy the `.env.local` file to `.env` and edit it to show your values.

```bash
SLACK_BOT_TOKEN=YOUR_SLACK_BOT_TOKEN
SLACK_SIGNING_SECRET=YOUR_SLACK_APP_SIGNING_SECRET
DB_URL=YOUR_DB_URL
```

Running locally:

```bash
npx serverless offline --noPrependStageInUrl
```

then

```bash
ngrok http 3000
```

Deploying to AWS:

If you have serverless configuration, you can deploy to AWS:

```bash
npx serverless deploy
```
