import { autoinject } from "aurelia-framework";
import { Router } from 'aurelia-router';
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { AuthUser } from 'utils/auth-user';
import { AssignmentService, WorkItemDetailsModel } from 'services/assignment.service';
import { TimeReportService, TimeReport, ITimeReport, WorkShift, Timelog, TimeReportLine, DateEpoch, TimeGroupMini } from 'services/timereport.service';
import { EditTimeLog } from '../../dialogs/edit-timelog.dialog';
import { EditArticale } from '../../dialogs/edit-article.dialog';
import { DialogService, DialogCancellableOpenResult } from 'aurelia-dialog';

@autoinject
export class EditTimeReport {

    private workItemId: number;
    private returnUrl: string;

    workShift: WorkShift;
    timeReportModels: TimeReport[] = [];
    timeReportModel: TimeReport;
    weekDays: any[] = [];
    weekends: any[] = [];
    selecetedWorkshiftreportmodel: any;
    moduleLoaded: boolean = false;
    timeReportLineArticles: any[];
    breakMinutes: number = 0;

    constructor(private dialogService: DialogService, private assignmentService: AssignmentService, private timeReportService: TimeReportService, private router: Router) {


    }
    async activate(params: any) {
        console.log(params);
        console.log(params.returnUrl);
        var localStorageValue = localStorage.getItem('reportable_work_shifts');
        if (!localStorageValue) this.router.navigateBack();
        else this.timeReportModels = JSON.parse(localStorageValue);

        if (params.returnUrl) this.returnUrl = params.returnUrl;
        if (params.id) {
            this.timeReportModel = Enumerable.from(this.timeReportModels).firstOrDefault((x: any) => x.WorkShiftId == params.id);
            if (this.timeReportModel == null) {
                try {
                    this.workShift = await this.assignmentService.shiftDetails(params.id);
                    this.timeReportModel = await this.timeReportService.create(this.workShift);
                    this.breakMinutes = this.timeReportModel.BreakMinutes;
                } catch (e) {
                    console.log(e);
                }
            } else {
                this.breakMinutes = this.timeReportModel.BreakMinutes;
                this.workShift = this.timeReportModel.WorkShift;
            }
            this.timeReportLineArticles = Enumerable.from(this.timeReportModel.TimeReportLines).where((x: any) => x.Uom != 'h').toArray();
        }        
    }


    async deleteTimeLog(timelog: any) {
        this.timeReportModel.TimeLogs = Enumerable.from(this.timeReportModel.TimeLogs).where((x: any) => x.StartTime.Epoch !== timelog.StartTime.Epoch).toArray();
        this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
    }
    editTimeLog(timelog: any) {
        var _model = {
            ManualTimeGroups: Enumerable.from(this.timeReportModel.ManualTimeGroups).where((x: any) => x.Uom == 'h').toArray(),
            AutoCalculatingTimeGroups: Enumerable.from(this.timeReportModel.AutoCalculatingTimeGroups).where((x: any) => x.Uom == 'h').toArray(),
            FromDefaultPriceProfileTimeGroupId: timelog.SpecifiedFromDefaultTimeGroupId,
            FromTime: moment(timelog.StartTime.Date).format("HH:mm"),
            ToTime: moment(timelog.StopTime.Date).format("HH:mm"),
            Description: timelog.Description
        };

        this.dialogService.open({ viewModel: EditTimeLog, model: { model: _model, title: "Ändra tid" }, lock: false }).then((openDialogResult: any) => {
            return openDialogResult.closeResult;
        }).then((response) => {
            if (!response.wasCancelled) {
                _model = response.output;
                this.convertEditedTimeLogModel(timelog, _model);
                console.log(_model);
            } else {
                console.log('bad');
            }
        });
    }
    private async convertEditedTimeLogModel(timelog: any, model: any) {
        if (model) {
            var fromdate = moment(this.timeReportModel.WorkShift.Date + ' ' + model.FromTime).utc();
            var todate = moment(this.timeReportModel.WorkShift.Date + ' ' + model.ToTime).utc();

            if (todate < fromdate)
                todate.add(1, "days");

            var newtimelog: Timelog = new Timelog();
            newtimelog.init(timelog);
            this.timeReportModel.TimeLogs = this.timeReportModel.TimeLogs.filter((el: any) => {
                return el.StartTime.Date != timelog.StartTime.Date;
            });
            newtimelog.StartTime = new DateEpoch({
                Date: fromdate.toDate()
            });
            newtimelog.StopTime = new DateEpoch({ Date: todate.toDate() });

            newtimelog.Description = model.Description;
            if (model.FromDefaultPriceProfileTimeGroupId) {
                var timegroup: any = Enumerable.from(model.ManualTimeGroups).first((x: any) => x.DefaultPriceProfileTimeGroupId == model.FromDefaultPriceProfileTimeGroupId);
                newtimelog.SpecifiedFromDefaultTimeGroupId = timegroup.DefaultPriceProfileTimeGroupId.toString();
                newtimelog.SpecifiedFromDefaultTimeGroupName = timegroup.Name;
            } else {
                newtimelog.SpecifiedFromDefaultTimeGroupId = undefined;
                newtimelog.SpecifiedFromDefaultTimeGroupName = '';
            }
            this.adjustTimeLogs(newtimelog);
            this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
        }
    }

    async addTimeLog() {
        var _model = {
            ManualTimeGroups: Enumerable.from(this.timeReportModel.ManualTimeGroups).where((x: any) => x.Uom == 'h').toArray(),
            AutoCalculatingTimeGroups: Enumerable.from(this.timeReportModel.AutoCalculatingTimeGroups).where((x: any) => x.Uom == 'h').toArray(),
            FromDefaultPriceProfileTimeGroupId: null,
            FromTime: "08:00",
            ToTime: "17:00",
            Description: ''
        };
        this.dialogService.open({ viewModel: EditTimeLog, model: { model: _model, title: "Lägg till tid" }, lock: false }).then((openDialogResult: any) => {
            return openDialogResult.closeResult;
        }).then((response) => {
            if (!response.wasCancelled) this.convertNewTimeLogModel(response.output);
            else console.log('bad');
        });
    }

    private async convertNewTimeLogModel(model) {
        if (model) {
            var fromdate = moment(this.timeReportModel.WorkShift.Date + ' ' + model.FromTime).utc();
            var todate = moment(this.timeReportModel.WorkShift.Date + ' ' + model.ToTime).utc();

            if (todate < fromdate) todate.add(1, "days");

            var timelog = new Timelog();
            timelog.init(timelog);
            timelog.BreakMinutes = 0;
            timelog.Canceled = false;
            timelog.CultureId = this.timeReportModel.WorkShift.CultureId;
            timelog.Description = model.Description;
            timelog.Name = this.timeReportModel.WorkShift.WorkerName;
            timelog.IsTimeReported = false;
            timelog.PersonId = this.timeReportModel.WorkShift.WorkerPersonId.toString();
            timelog.SocialSecurityNo = this.timeReportModel.WorkShift.WorkerSocialSecurityNo;

            if (model.FromDefaultPriceProfileTimeGroupId) {
                let _menualTimeGroups: TimeGroupMini[] = model.ManualTimeGroups;
                let timegroup: TimeGroupMini = Enumerable.from(_menualTimeGroups).first((x: any) => x.DefaultPriceProfileTimeGroupId == model.FromDefaultPriceProfileTimeGroupId);
                timelog.SpecifiedFromDefaultTimeGroupId = timegroup.DefaultPriceProfileTimeGroupId.toString();
                timelog.SpecifiedFromDefaultTimeGroupName = timegroup.Name;
            } else {
                timelog.SpecifiedFromDefaultTimeGroupId = null;
                timelog.SpecifiedFromDefaultTimeGroupName = null;
            }

            timelog.StartTime = new DateEpoch({
                Date: fromdate.toDate()
            });
            timelog.StopTime = new DateEpoch({
                Date: todate.toDate()
            });
            timelog.TimeZoneId = this.timeReportModel.WorkShift.TimeZoneId;
            timelog.WorkItemId = this.timeReportModel.WorkShift.WorkItemId;
            timelog.WorkShiftId = this.timeReportModel.WorkShift.id;
            this.adjustTimeLogs(timelog);
            this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
        }
    }
    private adjustTimeLogs(newtimelog: Timelog) {
        var tosplit: any = Enumerable.from(this.timeReportModel.TimeLogs).firstOrDefault((x: any) => x.StartTime.Date < newtimelog.StartTime.Date && x.StopTime.Date > newtimelog.StopTime.Date);
        if (tosplit) {
            //Remove
            this.timeReportModel.TimeLogs = this.timeReportModel.TimeLogs.filter((el) => {
                return el.StartTime.Date != tosplit.StartTime.Date;
            });

            var item1: Timelog = new Timelog();
            item1.init(tosplit);
            item1.StopTime.Date = newtimelog.StartTime.Date;
            this.timeReportModel.TimeLogs.push(item1);
            var item2: Timelog = new Timelog();
            item2.init(tosplit);
            item2.StartTime.Date = newtimelog.StopTime.Date;
            this.timeReportModel.TimeLogs.push(item2);
        }

        var tocropright: any = Enumerable.from(this.timeReportModel.TimeLogs).firstOrDefault((x: any) => x.StartTime.Date < newtimelog.StartTime.Date && x.StopTime.Date < newtimelog.StopTime.Date && x.StopTime.Date > newtimelog.StartTime.Date);
        if (tocropright) {
            //Remove
            this.timeReportModel.TimeLogs = this.timeReportModel.TimeLogs.filter((el) => {
                return el.StartTime.Date != tocropright.StartTime.Date;
            });
            tocropright.StopTime.Date = newtimelog.StartTime.Date;
            this.timeReportModel.TimeLogs.push(tocropright);
        }

        var tocropleft: any = Enumerable.from(this.timeReportModel.TimeLogs).firstOrDefault((x: any) => x.StartTime.Date > newtimelog.StartTime.Date && x.StartTime.Date < newtimelog.StopTime.Date && x.StopTime.Date > newtimelog.StopTime.Date);
        if (tocropleft) {
            //Remove
            this.timeReportModel.TimeLogs = this.timeReportModel.TimeLogs.filter((el) => {
                return el.StartTime.Date != tocropleft.StartTime.Date;
            });
            tocropleft.StartTime.Date = newtimelog.StopTime.Date;
            this.timeReportModel.TimeLogs.push(tocropleft);
        }

        this.timeReportModel.TimeLogs.push(newtimelog);
        this.timeReportModel.TimeLogs = Enumerable.from(this.timeReportModel.TimeLogs).orderBy((x: any) => x.StartTime.Date).toArray();
    }


    getArticlesGroups() {
        if (this.timeReportModel)
            return Enumerable.from(this.timeReportModel.ManualTimeGroups).where((x: any) => x.Uom != 'h').toArray();
        return [];
    }
    async addArticle() {
        var manualtimegroups = Enumerable.from(this.timeReportModel.ManualTimeGroups).where((x: any) => x.Uom != 'h');
        var _model = {
            ManualTimeGroups: manualtimegroups.toArray(),
            SelectedTimeGroup: manualtimegroups.count() === 1 ? manualtimegroups.first() : null,
            Amount: 0,
            Description: ''
        };

        this.dialogService.open({ viewModel: EditArticale, model: { model: _model, title: "Lägg till artikel" }, lock: false }).then((openDialogResult: any) => {
            return openDialogResult.closeResult;
        }).then((response) => {
            if (!response.wasCancelled) {
                _model = response.output;
                this.convertTimeReportLine(_model);
            } else {
                console.log('bad');
            }
        });
    }
    private convertTimeReportLine(model: any) {
        if (model) {
            var timereportline = new TimeReportLine();
            timereportline.Amount = model.Amount;
            timereportline.Date = this.timeReportModel.WorkShift.Date;
            timereportline.CostCenter = this.timeReportModel.WorkShift.CostCenter;
            timereportline.Title = model.SelectedTimeGroup.Name;
            timereportline.Uom = model.SelectedTimeGroup.Uom;
            timereportline.FromDefaultPriceProfileTimeGroupId = model.SelectedTimeGroup.DefaultPriceProfileTimeGroupId;
            this.timeReportModel.TimeReportLines.push(timereportline);
            this.timeReportLineArticles = Enumerable.from(this.timeReportModel.TimeReportLines).where((x: any) => x.Uom != 'h').toArray();
        }
    }

    async editArticle(article: TimeReportLine) {

        var manualtimegroups = Enumerable.from(this.timeReportModel.ManualTimeGroups).where(x => x.Uom != 'h');
        var selectedtimegroup: TimeGroupMini = manualtimegroups.firstOrDefault(x => x.DefaultPriceProfileTimeGroupId === article.FromDefaultPriceProfileTimeGroupId);
        var _model = {
            ManualTimeGroups: manualtimegroups.toArray(),
            SelectedTimeGroup: selectedtimegroup,
            Amount: article.Amount,
            Description: ''
        };
        this.dialogService.open({ viewModel: EditArticale, model: { model: _model, title: "Ändra artikel" }, lock: false }).then((openDialogResult: any) => {
            return openDialogResult.closeResult;
        }).then((response) => {
            if (!response.wasCancelled) {
                _model = response.output;
                article.Amount = Number(_model.Amount);

                article.Date = this.timeReportModel.WorkShift.Date;
                article.CostCenter = this.timeReportModel.WorkShift.CostCenter;
                article.Title = _model.SelectedTimeGroup.Name;
                article.Uom = _model.SelectedTimeGroup.Uom;
                article.FromDefaultPriceProfileTimeGroupId = _model.SelectedTimeGroup.DefaultPriceProfileTimeGroupId;
            }
            else console.log('bad');
        });
    }

    async deleteArticle(timereportline: TimeReportLine) {
        if (!confirm('Är du säker på att du vill ta bort artikel?')) return;
        let index = this.timeReportLineArticles.indexOf(timereportline);
        if (index > -1) {
            this.timeReportLineArticles.splice(index, 1);
            this.timeReportModel.TimeReportLines = this.timeReportLineArticles;
        }
        this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
    }

    async addBreakMinutes() {
        this.timeReportModel.BreakMinutes = Number(this.breakMinutes);
        this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
    }
    async save() {
        //if(Number(this.breakMinutes) > 0)
        //    this.timeReportModel.BreakMinutes = Number(this.breakMinutes);
        this.timeReportModel.BreakMinutes = Number(this.breakMinutes);
        this.timeReportModel = await this.timeReportService.recalculate(this.timeReportModel);
        var newTimereportmodel = jQuery.extend({}, this.timeReportModel);
        this.timeReportModels = Enumerable.from(this.timeReportModels).where((x: any) => x.WorkShiftId != this.timeReportModel.WorkShiftId).toArray();
        this.timeReportModels.push(newTimereportmodel);
        localStorage.setItem('reportable_work_shifts', JSON.stringify(this.timeReportModels));
        this.router.navigateToRoute('reportshifts', { id: this.workShift.WorkItemId });
    }
    cancel() {
        if (this.returnUrl) {
            localStorage.removeItem('reportable_work_shifts');
            this.router.navigate(this.returnUrl);
        }
    }

}

