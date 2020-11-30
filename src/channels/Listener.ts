export default class Listener {
    /**
     * Event name
     *
     * @type {string}
     * @memberof Listener
     */
    public event: string;
    
    /**
     * Socket instance
     *
     * @type {*}
     * @memberof Listener
     */
    public socket: any;

    /**
     * Callback or listener
     *
     * @type {Function}
     * @memberof Listener
     */
    public listener: Function;
    
    /**
     * Creates an instance of Listener.
     * 
     * @param {*} socket
     * @param {string} event
     * @param {Function} listener
     * @memberof Listener
     */
    constructor(socket:any, event:string, listener: Function) {
        this.socket = socket;
        this.event = event;

        this.listener = listener;
        this.socket.on(this.event, this.listener);
    }

    /**
     * Unbinds the channel from the socket.
     *
     * @memberof Listener
     */
    public unbind() {
        this.socket.removeListener(this.event, this.listener);
    }
}