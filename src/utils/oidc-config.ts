import { WebStorageStateStore, UserManagerSettings } from "oidc-client";
const appHost = window.location.protocol + '//' + window.location.host;
export default {

    userManagerSettings: {

        authority: 'https://identity.adocka.com/',
        client_id: '8f553a69-5443-429a-8a81-f54834e2c68f',
        redirect_uri: appHost + "/app",
        post_logout_redirect_uri: appHost + "/index",

        popup_redirect_uri: appHost + "/app",
        popupWindowFeatures: "menubar=yes,location=yes,toolbar=yes,width=1200,height=800,left=100,top=100;resizable=yes",

        response_type: "id_token token",
        scope: "openid profile email api1",

        loadUserInfo: true,

        silent_redirect_uri: appHost + "/app",
        automaticSilentRenew: false,

        revokeAccessTokenOnSignout: true,
        filterProtocolClaims: true,

        userStore: new WebStorageStateStore({
            prefix: "oidc",
            store: window.localStorage,
        }),
    } as UserManagerSettings
}