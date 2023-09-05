## First add `.env.local`

```
cp .env.local.example .env.local
```
and edit `.env.local`

```
# I'm using ngrok here for testing
SERVER_URL="https://something.ngrok.app"
# set to "true" to encounter the problem
TYPING_INDICATOR="true" 

#
# sendblue api config
#
SENDBLUE_API_KEY=
SENDBLUE_API_SECRET=
SENDBLUE_PHONE_NUMBER=
SENDBLUE_SECRET=
```

## To run:

```
npm install
npm run dev
```

text the `SENDBLUE_PHONE_NUMBER`

if `TYPIING_INDICATOR` is set to `true` you'll experience the double send problem. Otherwise it works as expected. 
