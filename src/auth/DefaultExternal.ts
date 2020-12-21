import AuthenticatorInterface from "../externals/AuthenticatorInterface";

export default class DefaultExternal implements AuthenticatorInterface {
    options: any;

    constructor(options: any) {
        this.options = options;
    }
    
    getHeaders() {
        return this.options.auth.headers;
    }

    getExtraParams() {
        let extra = this.options.extraParams ?? {};
        return {
            ...extra
        };
    }
}