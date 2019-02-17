import { autoinject } from "aurelia-framework";
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { AuthUser } from 'utils/auth-user';
import { AssignmentService, SearchWorkItemsModel, WorkShift} from 'services/assignment.service'


@autoinject
export class CurrentAssignments {

    workItemsDetails: Array<any> = [];
    sortedWorkItemsDetails: any[] = [];
    workShifts: Array<WorkShift> = [];
    groupedWorkItemDetails: any[] = [];
    moduleLoaded: boolean = false;

    fromDate: Date = moment().subtract(4, 'months').toDate();
    toDate: Date = moment().add(8, 'months').toDate();

    constructor(private assignmentService: AssignmentService) {

    }
    async activate() {
        let searchModel: SearchWorkItemsModel = new SearchWorkItemsModel({
            FromDate: this.fromDate,
            ToDate: this.toDate,
            WorkerPersonId: Number(AuthUser.UserId),
            TimeReported: false,
        });
        var workitems = await this.assignmentService.searchWorkItems(searchModel);
        if (workitems.length > 0) {
            var count = 0;
            this.workItemsDetails = [];
            this.workShifts = [];
            var reportableAssignments = Enumerable.from(workitems)
                .where(x => !x.IsTimeReported && !x.IsCompensationPayed  && !x.IsInvoiceCreated && !x.IsCustomerAttested )
                .toArray();

            reportableAssignments.forEach(async (item) => {
                let itemDetails: any = await this.assignmentService.getDetails(item.WorkItemId);
                this.workItemsDetails = this.workItemsDetails.concat(itemDetails);
                this.workShifts = this.workShifts.concat(itemDetails.WorkShifts)
                count++;
                if (count == reportableAssignments.length) {
                    this.moduleLoaded = true;
                }
            });
        } else {
            this.moduleLoaded = true;
        }        
    }

    attached() {
        (<any>$('[data-toggle="tooltip"]')).tooltip();
    }

    getAssignmentWeeksDistinct(workitems: any[]) {
        var data = Enumerable.from(workitems).groupBy((x: any) => x.YearNr, null!, (key: any, g) => {
            return {
                weekYears: Enumerable.from(g)
                    .select((x: any) => {
                        return {
                            week: x.WeekNr,
                            year: key,
                            weekdates: x.WeekDatesAsDateStrings
                        }
                    }).orderBy((x: any) => x.year).thenBy((x: any) => x.week).distinct((x: any) => x.week).toArray()
            }
        }).toArray();

        return data;
    }
    getWeekDateRange(dates: any) {
        if (dates) {
            return moment(dates[0]).format("DD MMM") + ' - ' + moment(dates[6]).format("DD MMM");
        }
        return '';
    }
    getAssignmentByWeekYear(weekyear: any) {
        return Enumerable.from(this.workItemsDetails).where((x: any) => x.WeekNr == weekyear.week && x.YearNr == weekyear.year)
            .orderBy((x: any) => x.EmployerName)
            .toArray();
    }
    sortByDay(workshifts: any[]) {
        return Enumerable.from(workshifts).orderBy((x: any) => x.Date).toArray();
    }
}

