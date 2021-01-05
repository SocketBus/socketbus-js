
const SocketBus = require('../dist/index.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env')});

const  { APP_ID, CUSTOM_DOMAIN } = process.env;

const socketBus = new SocketBus({
    app_id: APP_ID
});

describe('SocketBus', function() {
    it('join channel', function() {
        const foodChannel = socketBus.private('foods');
        
        foodChannel.leave();
    });

    it('whisper', function(){
        const foodChannel = socketBus.private('foods');
        foodChannel.whisper('food-status', 'hot');
    });

    it ('socket-2-socket', function() {
        const foodChannel = socketBus.private('foods');
        foodChannel.emit('new-food', {
            food: 'cupcake'
        })
    });
});
  