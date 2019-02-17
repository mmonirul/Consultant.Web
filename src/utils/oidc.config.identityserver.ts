import { OpenIdConnectConfiguration } from "aurelia-open-id-connect";
import { UserManagerSettings, WebStorageStateStore } from "oidc-client";

const appHost = 'https://' + window.location.host;
export default {
    
    loginRedirectRoute: "/private",
    logoutRedirectRoute: "/index",
    unauthorizedRedirectRoute: "/index",
    userManagerSettings: {

        client_id: "8f553a69-5443-429a-8a81-f54834e2c68f",
        redirect_uri: `${appHost}/login`,
        post_logout_redirect_uri: `${appHost}/login`,
        response_type: "id_token token",
        scope: "openid profile email api1",
        loadUserInfo: false,

        accessTokenExpiringNotificationTime: 1,


        automaticSilentRenew: true,
        monitorSession: true,
        checkSessionInterval: 2000,
        filterProtocolClaims: true,
        
        silentRequestTimeout: 10000,
        silent_redirect_uri: `${appHost}/login`,
        userStore: new WebStorageStateStore({
            prefix: "oidc",
            store: window.localStorage,
        }),
    } as UserManagerSettings,
} as OpenIdConnectConfiguration;