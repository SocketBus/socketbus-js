import AuthenticatorInterface from '../AuthenticatorInterface';

declare const window: any;
export default class LaravelAuthenticator extends AuthenticatorInterface{

    public getHeaders() {
        return {
            'X-CSRF-TOKEN': this.getCsrfToken()
        }
    }

    public getExtraParams() {
        return {};
    }

    private getCsrfToken(): string|null {
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
}