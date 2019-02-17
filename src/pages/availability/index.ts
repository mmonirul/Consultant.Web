import { autoinject, computedFrom, reset } from "aurelia-framework";
import { Router } from 'aurelia-router';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { AuthUser } from 'utils/auth-user';
import { AccountService, AvailableForWork } from 'services/account.service';
import { DateUtil } from 'utils/helpers';
import { EditAvailableDay } from 'dialogs/edit-availableday.dialog';

@autoinject
export class Availability {

    workShifts: Array<any> = [];
    sortedShifts!: { Year: any; Available: { Week: any; Shifts: any; }[]; }[];
    registeredAvailableDaysForWork: any[] = [];
    isChanged: boolean = false;
    isSaving: boolean = false;

    constructor(private dialogService: DialogService, private router: Router, private accountService: AccountService) {
        moment.locale('sv');
    }

    async activate() {

        var availableForWorkHasChenged = localStorage.getItem('available_for_work_has_changed');
        if (availableForWorkHasChenged) {
            let _availableForWork = JSON.parse(availableForWorkHasChenged);
            this.registeredAvailableDaysForWork = _availableForWork;
            this.sortAvailableDays(this.registeredAvailableDaysForWork);
            this.isChanged = true;
        }
        if (this.registeredAvailableDaysForWork.length == 0) {
            this.registeredAvailableDaysForWork = await this.accountService.getAvailableDays(AuthUser.UserId);
            this.sortAvailableDays(this.registeredAvailableDaysForWork);
        }
    }

    private sortAvailableDays(avaiabledays: any[]) {
        this.sortedShifts = this.groupAvailableDaysByYearWeek(avaiabledays);
    }

    private groupAvailableDaysByYearWeek(availabledays: Array<any>) {
        var _availableDays = Enumerable.from(availabledays)
            .groupBy(x => x.YearNr, null!, (key, g) => {
                return {
                    Year: key,
                    Available: g.where((a: any) => a.YearNr == key)
                        .groupBy((w: any) => w.WeekNr, null!, (week: any, s: any) => {
                            return {
                                Week: week,
                                Shifts: s.orderBy((x: any) => x.Date).toArray(),
                                weekShifts: this.getOrderedWeekShifts(availabledays, key, week)
                            }
                        }).orderBy((x: any) => x.Week).toArray()
                }
            }).orderBy((x: any) => x.Year).toArray();
        console.log('_availableDays: ', _availableDays);
        return _availableDays;
    }   
    getOrderedWeekShifts(shifts: any, year: any, week: any) {
        var dates = DateUtil.isoWeekDates(year, week);
        var orderedShifts: any[] = [];
        for (var i = 0; i < dates.length; i++) {
            var availableShifts: any = Enumerable.from(shifts).where((x: any) => moment(x.Date).format("YYYY-MM-DD") == moment(dates[i]).format("YYYY-MM-DD")).toArray();
            var _model = {
                Date: moment(dates[i]).format('YYYY-MM-DD'),
                availableShifts: availableShifts
            };
            orderedShifts.push(_model);
        }
        return Enumerable.from(orderedShifts).orderBy((x: any) => x.Date).toArray();

    }

    addPeriod() {
        localStorage.setItem('registered_available_for_work', JSON.stringify(this.registeredAvailableDaysForWork));
        this.router.navigateToRoute('addavailabilityperiod');
    }
    addAvailableDay() {
        var _week = moment().isoWeek();
        var _year = moment().year();
        var model: AvailableForWork = new AvailableForWork({
            id: '',
            YearNr: _year,
            WeekNr: _week,
            Date: moment().day(1).year(_year).isoWeek(_week).toDate(),
            FromTime: '08:00',
            ToTime: '17:00',
            TimeZoneId: null,
            PersonId: AuthUser.UserId
        });

        this.dialogService.open({ viewModel: EditAvailableDay, model: { model: model, title: "Ny tillgänglighet" }, lock: false })
            .then((openDialogResult: any) => {
                return openDialogResult.closeResult;
            }).then((response) => {
                if (!response.wasCancelled) {
                    var momentdate = moment(response.output.Date);
                    model.YearNr = momentdate.year();
                    model.WeekNr = momentdate.isoWeek();
                    this.addAvailableItem(model);
                    this.isChanged = true;
                } else {
                    console.log('bad');
                }
            });
    }
    editAvailableDay(day: AvailableForWork) {
        console.log(day);
        this.dialogService.open({ viewModel: EditAvailableDay, model: { model: day, title: "Ändra tillgänglighet" }, lock: false })
            .then((openDialogResult: any) => {
                return openDialogResult.closeResult;
            }).then((response) => {
                if (!response.wasCancelled) {
                    let editedDay = response.output;
                    day.Date = new Date(editedDay.Date);
                    day.FromTime = editedDay.FromTime;
                    day.ToTime = editedDay.ToTime;
                    this.isChanged = true;
                } else {
                    console.log('bad');
                }
            });
    }
    private addAvailableItem(item: any) {
        var found = Enumerable.from(this.registeredAvailableDaysForWork)
            .firstOrDefault(x => x.YearNr == item.YearNr && x.WeekNr == item.WeekNr && moment(x.Date).format('YYYY-MM-DD') == moment(item.Date).format('YYYY-MM-DD') && x.FromTime == item.FromTime && x.ToTime == item.ToTime);
        if (!found) {
            this.registeredAvailableDaysForWork.push(item);
            this.isChanged = true;
        }
        this.sortAvailableDays(this.registeredAvailableDaysForWork);
    }

    deleteDay(day: any) {
        console.log(JSON.stringify(day));
        this.registeredAvailableDaysForWork = this.registeredAvailableDaysForWork.filter((item: any) => {
            return item != day;
        });
        this.isChanged = true;
        this.sortAvailableDays(this.registeredAvailableDaysForWork);
    }

    async deleteWeek(week, year) {
        var toremove = Enumerable.from(this.registeredAvailableDaysForWork)
            .where((x: any) => x.YearNr == year && x.WeekNr == week)
            .toArray();
        if (!confirm("Är du säker att du vill ta bort din tillgänglighet för denna vecka? ")) return;

        toremove.forEach((item: any) => {
            this.registeredAvailableDaysForWork = Enumerable.from(this.registeredAvailableDaysForWork).where((x: any) => x !== item).toArray();
        });
        this.isChanged = true;
        this.sortAvailableDays(this.registeredAvailableDaysForWork);    }

    async save() {
        this.isSaving = true;
        await this.accountService.updateAvailableDays(AuthUser.UserId, this.registeredAvailableDaysForWork);;
        this.registeredAvailableDaysForWork = await this.accountService.getAvailableDays(AuthUser.UserId);
        this.isSaving = false;
        this.sortAvailableDays(this.registeredAvailableDaysForWork);
        this.isChanged = false;
        localStorage.removeItem('available_for_work_has_changed');
    }
}