require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DB_URL;

const client = new Client({
  connectionString: connectionString,
});

// get users
const getUsers = async () => {
  client.connect();
  const users = await client.query('SELECT * FROM users ORDER BY user_id ASC');
  client.end();
  const userData = await users.rows;
  return userData;
}

// get specific user
const getUser = async (userId) => {
  client.connect();
  const user = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);
  client.end();
  const userData = await user.rows[0];
  return userData;
}

// create user
const createUser = async (name) => {
  client.connect();
  const res = await client.query('INSERT INTO users (user_name) VALUES ($1)', [name]);
  client.end();
  const message = `Created user: ${name}`;
  return message;
}

// update user
const updateUser = async (userId, name) => {
  client.connect();
  const res = await client.query('UPDATE users SET user_name = $2 WHERE user_id = $1', [userId, name]);
  client.end();
  const message = `Updated user ${userId} to ${name}`;
  return message;
}

// delete user
const deleteUser = async (userId) => {
  client.connect();
  const res = await client.query('DELETE FROM users WHERE user_id = $1', [userId]);
  client.end();
  const message = `Deleted user ${userId}`;
  return message;
}


module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
}
