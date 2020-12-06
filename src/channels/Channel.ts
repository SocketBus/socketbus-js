import Listener from './Listener';
import PresenceChannel from './PresenceChannel';
import { AES, enc, lib, mode } from "crypto-js";
import { Cipher } from 'crypto';


var CryptoJSAesJson = {
    'stringify': function (cipherParams: any) {
        var j:any = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) }
        if (cipherParams.iv) j.iv = cipherParams.iv.toString()
        if (cipherParams.salt) j.s = cipherParams.salt.toString()
        return JSON.stringify(j).replace(/\s/g, '')
    },
    'parse': function (jsonStr:any) {
        var j = JSON.parse(jsonStr)
        var cipherParams = lib.CipherParams.create({ ciphertext: enc.Base64.parse(j.ct) })
        if (j.iv) cipherParams.iv = enc.Hex.parse(j.iv)
        if (j.s) cipherParams.salt = enc.Hex.parse(j.s)
        return cipherParams
    }
}

export default class Channel {
    /**
     * Channel name, used to identify the channel
     *
     * @type {string}
     * @memberof Channel
     */
    public name: string;

    /**
     * Base options
     *
     * @type {*}
     * @memberof Channel
     */
    public options: any;

    /**
     * Socket instance
     *
     * @type {*}
     * @memberof Channel
     */
    public socket: any;

    /**
     * List of listeners present in this channel
     *
     * @type {Array<Listener>}
     * @memberof Channel
     */
    public listeners: Array<Listener> = [];

    /**
     * Listener for reconnection
     *
     * @type {Listener}
     * @memberof Channel
     */
    public reconnectListener: Listener;

    /**
     * Holds the token used to authenticate this channel
     *
     * @private
     * @type {string}
     * @memberof Channel
     */
    private authToken: string;

    /**
     * Holds the extra data sent to this channel
     *
     * @private
     * @type {*}
     * @memberof Channel
     */
    private authData: any;

    /**
     * Holds the encryption password for this channel
     *
     * @private
     * @var string
     * @memberof Channel
     */
    private e2ePassword: string|undefined;
    private e2eIv: string|undefined;

    /**
     * Creates an instance of Channel.
     * 
     * @param {*} socket
     * @param {string} name
     * @param {*} options
     * @memberof Channel
     */
    constructor(socket:any, name:string, options: any) {
        this.name = name;
        this.options = options;
        this.socket = socket;

        this.reconnectListener = new Listener(this.socket, 'reconnect', ()=>{
            // this.join(this.authToken, this.authData);
        });
    }

    /**
     * Builds a new channel
     *
     * @static
     * @param {*} socket
     * @param {string} name
     * @param {*} options
     * @returns {Channel}
     * @memberof Channel
     */
    public static build(socket:any, name:string, options: any): Channel {
        return new Channel(socket, name, options);
    }

    /**
     * Clear everything related to this channel
     *
     * @memberof Channel
     */
    public clear():void {
        this.listeners.forEach((listener: Listener) => {
            listener.unbind();
        });
        this.listeners = [];
    }

    /**
     * Formats the event name to match the server, it may uses options.formatEventName to better fit your needs.
     *
     * @private
     * @param {string} event
     * @returns {string}
     * @memberof Channel
     */
    private formatEvent(event: string):string {
        return this.options.formatEventName ? this.options.formatEventName(event, this.options) : event;;
    }

    /**
     * Starts listening to a event in this channel
     *
     * @param {string} event
     * @param {Function} callback
     * @returns {Channel}
     * @memberof Channel
     */
    public listen(event: string, callback: Function): Channel {
        let formatedEvent = this.formatEvent(event);
        let channelName = this.name;

        this.listeners.push(new Listener(this.socket, formatedEvent, (data:any) => {
            if (channelName == data.channel) {
                if (this.e2ePassword) {
                    const decrypted = AES.decrypt(data.data, this.e2ePassword, {
                        format: CryptoJSAesJson
                    }).toString(enc.Utf8);
                    callback(
                        JSON.parse(decrypted)
                    );
                } else {
                    callback(data.data);
                }
            }
        }));

        return this;
    }


    /**
     * Removes a listener by its name
     *
     * @param {string} event
     * @returns {Channel}
     * @memberof Channel
     */
    public removeListener(event: string): Channel {
        let formatedEvent = this.formatEvent(event);

        this.listeners = this.listeners.filter((listener: Listener) => {
            if (listener.event === formatedEvent) {
                listener.unbind();
                return false;
            }
            return true;
        });

        this.socket.removeListener(formatedEvent);

        return this;
    }

    /**
     * Joins the channel
     *
     * @memberof Channel
     */
    public join(authToken: string, authData?: any, isPresence?:Boolean, stateData?:any, e2ePassword?: string): void {
        this.authToken = authToken;
        this.authData = authData;
        this.e2ePassword = e2ePassword;

        // if (this['onJoinState']) {
        //     this['onJoinState'](stateData);
        // }

        this.socket.emit('join-channel', {
            channel_name: this.name,
            auth_token: this.authToken,
            auth_data: this.authData,
            presence: isPresence,
            state_data: stateData
        });
    }

    /**
     * Leaves the channel
     *
     * @memberof Channel
     */
    public leave(): void {
        this.socket.emit('leave-channel', {
            channel_name: this.name,
            auth_token: this.authToken
        });
    }

    /**
     * Whispers a small message
     * 
     * @memberof Channel
     */
    // public whisper(): void {
    //     this.socket.emit('whisper', {
    //     })
    // }
}