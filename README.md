Leadgen Bot
====

Messenger chatbot to collect leads.

# Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template={{=it.GITHUBREPO}})

# Local Development

Before getting started, please ensure you have `ngrok` installed if you are going to use it. Ngrok can be downloaded here: https://ngrok.com/

## Steps

1. `npm install`.
2. `cp sample/dot.env.sample .env`, modify app id and app secret inside to be yours, leave `HEROKU_LOCAL_URL` variable as is, no need to worry. In default will use `ngrok` as tunneling method, if you need to use `localtunnel`, please modify `TUNNEL_METHOD=localtunnel`.
3. `cp sample/data/question_flow_default.json var/data/` if you do not have any questions from your own.
4. Enable API access in your app settings: In app dashboard, go to Settings → Advanced, scroll down and find the “Allow API Access to App Settings”, toggle to enable.
5. If your `TUNNEL_METHOD=ngrok`, please open another terminal, execute `ngrok http 5000` overthere; if use `localtunnel`, please skip this step.
6. `heroku local` to start the server
7. Pay attention to the log, and go to tunnel URL in the log output for the setup UI, connect your page.
8. Go to your bot for testing.

# Local Development with Redis

## Install Redis first

* `brew install redis`

## Steps

1. `npm install`.
2. `cp sample/dot.env.sample .env`, modify app id and app secret inside to be yours, leave `HEROKU_LOCAL_URL` variable as is, no need to worry. In default will use `ngrok` as tunneling method, if you need to use `localtunnel`, please modify `TUNNEL_METHOD=localtunnel`.
3. `cp sample/dot.redis.env.sample .redis.env`, do not modify anything
4. Enable API access in your app settings: In app dashboard, go to Settings → Advanced, scroll down and find the “Allow API Access to App Settings”, toggle to enable.
5. If your `TUNNEL_METHOD=ngrok`, please open another terminal, execute `ngrok http 5000` over there; if use `localtunnel`, please skip this step.
6. `heroku local` to start the server
7. Pay attention to the log, and go to tunnel URL in the log output for the setup UI, connect your page.
8. Go to your bot for testing.

## How to check the data with Redis

1. `cat .redis.env` to find out Redis PORT
2. `redis-cli -p $PORT` to connect your Redis to check data

## How to import sample question with Redis

1. Go to UI, connect your page, then go to tab 'Manage Questions'
2. Open `sample/data/question_flow_default.json`, copy everything into clipboard
3. Back to UI, click on any place of the default question card, paste, you will see popup dialog helping you import questions
