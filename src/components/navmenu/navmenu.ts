import { Router, NavModel } from "aurelia-router";
import { autoinject, inject } from "aurelia-framework";
import { bindable } from 'aurelia-framework';
import { AuthUser } from '../../utils/auth-user'
import { AccountService, PersonDetails, IPersonDetails  } from '../../services/account.service'

@autoinject
export class Navmenu {
    title: string = 'Hello World!';

    @bindable companydetails: any;
    persondetails: IPersonDetails = new PersonDetails();

    constructor(private router: Router, private accountService: AccountService) {
    }
    async created() {
        this.persondetails = await this.accountService.getDetails(Number(AuthUser.UserId));
    }
    bind() {
        
    }
    attached() {
    }
    isUserLoggedin() {
        if (AuthUser.AccessToken) return true;
        return false;
    }

}
