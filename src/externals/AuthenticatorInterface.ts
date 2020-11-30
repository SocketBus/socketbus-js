export default abstract class AuthenticatorInterface {
    options: any;

    constructor(options: any) {
        this.options = options;
    }

    abstract getHeaders(): any;
    abstract getExtraParams(): any;
}