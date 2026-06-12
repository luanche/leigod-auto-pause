# leigod-auto-pause

利用雷神加速器 api（包含了登陆接口的签名认证逻辑）以及 Github 的 Actions 定时自动暂停时长

## 重要更新：登录接口新增验证码

雷神官网登录接口已添加 **极验 Geetest v4 验证码**，无法直接通过用户名密码自动登录。

解决方案：使用 **account_token** 免验证码登录（有效期约7天），每7天手动刷新一次即可。

---

## 获取 account_token（每7天操作一次）

### 方法一：浏览器 Console 提取（推荐）

1. 在浏览器打开 **[https://www.leigod.com/](https://www.leigod.com/)** 并登录（需要手动验证）
2. 登录成功后，按 **F12** 打开开发者工具 → **Console** 标签
3. 粘贴以下代码回车：

```js
console.log(JSON.parse(localStorage.getItem('account_token')).account_token);
```

你会得到类似下面的 token（一长串字符）：

```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. 把这个 token 设置为 GitHub Secrets 中的 `LEIGOD_TOKENS`

### 方法二：Network 面板提取

1. 登录后 F12 → **Network** 标签
2. 过滤请求，点击任意一个请求（如 `/api/user/info`）
3. 在 **Payload** 或 **Request Headers** 中找到 `account_token`

---

## Usage

> [!IMPORTANT]
> 确保你的隐私安全，请不要上传任何带有账号密码或 token 信息的文件到项目中

### Set secrets

Fork 项目之后，设置 Actions 的 secrets

#### 方式 A：Token 模式（推荐，绕过验证码）

将上一步获取到的 token 设为 secret：

```
LEIGOD_TOKENS="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

多个账号用逗号 `,` 分隔：

```
LEIGOD_TOKENS="token1,token2,token3"
```

![image](https://github.com/user-attachments/assets/48c31718-d395-402e-9515-b504a1c1e54d)

#### 方式 B：用户名密码模式（需要验证码参数，已废弃）

> ⚠️ 该方式已无法直接使用，因为登录接口需要验证码。如需使用请参考代码中 `login()` 的 captcha 参数。

```
USERNAME_ARR="17000000001,17000000002"
PASSWORD_ARR="password1,password2"
```

### Enable actions

Fork 的项目默认Actions是禁用的，需要手动打开

![image](https://github.com/user-attachments/assets/9e96acf1-c218-4da5-9105-02e4fc254fb8)

![image](https://github.com/user-attachments/assets/7f780be8-3f51-40b0-972e-3972810f158a)

### Run actions

可以在 Actions 里手动触发，默认是北京时间凌晨 3 点触发

![image](https://github.com/user-attachments/assets/ab599689-7761-4f9f-9260-7772ff0ffbd6)

如需修改 schedule 时间，请修改`.github/workflows/main.yml`文件

![image](https://github.com/user-attachments/assets/7d153d6c-ebdb-4cc7-a4a9-002a59adcb71)

## Token 有效期说明

- `account_token` 有效期约为 **7 天**
- 到期后脚本会报错，届时重新执行一次[获取 token](#获取-account_token每7天操作一次) 的步骤并更新 GitHub Secret 即可
- 建议在手机或电脑上设置一个 **每周提醒**，避免忘记刷新

## Run locally

### Token 模式（推荐）

修改 `.env` 文件：

```
LEIGOD_TOKENS="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
npm i
node index.js
```

### 用户名密码模式（需要捕获验证码参数）

```bash
USERNAME_ARR="17000000001" PASSWORD_ARR="password1" node index.js
```

请使用 18.x 及以上 nodejs 版本

## References

- [himcs/LeishenAuto](https://github.com/himcs/LeishenAuto/)
- [jiajiaxd/leigod-api](https://github.com/jiajiaxd/leigod-api)
