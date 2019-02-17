import { autoinject } from 'aurelia-framework';
import * as Enumerable from 'linq';
import { AccountService, PersonDetails } from 'services/account.service';
import { AssignmentService, WorkShiftCandidate, WorkShift } from 'services/assignment.service';
import { AuthUser } from "utils/auth-user";


@autoinject
export class AssignmentDetails {

    workShift: WorkShift = null;
    workShiftId: string;
    responsible: PersonDetails = new PersonDetails();
    isApplied: boolean = false;

    constructor(private accountService: AccountService, private assignmentService: AssignmentService) {

    }

    async activate(params: any) {
        if (params && params.id) {
            this.workShiftId = params.id;
            this.workShift = await this.assignmentService.shiftDetails(this.workShiftId);
            if (this.workShift.Candidates.length > 0)
                this.isApplied = this.checkCandidate(this.workShift.Candidates);
            if (this.workShift && this.workShift.ResponsiblePersonId) {
                this.responsible = await this.accountService.getDetails(this.workShift.ResponsiblePersonId);
            }
        }
    }   
    async apply() {
        if (!confirm("Are you sure?")) return;
        var person: any = await this.accountService.getDetails(Number(AuthUser.UserId));
        let workShiftCandidate: WorkShiftCandidate = new WorkShiftCandidate({
            Name: person.Name,
            Email: person.Email,
            Phone: person.CellPhone,
            PersonId: AuthUser.UserId,
        });
        workShiftCandidate.init(workShiftCandidate);
        this.workShift.Candidates.push(workShiftCandidate);
        await this.assignmentService.updateWorkShift(this.workShift.id, this.workShift);
        this.isApplied = this.checkCandidate(this.workShift.Candidates);
    }
    private checkCandidate(candidates: WorkShiftCandidate[]): boolean {
        return Enumerable.from(candidates).any(x => x.PersonId === AuthUser.UserId); 
    }
}