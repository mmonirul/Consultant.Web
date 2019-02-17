import { PLATFORM, autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { AuthUser } from 'utils/auth-user'
import { AccountService, PersonDetails, IPersonDetails } from 'services/account.service'

@autoinject
export class ProfileShell {
    person: IPersonDetails = null;
    responsible: PersonDetails = new PersonDetails({
        Name: '',
        CellPhone: '',
        Email: ''
    });
    persondetails: IPersonDetails = new PersonDetails();
    constructor(private router: Router, private accountService: AccountService) {

    }
    async activate() {
        this.person = await this.accountService.getDetails(Number(AuthUser.UserId));
        if (this.person.ResponsiblePersonId)
            this.responsible = await this.accountService.getDetails(this.person.ResponsiblePersonId);
    }
    configureRouter(config: RouterConfiguration, router: Router): void {
        //config.options.pushState = true;
        config.title = "";
        config.map([
            { route: [''], name: 'editpersondetails', moduleId: PLATFORM.moduleName('./editpersondetails'), nav: true, title: 'Uppgifter' },
            { route: 'knowledgeprofile', name: 'knowledgeprofile', moduleId: PLATFORM.moduleName('./knowledgeprofile'), nav: true, title: 'Kunskapsprofil' },
            { route: 'personbankdetails', name: 'personbankdetails', moduleId: PLATFORM.moduleName('./personbankdetails'), nav: true, title: 'Bankuppgifter' },
        ]);
        this.router = router;
    }

}
