import { LaravelConnector } from './externals/laravel/LaravelConnector';
import SocketBus from './SocketBus';

export default SocketBus;

export const init = (options: any)=>{
    return new SocketBus(options);
};

export const SocketBusLaravel = (laravelEcho: any, options: any) => {

    laravelEcho.prototype._connect = laravelEcho.prototype.connect;

    laravelEcho.prototype.connect = function() {
        if (this.options.broadcaster === 'socketbus') {
            this.connector = new LaravelConnector(Object.assign(this.options, options));
        } else {
            this._connect();
        }
    };

    laravelEcho.prototype.state = function(channel: string) {
        if (this.options.broadcaster === 'socketbus') {
            return this.connector.stateChannel(channel);
        }
        return null;
    }
    
    return new laravelEcho({
        broadcaster: 'socketbus',
        key: 'public-key'
    });
}