import { autoinject } from "aurelia-framework";
import { AssignmentService, WorkItemDetailsModel } from 'services/assignment.service'
import { AccountService, PersonDetails } from 'services/account.service'
import { Router } from "aurelia-router";


@autoinject
export class AssignmentDetails {

    workItem: WorkItemDetailsModel;
    responsible: PersonDetails = new PersonDetails();

    constructor(private assignmentService: AssignmentService, private accountService: AccountService, private router: Router) {

    }
    async activate(params: any) {
        if (params && params.id) {
            this.workItem = await this.assignmentService.getDetails(params.id);
            console.log(this.workItem);
            if (this.workItem && this.workItem.ResponsiblePersonId) {
                this.responsible = await this.accountService.getDetails(this.workItem.ResponsiblePersonId);
            }
        }
    }
}

