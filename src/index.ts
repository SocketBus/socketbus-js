import { LaravelConnector } from './externals/laravel/LaravelConnector';
export default class SocketBus {
    public static laravel(laravelEcho: any, options: any)
    {
        laravelEcho.prototype._connect = laravelEcho.prototype.connect;

        laravelEcho.prototype.connect = function() {
            if (this.options.broadcaster === 'socket-bus') {
                this.connector = new LaravelConnector(Object.assign(this.options, options));
            } else {
                this._connect();
            }
        };

        laravelEcho.prototype.state = function(channel: string) {
            if (this.options.broadcaster === 'socket-bus') {
                return this.connector.stateChannel(channel);
            }
            return null;
        }
        
        return new laravelEcho({
            broadcaster: 'socket-bus',
            key: 'your-pusher-channels-key'
        });
    }
}