require('dotenv').config();
const { App, AwsLambdaReceiver } = require('@slack/bolt');

const db = require('./queries');

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

// commands
// adding a user
app.command('/add-user', async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'add_user_modal',
        title: {
          type: 'plain_text',
          text: 'Add User'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'user_name',
            label: {
              type: 'plain_text',
              text: 'User Name'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'user_name'
            }
          },
        ]
      }
    });

    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// listen for add user modal submission
app.view('add_user_modal', async ({ ack, body, view, client }) => {
  await ack();
  // get vals
  const userName = view.state.values.user_name.user_name.value;
  const user = body.user.id;

  let msg = '';
  // add user to db
  const res = await db.createUser(userName);

  if (res) {
    msg = `${userName} added to the database`;
  } else {
    msg = `${userName} could not be added to the database`;
  }
  //send message to sender
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

// update user command
app.command('/update-user', async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'update_user_modal',
        title: {
          type: 'plain_text',
          text: 'Update User'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'user_id',
            label: {
              type: 'plain_text',
              text: 'User ID'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'user_id'
            }
          },
          {
            type: 'input',
            block_id: 'user_name',
            label: {
              type: 'plain_text',
              text: 'User Name'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'user_name'
            }
          },
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for update user modal submission
app.view('update_user_modal', async ({ ack, body, view, client }) => {
  await ack();
  // get vals
  const userId = view.state.values.user_id.user_id.value;
  const userName = view.state.values.user_name.user_name.value;
  const user = body.user.id;

  let msg = '';
  // update user in db
  const res = await db.updateUser(userId, userName);

  if (res) {
    msg = `${userName} updated in the database`;
  } else {
    msg = `${userName} could not be updated in the database`;
  }

  //send message to sender
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

// list users
app.command('/list-users', async ({ ack, body, client }) => {
  await ack();

  const user = body.user_id;
  let msg = '';
  // db call
  const users = await db.getUsers();

  if (users) {
    msg = `Here are the users: ${users.map(user => user.user_name).join(', ')}`;
  } else {
    msg = `There are no users in the database`;
  }

  //send message to user
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

// get one user
app.command('/get-user', async ({ ack, body, client }) => {
  await ack();

  const id = body.text;
  const user = body.user_id;
  let msg = '';

  // db call
  const res = await db.getUser(id);

  if (res) {
    msg = `Here is the user: ${res.user_name}`;
  } else {
    msg = `User ${id} not found`;
  }

  //send message to user
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});


// delete user command
app.command('/delete-user', async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'delete_user_modal',
        title: {
          type: 'plain_text',
          text: 'Delete User'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'user_id',
            label: {
              type: 'plain_text',
              text: 'User ID'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'user_id'
            }
          },
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for delete user modal submission
app.view('delete_user_modal', async ({ ack, body, view, client }) => {
  await ack();
  // get vals
  const userId = view.state.values.user_id.user_id.value;
  const user = body.user.id;

  let msg = '';
  // delete user from db
  const res = await db.deleteUser(userId);

  if (res) {
    msg = `User with ID: ${userId} deleted from the database`;
  } else {
    msg = `User with ID: ${userId} could not be deleted from the database`;
  }

  //send message to sender
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
