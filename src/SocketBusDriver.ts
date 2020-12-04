import Channel from './channels/Channel';
import StateChannel from "./channels/StateChannel";
import Driver from './drivers/Driver';

import * as io from "socket.io-client";
import Authenticator from './auth/Authenticator';
import PresenceChannel from './channels/PresenceChannel';

export default class SocketBusDriver {
    /**
     * Socket instance.
     *
     * @private
     * @type {*}
     * @memberof SocketBusDriver
     */
    private socket: any;

    /**
     * List of channels joined by the user.
     *
     * @private
     * @type {Array<Channel>}
     * @memberof SocketBusDriver
     */
    private channels: Array<Channel|PresenceChannel> = [];

    /**
     * List of states joined by the user.
     *
     * @private
     * @type {Array<StateChannel>}
     * @memberof SocketBusDriver
     */
    private states: Array<StateChannel>;

    public authenticator: Authenticator;

    public options: any;

    private isConnected: Boolean = false;
    private callbacksOnConnectOrLater: Array<Function> = [];

    constructor(options: any) {
        this.options = options;
        this.authenticator = new Authenticator(options);
    }

    /**
     * Get the socket id
     *
     * @returns {string}
     * @memberof SocketBusDriver
     */
    public getSocketId(): string {
        return this.socket.id;
    }

    public getSocketOptions(): any {
        return {
            query: `appId=${this.options.app_id}`,
            path: '/socketbus',
            transports: ['websocket', 'polling']
        };
    }

    /**
     * Connects to the socket
     *
     * @memberof SocketBusDriver
     */
    public connect() {
        
        this.socket = io.default(this.options.url ? this.options.url: `https://app.socketbus.com/`, this.getSocketOptions());
        // this.socket = io(`http://localhost:3001/`, this.getSocketOptions());
        this.socket.on('$start', (data: any)=>{
            this.isConnected = true;
            this.executeAllCallbacksOnConnect();
            if (this.options.onConnect) {
                this.options.onConnect(this);
            }
        });
        this.socket.on('disconnect', ()=>{
            this.isConnected = false;
        });
    }

    private executeAllCallbacksOnConnect() {
        this.callbacksOnConnectOrLater.map((callback: Function)=>{
            callback();
        });
    }

    private pushCallbackOnConnect(callback: Function) {
        if (this.isConnected) {
            callback();
            return;
        }

        this.callbacksOnConnectOrLater.push(callback);
    }

    /**
     * Disconnects
     *
     * @memberof SocketBusDriver
     */
    public disconnect() {

    }

    /**
     * Leave channel
     *
     * @param {string} name
     * @memberof SocketBusDriver
     */
    public leaveChannel(name:string) {
        let channel:Channel|undefined = this.findChannelByName(name);
        if (channel) {
            channel.leave();
            this.removeChannel(name);
        }
    }

    /**
     * Add a new Channel
     *
     * @param {string} name
     * @param {*} options
     * @returns
     * @memberof SocketBusDriver
     */
    public addChannel(name: string, options: any, useObject?: any) {
        let build:Function = useObject ? useObject.build : Channel.build;
        let channel:Channel|PresenceChannel = build(this.socket, name, options);
        this.pushCallbackOnConnect(()=>{
            this.authenticator.authChannel(this.getSocketId(), name)
                .then((data: any) => {
                    channel.join(data.auth, data.data, data.presence, data.state_data);
                })
                .catch((error: any) => {
                    console.error(`[SocketBus] Could not authenticate channel ${name}`)
                });
        });
        this.channels.push(channel);
        return channel;
    }

    /**
     * Removes a channel
     *
     * @param {string} name
     * @returns
     * @memberof SocketBusDriver
     */
    public removeChannel(name: string) {
        let channel:Channel|undefined = this.findChannelByName(name);
        if (!channel) {
            // Already removed
            return null;
        }

        channel.clear();
        
        this.channels.splice(this.channels.findIndex((c:Channel) => c.name === name), 1);
    }

    /**
     * Find a channel by name, returns null if the channel not exists
     *
     * @param {string} name
     * @returns {Channel}
     * @memberof SocketBusDriver
     */
    public findChannelByName(name: string):Channel|undefined {
        return this.channels.find((channel:Channel) => channel.name === name);
    }

    /**
     * Get a channel by its name, if it doesnt exists it will be created
     *
     * @param {string} name
     * @returns {Channel}
     * @memberof SocketBusDriver
     */
    public getChannel(name: string, useObject?: any): Channel {
        let channel:Channel|undefined = this.findChannelByName(name);

        if (!channel) {
            channel = this.addChannel(name, this.options, useObject);
        }

        return channel;
    }


    public getPresenceChannel(name: string): Channel {
        let presenceChannel:Channel|undefined = this.findChannelByName(name);

        if (!presenceChannel) {
            presenceChannel = this.addChannel(name, this.options, PresenceChannel);
        }

        return presenceChannel;
    }
}