import * as OidcClient from "oidc-client";
import oidcConfig from '../../utils/oidc-config';


export class Logout {
    private userManager: OidcClient.UserManager;

    constructor() {
        this.userManager = new OidcClient.UserManager(oidcConfig.userManagerSettings);
        this.userManager.signoutRedirect();
    }
    public async activate() {
       
    }
}