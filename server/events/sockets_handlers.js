const axios = require("axios");
const { getStanInstance, options } = require("../settings");

const memory = [];
let monitoring = true;
let connected = false;

const handler = async client => {
  const stan = await getStanInstance().catch(e => {
    console.error(e);
  });

  stan.on('connect', function () {
    connected = true;
    client.emit("is_online_result", connected);
  });
  
  stan.on('disconnect', function () {
    connected = false;
    client.emit("is_online_result", connected);
  });

  /**
   * @desc creating new channel
   */
  const createChannel = async (data) => {
    console.log('createChannel');

    if (monitoring) {
      stan.publish(data.channelName, "\n");
    } else {
      const channel = { name: data.channelName, messages: [] }
      memory.push(channel);
      const opts = stan
        .setDurableName(options.appName)
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true);

      const subscription = stan.subscribe(channel.name, opts);
      subscription.on('message', (msg) => {
        channel.messages.push({
          sequence: msg.getSequence(),
          timestamp: msg.getTimestamp(),
          subject: msg.getSubject(),
          data: msg.getData(),
          isRedelivered: msg.isRedelivered()
        });
      });
    }

    client.emit("channel_created");
  };

  /**
   * @desc sending message to the channel
   */
  const sendMessage = async (data) => {
    console.log('sendMessage');
    stan.publish(data.channelName, data.message);
    client.emit("message_sent");
  };

  /**
   * @desc getting channels
   */
  const getChannels = async () => {
    console.log('getChannels');
    try {
      const resp = await axios({
        method: "get",
        baseURL: options.monitor,
        url: "/streaming/channelsz?subs=1",
        headers: { Accept: "application/json" },
        proxy: false
      });
      client.emit("channels_received", { channels: resp.data.channels });
    } catch (e) {
      client.emit("channels_received", { channels: memory });
    }
  };

  /**
   * @desc getting subscriptions
   */
  const getSubscription = async () => {
    console.log('getSubscription');
    try {
      const resp = await axios({
        method: "get",
        baseURL: options.monitor,
        url: "/streaming/channelsz?subs=1",
        headers: { Accept: "application/json" },
        proxy: false
      });

      let subscriptions = [];

      if (resp.data.channels) {
        resp.data.channels.forEach(channel => {
          if (Array.isArray(channel.subscriptions)) {
            subscriptions.push(
              ...channel.subscriptions.map(subscriptions => {
                subscriptions.channel_name = channel.name;
                return subscriptions;
              })
            );
          }
        });
      }

      client.emit("subscriptions_received", { subscriptions });
    } catch (e) {

    }
  };

  /**
   * @desc getting clients
   */
  const getClients = async () => {
    console.log('getClients');
    const resp = await axios({
      method: "get",
      baseURL: options.monitor,
      url: "/streaming/clientsz?subs=1",
      headers: { Accept: "application/json" },
      proxy: false
    });

    const clients = resp.data.clients.map(client => {
      return {
        id: client.id,
        inbox: client.hb_inbox,
        subscriptions_number: client.subscriptions
          ? Object.keys(client.subscriptions).length
          : 0,
        subscriptions: client.subscriptions
      };
    });

    client.emit("clients_received", { clients });
  };

  /**
   * @desc getting dashboards data
   */
  const getDashboard = async () => {
    try {
      const resp = await axios({
        method: "get",
        baseURL: options.monitor,
        url: "/streaming/serverz",
        headers: { Accept: "application/json" },
        proxy: false
      });
      const store = await axios({
        method: "get",
        baseURL: options.monitor,
        url: "/streaming/storez",
        headers: { Accept: "application/json" },
        proxy: false
      });

      const {
        clients,
        subscriptions,
        channels,
        total_msgs,
        total_bytes,
        uptime,
        cluster_id,
        server_id,
        version,
        go,
        state
      } = resp.data;

      client.emit("dashboard_received", {
        clients,
        channels,
        subscriptions,
        messages: total_msgs,
        size: total_bytes,
        uptime,
        cluster_id,
        server_id,
        version,
        go_version: go,
        state,
        store: {
          type: store.data.type,
          limits: store.data.limits
        }
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  /**
   * @desc Getting messages for channel
   * @param data
   * @returns {Promise<void>}
   */
  const getMessages = async (data) => {
    console.log('getMessages');
    const messages = [];
    let response;
    try {
      try {
        response = await axios({
          method: "get",
          baseURL: options.monitor,
          url: `/streaming/channelsz?channel=${data.channelName}`,
          headers: { Accept: "application/json" },
          proxy: false
        });

        const numOfMessages = response.data.msgs;

        const opts = stan.subscriptionOptions().setDeliverAllAvailable().setManualAckMode(true);
        const subscription = stan.subscribe(data.channelName, opts)
        subscription.on('message', (msg) => {
          messages.push({
            sequence: msg.getSequence(),
            timestamp: msg.getTimestamp(),
            subject: msg.getSubject(),
            data: msg.getData(),
            isRedelivered: msg.isRedelivered()
          });

          if (numOfMessages === messages.length) {
            client.emit("messages_received", messages);
          }
        });
      } catch (e) {
        const channel = memory.find(c => c.name === data.channelName);
        if (channel){
          messages.push(...channel.messages.sort((a, b) => b.sequence - a.sequence))
        }
        client.emit("messages_received", messages);
      }
    } catch {
      client.emit("messages_received", []);
    }
  };

  /**
   * @desc Checking Nats server status
   * @returns {Promise<void>}
   */
  const isOnline = async () => {
    client.emit("is_online_result", connected);
  };

  const isMonitoring = async () => {
    try {
      const resp = await axios({
        method: "get",
        baseURL: options.monitor,
        url: "/streaming/serverz",
        headers: { Accept: "application/json" },
        proxy: false
      });
      return resp.status === 200;
    } catch (error) {
      return false;
    }
  }

  const isFTActive = async () => {
    const resp = await axios({
      method: "get",
      baseURL: options.monitor,
      url: "/streaming/isFTActive",
      headers: { Accept: "application/json" },
      proxy: false
    }).catch(() => {});
    const isActive = resp && resp.status === 200;
    client.emit("is_ft_active_result", isActive);
  }

  const disconnect = async () => {
    stan.close();
  }

  client.on("create_channel", createChannel);
  client.on("send_message", sendMessage);
  client.on("get_channels", getChannels);
  client.on("get_subscriptions", getSubscription);
  client.on("get_clients", getClients);
  client.on("get_dashboard", getDashboard);
  client.on("get_messages", getMessages);
  client.on("is_online", isOnline);
  client.on("is_ft_active", isFTActive);
  client.on("disconnect", disconnect);

  monitoring = await isMonitoring();
};

module.exports = { handler };
