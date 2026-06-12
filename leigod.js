import axios from 'axios';
import { createHash } from 'crypto';

function generateMD5(str) {
  return createHash('md5').update(str).digest('hex');
}

function sign(data) {
  const now = Math.floor(new Date().getTime() / 1000).toString();
  const tempData = { ...data, ts: now };
  const keys = Object.keys(tempData).sort();
  const newData = {};
  for (const key of keys) {
    newData[key] = tempData[key];
  }
  newData.key = process.env.SIGN_KEY;

  const queryString = Object.entries(newData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return {
    ...data,
    ts: now,
    sign: generateMD5(queryString),
  };
}

export class LeigodAPI {
  /**
   *
   * @param {String} [token] - Account token (optional, bypasses captcha login)
   */
  constructor(token = null) {
    if (token) this.setToken(token);
    this.session = axios.create({
      baseURL: 'https://webapi.leigod.com',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.leigod.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  }

  /**
   *
   * @param {String} username
   * @param {String} password
   * @param {Object} [captcha] - Geetest v4 captcha fields (required since Leigod added captcha)
   * @param {String} captcha.captcha_id
   * @param {String} captcha.lot_number
   * @param {String} captcha.pass_token
   * @param {String} captcha.gen_time
   * @param {String} captcha.captcha_output
   * @param {Number} [captcha.server_status=1]
   * @returns
   */
  /**
   * Set token directly (bypasses captcha login)
   * @param {String} token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * @param {String} username
   * @param {String} password
   * @param {Object} [captcha] - Geetest v4 captcha fields (required for login)
   * @returns {Promise<String>} account_token
   */
  async login(username, password, captcha = null) {
    const body = {
      code: '',
      country_code: 86,
      lang: 'en',
      os_type: 5,
      password: generateMD5(password),
      src_channel: 'guanwang',
      region_code: 1,
      user_type: '0',
      username: username,
    };

    if (!captcha) {
      throw new Error(
        'Leigod now requires Geetest captcha for login. ' +
        'Either:\n' +
        '  1. Pass captcha data as third argument\n' +
        '  2. Use constructor/setToken() with an account_token (valid ~7 days)'
      );
    }

    body.captcha_id = captcha.captcha_id;
    body.lot_number = captcha.lot_number;
    body.pass_token = captcha.pass_token;
    body.gen_time = captcha.gen_time;
    body.captcha_output = captcha.captcha_output;
    body.server_status = captcha.server_status ?? 1;

    const response = await this.session.post('/api/auth/login/v2', sign(body));
    if (response.data['code'] == 0) {
      this.token = response.data['data']['login_info']['account_token'];
      return this.token;
    } else {
      throw new Error(response.data['msg']);
    }
  }

  async getUserInfo() {
    const response = await this.session.post('/api/user/info', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      if (response.data['code'] == 0) {
        return response.data['data'];
      } else {
        throw new Error(response.data['msg']);
      }
    }
  }

  /**
   *
   * @return {boolean} is paused as bool
   */
  async isTimePaused() {
    const info = await this.getUserInfo();
    const status = info['pause_status_id'];
    if (status == 1) {
      return true;
    } else {
      return false;
    }
  }

  async pauseTime() {
    const response = await this.session.post('/api/user/pause', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      return response.data['msg'];
    }
  }

  async recoverTime() {
    const response = await this.session.post('/api/user/recover', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      return response.data['msg'];
    }
  }
}
