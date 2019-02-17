import { Aurelia, PLATFORM, autoinject } from "aurelia-framework";
import { Router, RouterConfiguration, NavigationInstruction, Next, Redirect, RouteConfig } from "aurelia-router";
import * as oidcClient from 'oidc-client';
import oidcConfig from './utils/oidc-config';
import { AuthUser } from './utils/auth-user';
import { AccountService, Company, ICompany } from './services/account.service';

@autoinject
export class App {

    private userManager: oidcClient.UserManager;
    private router: Router;

    companyDetails: ICompany = new Company();

    user: oidcClient.User;

    constructor(private accountService: AccountService) {
        this.userManager = new oidcClient.UserManager(oidcConfig.userManagerSettings);
    }

    async activate() {
        this.user = await this.userManager.getUser();
        if (this.user && !this.user.expired) {
            if (!this.isValidUser(this.user.access_token))
                await this.userManager.signoutRedirect();

            this.setUserDetails(this.user);
            this.setAjaxSettings(this.user.access_token);
            this.companyDetails = await this.accountService.getCompanyDetails();
            //console.log(this.companyDetails);
        }
        else if (window.location.hash) {
            window.location.hash = decodeURIComponent(window.location.hash);
            this.user = await this.userManager.signinRedirectCallback();
            if (this.user && !this.user.expired) {
                if (!this.isValidUser(this.user.access_token))
                    await this.userManager.signoutRedirect();

                this.setUserDetails(this.user);
                this.setAjaxSettings(this.user.access_token);

                this.companyDetails = await this.accountService.getCompanyDetails();
            }
            else this.userManager.signinRedirect();
        }
        else
        {
            this.userManager.signinRedirect();
        }
    }

    private setUserDetails(user: oidcClient.User): void {
        AuthUser.UserId = user.profile.sub;
        AuthUser.AccessToken = user.access_token;
        AuthUser.TokenType = user.token_type;
    }

    private setAjaxSettings(identityAccessTooken: string) {
        var ajaxSettings: JQuery.AjaxSettings = {
            cache: true,
            beforeSend: (xhr, settings) => {
                xhr.setRequestHeader('Authorization', 'Bearer ' + identityAccessTooken);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error('jqXHR: ', jqXHR);
                if (jqXHR && jqXHR.status === 401) {
                    //Unauthorized, need to login again
                    this.userManager.signoutRedirect();
                }
                else if (jqXHR && jqXHR.status === 403) {
                    //Forbidden
                } else if (jqXHR && jqXHR.status === 500) {
                    this.router.navigate('500');
                }
            }
        };
        $.ajaxSetup(ajaxSettings);
    }
    private parseJwt(token: string) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };
    private isValidUser(token: string): boolean {
        return this.parseJwt(token).adocka_contact_type === 'consultant';
    }

    isUserLoggedin() {
        if (this.user.access_token) {
            return true;
        }
        return false;
    }

    
    configureRouter(config: RouterConfiguration, router: Router): void {
        config.title = "Adocka consult portal";
        const handleUnknownRoutes = (instruction: NavigationInstruction): RouteConfig => {
            return { route: [''], moduleId: PLATFORM.moduleName("pages/assignment/index") };
        }
        config.mapUnknownRoutes(handleUnknownRoutes);
        config.map(this.getRouteTable());
        this.router = router;
    }
    private getRouteTable() {
        let routes = [
            { route: '', name: 'index', moduleId: PLATFORM.moduleName("pages/assignment/index"), nav: true, title: 'Mina bokningar'},
            { route: 'assignmentdetails/:id', name: 'assignmentdetails', moduleId: PLATFORM.moduleName('pages/assignment/assignmentdetails'), nav: false, title: 'Uppdrag detaljer'},
            { route: 'reportshifts', name: 'reportshifts', moduleId: PLATFORM.moduleName('pages/timereport/reportshifts'), nav: false, title: 'Tidrapport'},
            { route: 'edittimereport', name: 'edittimereport', moduleId: PLATFORM.moduleName('pages/timereport/edittimereport'), nav: false, title: 'Uppdatera tidrapporten'},
            { route: 'reportworkitem', name: 'reportworkitem', moduleId: PLATFORM.moduleName('pages/timereport/reportworkitem'), nav: false, title: 'Tidrapport' },

            { route: 'availability', name: 'availability', moduleId: PLATFORM.moduleName('pages/availability/index'), nav: true, title: 'availability' },
            { route: 'addavailabilityperiod', name: 'addavailabilityperiod', moduleId: PLATFORM.moduleName('pages/availability/addavailabilityperiod'), nav: false, title: 'Add availability' },

            { route: 'needs', name: 'needs', moduleId: PLATFORM.moduleName('pages/needs/index'), nav: true, title: 'Jobb och uppdrag' },
            { route: 'openassignmentdetails/:id', name: 'openassignmentdetails', moduleId: PLATFORM.moduleName('pages/needs/openassignmentdetails'), nav: false, title: 'Uppdrag detaljer' },
            { route: 'openshiftdetails/:id', name: 'openshiftdetails', moduleId: PLATFORM.moduleName('pages/needs/openshiftdetails'), nav: false, title: 'Arbetspass detaljer' },

            { route: ['profile', 'profile*details'], name: 'profile', moduleId: PLATFORM.moduleName("pages/profile/index"), nav: false, title: 'Profil'},
            { route: "logout", name: "logout", moduleId: PLATFORM.moduleName("pages/logout/logout"), nav: false, title: "Logga ut"},
            
            { route: "500", name: "500", moduleId: PLATFORM.moduleName("pages/errors/500"), nav: false, title: " Internal server error" }
        ];
        return routes;
    }
}
