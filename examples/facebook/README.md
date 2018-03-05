How to run?
===

1. Create your Facebook app and get the **Page Access Token** in [Facebook Developers](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start#build)

1. Install **localtunnel** to serves a localhost to a public URL: `yarn global add localtunnel`

1. Run `lt --port 5000` to get a public URL, then, put it in "Callback URL" section of Facebook webhooks configuration

1. Install dependencies `yarn install`

1. Create your `.env` file with environment variables
```
ACCESS_TOKEN=value
VERIFY_TOKEN=value
```

1. Run `node index`
