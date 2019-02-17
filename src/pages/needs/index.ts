import { autoinject, computedFrom, reset } from "aurelia-framework";
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { AccountService, PersonDetails } from 'services/account.service';
import { AssignmentService, SearchWorkItemsModel, WorkShiftSearchModel } from 'services/assignment.service';
import { AuthUser } from "utils/auth-user";
import { extendMoment } from 'moment-range';
import { WeekBaseModel } from "apiclient/coreapiclient-generated";
const momentextend = extendMoment(moment);


@autoinject
export class IndexShell
{
    personDetails: PersonDetails;
    workItems:any[] = [];
    workShifts: any[] = [];
    workAds: any[] = [];
    workshiftsAndWorkitems: any[] = [];
    workItemsDetails: Array<any> = [];
    moduleLoaded: boolean = false;
    fromDate: Date = moment().toDate();
    toDate: Date = moment().add(6, 'months').toDate();
    availableYearWeeks: any[]= [];
    
    constructor(private accountService: AccountService, private assignmentService: AssignmentService) {
    }

    async activate() {
        await this.loadData();
    }
    private async loadData() {
        
        var workShiftPromises: any[] = [];
        var workItemPromises: any[] = [];
        
        this.personDetails = await this.accountService.getDetails(Number(AuthUser.UserId));

        if (this.personDetails) {
            this.personDetails.AllAreaOfExpertises.forEach((item: any) => {
                workItemPromises.push(this.assignmentService.searchWorkItems(new SearchWorkItemsModel({
                    AreaOfExpertise: item,
                    FromDate: this.fromDate,
                    ToDate: this.toDate,
                    Need: true,
                    Booked: false,
                    CountyCouncil: '',
                    Finished: false,
                    IsAdminAttested: false,
                    IsCustomerAttested: false,
                    PreliminiaryBooked: true,
                    TimeReported: false,
                    Weeks: this.getWeeks(moment(this.fromDate), moment(this.toDate))
                })));

                workShiftPromises.push(this.assignmentService.searchWorkShifts(new WorkShiftSearchModel({
                    Need: true,
                    AreaOfExpertise: item,
                    PreliminiaryBooked: true,
                    Weeks: this.getWeeks(moment(this.fromDate), moment(this.toDate))
                })));
            });

            await this.loadPromises(workItemPromises, workShiftPromises);
        }
       
    }

    private async loadPromises(workItemPromises: any[], workShiftPromises: any[]) {
        var workitems = await Promise.all(workItemPromises);
        this.workItems = [].concat(...workitems);

        try {
            var workshifts = await Promise.all(workShiftPromises);
            this.workShifts = [].concat(...workshifts);
        } catch (e) {
            console.log('workshift error: ', e);
        }

        this.availableYearWeeks = this.getWeeksDistinct(this.workItems, this.workShifts);
        this.workshiftsAndWorkitems = this.workShifts.concat(this.workItems); //[...this.workShifts, ...this.workItems]; //
        this.moduleLoaded = true;
    }


    getWeeksDistinct(workitems: any[], workshifts: any[]) {
        let items = workitems.concat(workshifts);
        var data = Enumerable.from(items).groupBy(x => x.YearNr, null, (key, g) => {
            return {
                weekYears: Enumerable.from(g)
                    .select((x: any) => {
                        return {
                            week: x.WeekNr,
                            year: key,
                        }
                    }).orderBy(x => x.year).thenBy(x => x.week).distinct(x => x.week).toArray()
            }
        }).orderBy((x: any) => x.YearNr).thenBy((x: any) => x.WeekNr).toArray();

        console.log('data: ', data);
        return data;
    }


    getWeekDateRange(dates: any) {
        if (dates) {
            return moment(dates[0]).format("DD MMM") + ' - ' + moment(dates[6]).format("DD MMM");
        }
        return '';
    }
    getItemsByWeek(weekyear: any) {
        var result = Enumerable.from(this.workshiftsAndWorkitems)
            .where((x: any) => x.WeekNr == weekyear.week && x.YearNr == weekyear.year)
            .select((x: any) => { return { data: x, isWorkShift: x.hasOwnProperty('id') } })
            .orderBy(x => x.data.Date)
            .toArray();
        return result;

    }

    private getWeeks(from: moment.Moment, to: moment.Moment): Array<WeekBaseModel> {
        var range = momentextend.range(from, to);
        var weeks = Array.from(range.by('week'));
        var result = weeks.map((x) => {
            return new WeekBaseModel({ Week: x.isoWeek(), Year: x.isoWeekYear() });
        });
        return result;
    }

}

export interface IAuthUser {
    PersonId: number;
    AccessToken: string;
    TokenType: string;
}