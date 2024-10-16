import 'dotenv/config';
import { LeigodAPI } from './leigod.js';
import * as core from '@actions/core';

function hidePhoneNumber(tel) {
  return tel.substring(0, 3) + '****' + tel.substr(tel.length - 4);
}

const api = new LeigodAPI();

const usernames = process.env.USERNAME_ARR.split(',');
const passwords = process.env.PASSWORD_ARR.split(',');

if (!usernames || !passwords) {
  core.setFailed(
    "Please set USERNAME_ARR and PASSWORD_ARR in envs (split multi user by ',')",
  );
}

const users = [];

for (let idx = 0; idx < usernames.length; idx++) {
  const username = (usernames[idx] || '').trim();
  const password = (passwords[idx] || '').trim();
  users.push({ username, password });
}

async function pause(username, password) {
  if (username && password) {
    try {
      const hideName = hidePhoneNumber(username);
      core.info(hideName + ': Logging in');
      await api.login(username, password);
      let isPaused = await api.isTimePaused();
      core.info(hideName + ': Getting pause status: ' + isPaused);
      if (!isPaused) {
        core.warning(hideName + ': Time is not paused, trying to pause time');
        await api.pauseTime();
        isPaused = await api.isTimePaused();
        core.info(hideName + ': Getting pause status again: ' + isPaused);
      }
    } catch (error) {
      core.error(hideName + ': ' + error);
      return false;
    }
  } else {
    core.error(
      hideName + ': The username or password is empty, please check envs',
    );
    return false;
  }
  return true;
}

let flag = true;

for (let idx = 0; idx < users.length; idx++) {
  const { username, password } = users[idx];
  const res = await pause(username, password);
  flag = flag && res;
  core.info('-----------------------');
}

if (!flag) core.setFailed('Something went wrong! please check the logs.');
