import { autoinject } from "aurelia-framework";
import * as Enumerable from 'linq';
import { AccountService, PersonDetails } from 'services/account.service';
import { AssignmentService, WorkItemDetailsModel, WorkShiftSearchModel, WorkItemCandidate } from 'services/assignment.service';
import { AuthUser } from "utils/auth-user";

@autoinject
export class AssignmentDetails {

    workItem: WorkItemDetailsModel = null;
    moduleLoaded: boolean = false;
    workItemId: any;
    candidateComment: string = '';
    responsible: PersonDetails = new PersonDetails();
    isApplied: boolean = false;
    candidates: WorkItemCandidate[] = [];

    constructor(private accountService: AccountService, private assignmentService: AssignmentService) {
    }

    async activate(params: any) {
        if (params && params.id) {
            this.workItemId = params.id;
            this.workItem = await this.assignmentService.getDetails(this.workItemId);
            this.candidates = await this.assignmentService.getCandidates(this.workItemId);
            console.log(this.candidates);
            this.isApplied = this.checkCandidate(this.candidates);

            if (this.workItem && this.workItem.ResponsiblePersonId) {
                this.responsible = await await this.accountService.getDetails(this.workItem.ResponsiblePersonId);
            }
        }
    }   
    async apply() {

        let workitemCandidate: WorkItemCandidate = new WorkItemCandidate({
            WorkItemId: this.workItem.WorkItemId,
            PersonId: Number(AuthUser.UserId),
            Comment: this.candidateComment,
        });
        if (!this.isApplied) {
            await this.assignmentService.apply(workitemCandidate);
            this.isApplied = this.checkCandidate(this.candidates);
        }
    }
    private checkCandidate(candidates: any): boolean {
        return Enumerable.from(candidates).any((x:any) => x.PersonId === Number(AuthUser.UserId));
    }
}