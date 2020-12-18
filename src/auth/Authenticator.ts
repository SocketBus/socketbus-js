import AuthenticatorInterface from '../externals/AuthenticatorInterface';
import DefaultExternal from './DefaultExternal';
const nanoajax = require('../libs/nanoajax');

export default class Authenticator {

    external: AuthenticatorInterface;

    options: any;

    constructor(options: any) {
        this.options = options;

        this.external = new DefaultExternal(this.options);
    }

    public setExternal(external: AuthenticatorInterface) {
        this.external = external;
    }

    public getHeaders(): any {
        let defaultHeaders = {};

        return Object.assign(
            defaultHeaders, 
            this.external ? this.external.getHeaders() : {}
        );
    }

    private serialize(obj: any) {
        let str = Object.keys(obj).reduce(function(a:any, k:any){
            a.push(k + '=' + encodeURIComponent(obj[k]));
            return a;
        }, []).join('&');
        return str;
    }

    public getParameters(socketId: string, channelName: string): any {
        let defaultParameters = {
            'socket_id': socketId,
            'channel_name': channelName
        };

        return this.serialize(Object.assign(
            defaultParameters, 
            this.external ? this.external.getExtraParams() : {}
        ));
    }

    public authChannel(socketId: string, channelName: string) {
        let headers = this.getHeaders();
        let parameters = this.getParameters(socketId, channelName);

        return new Promise((resolve: Function, reject: Function)=>{
            nanoajax.ajax({
                url: this.options.authEndpoint,
                method: 'POST',
                body: parameters,
                headers: headers
            }, (code: any, responseText: any, request: any) => {
                if (code !== 200) {
                    return reject(new Error(`Request responded with status code=${code}. 200 expected`));
                }

                try {
                    let response = JSON.parse(responseText);
                    return resolve(response)
                } catch (e) {
                    return reject(new Error(`Response is not JSON`));;
                }
            });
        })
    }
}