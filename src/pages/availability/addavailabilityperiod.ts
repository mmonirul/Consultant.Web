import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { DialogService } from 'aurelia-dialog';
import { DateUtil } from 'utils/helpers';
import { AccountService, AvailableForWork } from 'services/account.service';
import { AuthUser } from 'utils/auth-user';

@autoinject
export class AddAvailabilityPeriod {

    isChanged: boolean = false;
    registeredAvailableDaysForWork: any[] = [];
    model!: {
        Weeks: any[];
        SelectedWeeks: any[];
        WeekDays: any[];
        SelectedWeekDays: any[];
        FromTime: string;
        ToTime: string;
    };


    constructor(private router: Router) {
    }

    async activate(params: any) {
        this.registeredAvailableDaysForWork = localStorage.registered_available_for_work ? JSON.parse(localStorage.registered_available_for_work) : [];

        var thisyearweeks = Enumerable.from(DateUtil.YearWeeksModel(moment()).Weeks).where((x:any) => x.Week >= moment().isoWeek()).toArray();
        var nextyearweeks = DateUtil.YearWeeksModel(moment().add(1, 'year')).Weeks;
        var weeks = thisyearweeks.concat(nextyearweeks);
        var weekdays = DateUtil.isoWeekDays();
        this.model = {
            Weeks: weeks,
            SelectedWeeks: [],
            WeekDays: weekdays,
            SelectedWeekDays: [],
            FromTime: '08:00',
            ToTime: '17:00'
        };
    }
    get years(): any[] {
        return Enumerable.from(this.model.Weeks).select(x => x.Year).distinct().orderBy(x => x).toArray();
    }    
    getWeeks(year: any): any[] {
        return Enumerable.from(this.model.Weeks).where((x:any) => x.Year == year).orderBy((x:any) => x.Week).toArray();
    }

    selectWeek(item: any) {
        console.log(item);

        var existing = Enumerable.from(this.model.SelectedWeeks).firstOrDefault((x: any) => x.Year === item.Year && x.Week === item.Week);
        if (existing) {
            this.model.SelectedWeeks = Enumerable.from(this.model.SelectedWeeks).where((x: any) => x !== existing).toArray();
            item.isSelected = false;
        } else {
            this.model.SelectedWeeks.push(item);
            item.isSelected = true;
        }
    }
    selectAllWeeks(year: any) {
        var weeks = this.getWeeks(year);
        weeks.forEach((week) => {
            if (!Enumerable.from(this.model.SelectedWeeks).any((x:any) => x.Year === week.Year && x.Week === week.Week)) {
                week.isSelected = true;
                this.model.SelectedWeeks.push(week);
            }
        });
    }

    async save() {
        this.registeredAvailableDaysForWork = await this.generateAvailableForWorkModel(this.model.SelectedWeeks, this.model.SelectedWeekDays, this.model.FromTime, this.model.ToTime);
        console.log(this.registeredAvailableDaysForWork);
        if (this.isChanged) {
            localStorage.setItem('available_for_work_has_changed', JSON.stringify(this.registeredAvailableDaysForWork));
        }
        this.router.navigateToRoute('availability', {})
    }

    private generateAvailableForWorkModel(selectedWeeks: any[], selectedWeekDays: any[], fromTime: string, toTime:string) {

        var allcurrentitems: any[] = Enumerable.from(this.registeredAvailableDaysForWork).toArray(); //copy current
        selectedWeeks.forEach((week: any) => {
            selectedWeekDays.forEach((weekday: any) => {
                var momentdate = DateUtil.GetDate(week.Year, week.Week, weekday.DayOfWeek);//  moment().isoWeekday(weekday.DayOfWeek).year(week.Year).isoWeek(week.Week);
                var data: AvailableForWork = new AvailableForWork({
                    id: null,
                    YearNr: momentdate.year(),
                    MonthNr: null,
                    WeekNr: momentdate.isoWeek(),
                    Date: momentdate.toDate(),
                    FromTime: fromTime,
                    ToTime: toTime,
                    TimeZoneId: null,
                    PersonId: AuthUser.UserId
                });
                data.init(data);
                console.log('AvailableForWork.. :', data);
                var found = allcurrentitems.find(x => { return (x.YearNr === data.YearNr && x.WeekNr === data.WeekNr && moment(x.Date).format('YYYY-MM-DD') === moment(data.Date).format('YYYY-MM-DD') && x.FromTime === data.FromTime && x.ToTime === data.ToTime) });
                if (!found) {
                    allcurrentitems.push(data);
                    this.isChanged = true;
                }
            });
        });
        return allcurrentitems;
    }
    cancel() {
        localStorage.removeItem('registered_available_for_work');
        this.router.navigateToRoute('availability', {})
    }
}
