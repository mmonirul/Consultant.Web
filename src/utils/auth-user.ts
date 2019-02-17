export class AuthUser {
    private static userId: string = '';
    private static tokenType: string = '';
    private static accessTooken: string;
    static get UserId() {
        if (!this.userId)
            this.userId = sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : '';
        return this.userId;
    }
    static set UserId(val: string) {
        this.userId = val;
        sessionStorage.setItem('userId', val);
    }
    static get TokenType() {
        if (!this.tokenType)
            this.tokenType = sessionStorage.getItem('tokenType') ? sessionStorage.getItem('tokenType') : '';
        return this.tokenType;
    }
    static set TokenType(val: string) {
        this.tokenType = val;
        sessionStorage.setItem('tokenType', val);
    }

    static get AccessToken() {
        if (!this.accessTooken)
            this.accessTooken = sessionStorage.getItem('accessTooken') ? sessionStorage.getItem('accessTooken') : '';

        return this.accessTooken;
    }
    static set AccessToken(val) {
        this.accessTooken = val;
        sessionStorage.setItem('accessTooken', val);
    }
}
