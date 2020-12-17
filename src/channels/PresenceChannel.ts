import Channel from './Channel';
import Listener from './Listener';

export default class PresenceChannel extends Channel {

    public static build(socket:any, name:string, options: any): PresenceChannel {
        return new PresenceChannel(socket, name, options);
    }
    /**
     * Observers all the users in the channel
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public here(callback: Function): PresenceChannel {
        this.listeners.push(new Listener(this.socket, 'presence:join', (users: any)=>{
            callback(users.map((user: any) => this.decryptPayload(user, true)));
        }));
        
        return this;
    }

    /**
     * Observers when a users joins
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public joining(callback: Function): PresenceChannel {
        this.listeners.push(new Listener(this.socket, 'presence:joining', (user: any)=>{
            callback(this.decryptPayload(user, true));
        }));

        return this;
    }

    /**
     * Observers when a users leaves
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public leaving(callback: Function): PresenceChannel {
        this.listeners.push(new Listener(this.socket, 'presence:leaving', (user: any)=>{
            callback(this.decryptPayload(user, true));
        }));

        return this;
    }
}