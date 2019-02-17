import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { FileUtil } from 'utils/helpers';
import { AuthUser } from 'utils/auth-user'
import { AccountService, PersonDetails } from 'services/account.service'

@autoinject
export class PersonBankDetails {

    isSaving: boolean = false;
    showSuccessAlert: boolean = false;
    person: PersonDetails;

    constructor(private accountService: AccountService) {
    }
    async activate(params: any) {
        this.person = await this.accountService.getDetails(Number(AuthUser.UserId));
    }

    async save() {
        this.isSaving = true;
        this.person = await this.accountService.update(this.person.PersonId, this.person);
        this.isSaving = false;
        if (this.person.PersonId && !this.isSaving) {
            this.showSuccessAlert = true;
            setTimeout(() => { this.showSuccessAlert = false }, 7000);
        }
    }
}
