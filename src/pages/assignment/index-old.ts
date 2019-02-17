import { PLATFORM, autoinject } from "aurelia-framework";
import { Router, RouterConfiguration} from "aurelia-router";

export class IndexShell {
    router: Router | undefined;

    constructor() {

    }
    async activate() {
        //localStorage.removeItem('reportable_work_shifts');
    }
    configureRouter(config: RouterConfiguration, router: Router): void {
        config.title = "Mina bokningar";
        config.map([
            { route: [''], name: 'currentassignments', moduleId: PLATFORM.moduleName('./currentassignments'), nav: true, title: 'Aktuella bokningar' },
            { route: 'previousassignments', name: 'previousassignments', moduleId: PLATFORM.moduleName('./previousassignments'), nav: true, title: 'Tidigare bokningar', href: '/index/previousassignments' }
        ]);
        this.router = router;
    }

}
