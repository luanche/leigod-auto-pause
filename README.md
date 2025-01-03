# leigod-auto-pause

利用雷神加速器 api（包含了登陆接口的签名认证逻辑）以及 Github 的 Actions 定时自动暂停时长

## Usage

> [!IMPORTANT]
> 确保你的隐私安全，请不要上传任何带有账号密码信息的文件到项目中，包括`.env`, `.github/workflows/main.yml`

### Set secrets

Fork 项目之后，设置 Actions 的 secrets

可以设置多个账号，用逗号 `,` 分割，账号和密码需要一一对应

```
USERNAME_ARR="17000000001,17000000002"
PASSWORD_ARR="password1,password2"
```

![image](https://github.com/user-attachments/assets/48c31718-d395-402e-9515-b504a1c1e54d)

![image](https://github.com/user-attachments/assets/d824c236-af23-482f-afd0-875baba0608c)

### Enable actions

Fork 的项目默认Actions是禁用的，需要手动打开

![image](https://github.com/user-attachments/assets/9e96acf1-c218-4da5-9105-02e4fc254fb8)

![image](https://github.com/user-attachments/assets/7f780be8-3f51-40b0-972e-3972810f158a)

### Run actions

可以在 Actions 里手动触发，默认是北京时间凌晨 3 点触发

![image](https://github.com/user-attachments/assets/ab599689-7761-4f9f-9260-7772ff0ffbd6)


如需修改 schedule 时间，请修改`.github/workflows/main.yml`文件

![image](https://github.com/user-attachments/assets/7d153d6c-ebdb-4cc7-a4a9-002a59adcb71)

## Run locally

修改 `.env` 文件的 `USERNAME_ARR` 和 `PASSWORD_ARR`

```
npm i
node index.js
```

请使用 18.x 及以上 nodejs 版本

## References

- [himcs/LeishenAuto](https://github.com/himcs/LeishenAuto/)
- [jiajiaxd/leigod-api](https://github.com/jiajiaxd/leigod-api)
