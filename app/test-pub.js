const redis = require("redis")
const publisher = redis.createClient();

const article = {
  id: '123456',
  name: 'Using Redis Pub/Sub with Node.js',
  blog: 'Logrocket Blog',
};

async function connect_pub () {
  await publisher.connect();
}

async function publish () {

  let count = 0
  
  setInterval(async () => {
    count ++
    await publisher.publish('article', JSON.stringify(article));
    console.log(`published article ${count}`)
  }, 1000)
}

const subscriber = redis.createClient();
// const subscriber = client.duplicate();

async function connect_sub () {
    await subscriber.connect();
  }

async function subscribe () {
    await subscriber.subscribe('article', (message) => {
        console.log(message); 
    });
}

connect_sub()
subscribe()

connect_pub()
publish()

