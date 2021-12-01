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

  console.log(userName);
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

  console.log(userId);
  console.log(userName);
});

// list users
app.command('/list-users', async ({ ack, body, client }) => {
  await ack();

  const user = body.user_id;
  console.log(user);
  // db call
  // const users = await client.users.list();

  //send message
  await client.chat.postMessage({
    channel: user,
    text: 'Here are the users',
    //text: `Here are the users: ${users.members.map(user => user.name).join(', ')}`
  });

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

  console.log(userId);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
