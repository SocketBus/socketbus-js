import Channel from "./Channel";
import Listener from './Listener';

export default class StateChannel extends Channel {

    public static build(socket:any, name:string, options: any): StateChannel {
        return new StateChannel(socket, name, options);
    }

    /**
     * Observers all the users in the channel
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public created(callback: Function): StateChannel {
        this.listeners.push(new Listener(this.socket, 'state:created', (state: any)=>{
            callback(state.model, state.pos);
        }));
        
        return this;
    }

    /**
     * Observers all the users in the channel
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public updated(callback: Function): StateChannel {
        this.listeners.push(new Listener(this.socket, 'state:updated', (state: any)=>{
            callback(state.model, state.pos);
        }));
        
        return this;
    }

    /**
     * Observers all the users in the channel
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public deleted(callback: Function): StateChannel {
        this.listeners.push(new Listener(this.socket, 'state:deleted', (state: any)=>{
            callback(state.model, state.added, state.pos);
        }));
        
        return this;
    }

    /**
     * Observers all the users in the channel
     *
     * @param {Function} callback
     * @returns {PresenceChannel}
     * @memberof PresenceChannel
     */
    public init(callback: Function): StateChannel {
        this.listeners.push(new Listener(this.socket, 'state:init', (state: any)=>{
            callback(state);
        }));
        
        return this;
    }


    public onJoinState(stateData:any) {
        if (!stateData) {
            return;
        }

        let initListener = this.listeners.find((listener: Listener)=>listener.event == 'state:init');
        if (initListener) {
            initListener.listener(stateData.rows);
        }
    }

}