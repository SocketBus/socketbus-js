# SocketBus JavaScript Client

## Getting Started

1. **Install the client**
```properties
npm install socketbus-js --save
```

## Create a SocketBus instance

```js
import SocketBus from 'socketbus-js';

const socketBus = new SocketBus({
    // SocketBus' public key
    app_id: 'my-public-key',
    
    // Endpoint to authenticate channels
    authEndpoint: '/channels/auth',

    // Application namespace
    namespace: '',

    // Event fired on Connect
    onConnect: () => {

    },

    // Function to parse all registred events
    formatEventName: (event, options) => {

    }
})
```

## Laravel Echo
```js
import { SocketBusLaravel } from "socketbus-js";
import LaravelEcho from "laravel-echo";

window.Echo = SocketBusLaravel(LaravelEcho, {
    app_id: 'my-app-id'
});

Echo.private('foods')
    .listen('NewFoodEvent', (payload) => {
        // code
    })
```
## Joining Channels

```js
const foodsChannel = socketBus.privateChannel('foods')
    .listen('new-food', (payload) => { /** callback */ })
    .listen('food-status', (payload) => { /** callback */ })
```
## Leaving Channels

```js
foodsChannel.leave()
```

## End-to-end encryption

## Socket-to-socket communication

```js
foodsChannel.emit('new-food', {
    food: 'cupcake'
});
```

## Whispering
Whispers are messages up to 128 bytes, that doesn't require Socket-to-socket communication to be enabled.
```js
foodsChannel.whisper('food-status', 'hot');
```

## Custom Authentication