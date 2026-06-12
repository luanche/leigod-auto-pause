import 'dotenv/config';
import { LeigodAPI } from './leigod.js';
import * as core from '@actions/core';

const TOKENS_STR = process.env.LEIGOD_TOKENS || '';       // 优先: 直接传 token (逗号分隔)
const USERNAME_STR = process.env.USERNAME_ARR || '';
const PASSWORD_STR = process.env.PASSWORD_ARR || '';

const tokens = TOKENS_STR.split(',').map(t => t.trim()).filter(Boolean);

/**
 * @param {LeigodAPI} api
 * @param {String} label
 */
async function pause(api, label) {
  try {
    let isPaused = await api.isTimePaused();
    core.info(label + ': Getting pause status: ' + isPaused);
    if (!isPaused) {
      core.warning(label + ': Time is not paused, trying to pause time');
      await api.pauseTime();
      isPaused = await api.isTimePaused();
      core.info(label + ': Getting pause status again: ' + isPaused);
    }
  } catch (error) {
    core.error(label + ': ' + error);
    return false;
  }
  return true;
}

function hide(str) {
  if (!str) return '';
  return str.substring(0, 3) + '****' + str.substr(str.length - 4) || '';
}

let flag = true;

// ── 模式 A: 直接用 Token（推荐，无需验证码） ──
if (tokens.length > 0) {
  core.info('♻️  Using LEIGOD_TOKENS (bypass captcha)');
  for (let idx = 0; idx < tokens.length; idx++) {
    const raw = tokens[idx];
    const label = 'Token#' + (idx + 1) + ' ' + hide(raw);
    const api = new LeigodAPI(raw);
    const res = await pause(api, label);
    flag = flag && res;
    core.info('-----------------------');
  }
}
// ── 模式 B: 用户名+密码登录（需要验证码） ──
else if (USERNAME_STR && PASSWORD_STR) {
  const usernames = USERNAME_STR.split(',').map(s => s.trim()).filter(Boolean);
  const passwords = PASSWORD_STR.split(',').map(s => s.trim()).filter(Boolean);

  if (usernames.length !== passwords.length) {
    core.setFailed('USERNAME_ARR and PASSWORD_ARR must have same length');
    process.exit(1);
  }

  for (let idx = 0; idx < usernames.length; idx++) {
    const username = usernames[idx];
    const password = passwords[idx];
    const hideName = hide(username);

    if (!username || !password) {
      core.error(hideName + ': username or password is empty');
      flag = false;
      core.info('-----------------------');
      continue;
    }

    try {
      const api = new LeigodAPI();
      core.info(hideName + ': Logging in (requires captcha)');
      await api.login(username, password);
      const res = await pause(api, hideName);
      flag = flag && res;
    } catch (error) {
      core.error(hideName + ': ' + error);
      flag = false;
    }
    core.info('-----------------------');
  }
} else {
  core.setFailed(
    'Set either:\n' +
    '  LEIGOD_TOKENS (recommended, bypass captcha)\n' +
    '  or USERNAME_ARR + PASSWORD_ARR (requires captcha params)',
  );
}

if (!flag) core.setFailed('Something went wrong! please check the logs.');
