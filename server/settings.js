const stan = require("node-nats-streaming");

const options = {
  server: process.env.STAN_URL || "nats://127.0.0.1:4222",
  monitor: process.env.STAN_MONITOR_URL || "http://127.0.0.1:8222",
  cluster: process.env.STAN_CLUSTER || "test-cluster",
  appName: `nats-streaming-ui`
};

const getStanInstance = async () => {
  const { server, cluster, appName } = options;
  return Promise.resolve(stan.connect(cluster, appName, server, {
    reconnect: true,
    stanMaxPingOut: 3,
    stanPingInterval: 1000,
    timeout: 3000 
  }));
};

console.log({ options: options });

module.exports = { getStanInstance, options };
