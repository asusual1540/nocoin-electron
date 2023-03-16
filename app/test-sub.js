const redis = require("redis")

const subscriber = redis.createClient();
// const subscriber = client.duplicate();

async function connect () {
    await subscriber.connect();
  }

async function subscribe () {
    await subscriber.subscribe('article', (message) => {
        console.log(message); 
    });
}
connect()
subscribe()
