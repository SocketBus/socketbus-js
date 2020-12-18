import SocketBus from "../../SocketBus";
import Channel from '../../channels/Channel';
import PresenceChannel from '../../channels/PresenceChannel';
import LaravelAuthenticator from './LaravelAuthenticator';
import StateChannel from '../../channels/StateChannel';

declare const Vue: any;
declare const jQuery: any;
declare const axios: any;
declare const window: any;

export class LaravelConnector {
    /**
     * The Socket.io connection instance.
     */
    socket: any;

    /**
     * All of the subscribed channel names.
     */
    channels: any = {};

    /**
     * Default connector options.
     */
    private _defaultOptions: any = {
        auth: {
            headers: {},
        },
        authEndpoint: '/broadcasting/auth',
        broadcaster: 'socketbus',
        csrfToken: null,
        host: null,
        app_id: null,
        shouldConnect: false,
        namespace: 'App.Events',
    };

    /**
     * Connector options.
     */
    options: any;

    /**
     * Our amazing driver!
     *
     * @type {SocketBus}
     * @memberof LaravelConnector
     */
    socketBus: SocketBus;

    /**
     * Merge the custom options with the defaults.
     */
    protected setOptions(options: any): any {
        this.options = Object.assign(this._defaultOptions, options);

        if (this.csrfToken()) {
            this.options.auth.headers['X-CSRF-TOKEN'] = this.csrfToken();
        }

        return options;
    }


    constructor(options: any) {
        this._defaultOptions.onConnect = ()=>{
            this.registerInterceptors();
        }

        this._defaultOptions.formatEventName = function(event: string, options: any) {
            if (event.charAt(0) === '.' || event.charAt(0) === '\\') {
                return event.substr(1);
            } else if (options.namespace) {
                event = options.namespace + '.' + event;
            }
    
            return event.replace(/\./g, '\\');
        }

        this.socketBus = new SocketBus(Object.assign(this._defaultOptions, options));
        this.socketBus.authenticator.setExternal(new LaravelAuthenticator(this.socketBus.options));
        this.socketBus.connect();
    }

    /**
     * Listen for an event on a channel instance.
     */
    listen(name: string, event: string, callback: Function): Channel {
        let channel: Channel = this.socketBus.getChannel(name);
        channel.listen(event, callback);
        return channel;
    }

    /**
     * Get a channel instance by name.
     */
    channel(name: string): Channel {
        return this.socketBus.getChannel(name);
    }

    /**
     * Get a private channel instance by name.
     */
    privateChannel(name: string): Channel {
        return this.socketBus.getChannel(`private-${name}`);
    }

    /**
     * Get a presence channel instance by name.
     */
    presenceChannel(name: string) {
        return this.socketBus.getChannel(`presence-${name}`, PresenceChannel);
    }

    /**
     * Get a state channel instance by name.
     */
    stateChannel(name: string) {
        return this.socketBus.getChannel(`state-${name}`, StateChannel);
    }

    /**
     * Leave the given channel, as well as its private and presence variants.
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name, 'state-' + name];

        channels.forEach(name => {
            this.leaveChannel(name);
        });
    }

    /**
     * Leave the given channel.
     */
    leaveChannel(name: string): void {
        this.socketBus.leaveChannel(name);
    }

    /**
     * Get the socket ID for the connection.
     */
    socketId(): string {
        return this.socketBus.getSocketId();
    }

    /**
     * Disconnect Socketio connection.
     */
    disconnect(): void {
        this.socketBus.disconnect();
    }

    /**
     * Extract the CSRF token from the page.
     */
    protected csrfToken(): string|null {
        let selector;

        if (typeof window !== 'undefined' && window['Laravel'] && window['Laravel'].csrfToken) {
            return window['Laravel'].csrfToken;
        } else if (this.options.csrfToken) {
            return this.options.csrfToken;
        } else if (typeof document !== 'undefined' && (selector = document.querySelector('meta[name="csrf-token"]'))) {
            return selector.getAttribute('content');
        }

        return null;
    }

    /**
     * Register 3rd party request interceptiors. These are used to automatically
     * send a connections socket id to a Laravel app with a X-Socket-Id header.
     */
    registerInterceptors(): void {
        if (typeof Vue === 'function' && Vue.http) {
            this.registerVueRequestInterceptor();
        }

        if (typeof axios === 'function') {
            this.registerAxiosRequestInterceptor();
        }

        if (typeof jQuery === 'function') {
            this.registerjQueryAjaxSetup();
        }
    }

    /**
     * Register a Vue HTTP interceptor to add the X-Socket-ID header.
     */
    registerVueRequestInterceptor(): void {
        Vue.http.interceptors.push((request:any, next:CallableFunction) => {
            if (this.socketId()) {
                request.headers.set('X-Socket-ID', this.socketId());
            }

            next();
        });
    }

    /**
     * Register an Axios HTTP interceptor to add the X-Socket-ID header.
     */
    registerAxiosRequestInterceptor(): any {
        axios.interceptors.request.use((config:any) => {
            if (this.socketId()) {
                config.headers['X-Socket-Id'] = this.socketId();
            }

            return config;
        });
    }

    /**
     * Register jQuery AjaxSetup to add the X-Socket-ID header.
     */
    registerjQueryAjaxSetup(): void {
        if (typeof jQuery.ajax != 'undefined') {
            jQuery.ajaxSetup({
                beforeSend: (xhr: any) => {
                    if (this.socketId()) {
                        xhr.setRequestHeader('X-Socket-Id', this.socketId());
                    }
                },
            });
        }
    }
}