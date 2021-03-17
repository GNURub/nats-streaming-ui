# NATS Streaming UI

Powerful dashboard for the [Nats Streaming](https://nats-io.github.io/docs/nats_streaming/intro.html)

<img src="https://raw.github.com/GNURub/nats-streaming-ui/master/docs/screenshots.gif" alt="Nats Streaming UI" />

## Features

- Dashboard - some metrics like number of messages, channels, subscriptions, etc.
- Channels - channels list, ability to create new channel, push message to the queue
- Subscriptions
- Clients

## How to run with Docker

```shell script
docker-compose up --build
```

Follow the link http://127.0.0.1:8282

[Docker Image](https://hub.docker.com/r/gnurub/nats-streaming-ui)

```shell script
docker run -d -e STAN_URL=nats://127.0.0.1:4222 -e STAN_MONITOR_URL=http://127.0.0.1:8222 -e STAN_CLUSTER=test-cluster -p 8282:8282 gnurub/nats-streaming-ui
```

### Docker Compose example
``` yaml
version: "3"
services:
  nats-streaming:
    image: nats-streaming:latest
    command: -cid test-cluster -m 8222 # -m Monitoring enabled

  nats-streaming-ui:
    image: 'gnurub/nats-streaming-ui:latest'
    environment:
      STAN_URL: "nats://nats-streaming:4222"
      STAN_MONITOR_URL: "http://nats-streaming:8222"
      STAN_CLUSTER: "test-cluster"
    ports:
      - "8282:8282"
```

## How to run locally

```shell script
git clone git@github.com:GNURub/nats-streaming-ui.git
cd nats-streaming-ui
yarn run build:react
node ./server/index.js
```

## Issues

Let us know about any issues by [Github](https://github.com/GNURub/nats-streaming-ui/issues)

## Credits

- [React](https://reactjs.org)
- [Socket.io](https://socket.io/)
- [Express](https://expressjs.com)
- [material-ui](https://material-ui.com/)
- [stan.js](https://www.npmjs.com/package/node-nats-streaming)
- [shortid](https://www.npmjs.com/package/shortid)
- [axios](https://www.npmjs.com/package/axios)
- [clsx](https://www.npmjs.com/package/clsx)

## Inspired By

- [nats-streaming-console by KualiCo](https://github.com/KualiCo/nats-streaming-console)
- Google Cloud Pub/Sub
