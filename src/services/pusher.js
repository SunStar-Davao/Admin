import Pusher from 'pusher-js';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = {};
  }

  init() {
    if (this.pusher) return;

    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
      forceTLS: true
    });

    console.log('🔌 Pusher initialized');
  }

  subscribe(channelName, eventName, callback) {
    if (!this.pusher) this.init();

    const channel = this.pusher.subscribe(channelName);
    channel.bind(eventName, (data) => {
      console.log(`📡 Event received: ${eventName}`, data);
      callback(data);
    });

    this.channels[`${channelName}-${eventName}`] = { channel, eventName };
    
    return () => this.unsubscribe(channelName, eventName);
  }

  unsubscribe(channelName, eventName) {
    const key = `${channelName}-${eventName}`;
    if (this.channels[key]) {
      const { channel } = this.channels[key];
      channel.unbind(eventName);
      this.pusher.unsubscribe(channelName);
      delete this.channels[key];
    }
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channels = {};
    }
  }
}

const pusherService = new PusherService();
export default pusherService;