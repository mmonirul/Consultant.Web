import { autoinject } from "aurelia-framework";
import { Router } from 'aurelia-router';
import * as moment from 'moment';
import * as Enumerable from 'linq';
import { AuthUser } from 'utils/auth-user';
import { AssignmentService, WorkItemDetailsModel } from 'services/assignment.service';
import { TimeReportService, ITimeReport, TimeReport } from 'services/timereport.service';


@autoinject
export class ReportShifts {

    private workItemId: number;
    private returnUrl: string;

    workItem: WorkItemDetailsModel;
    timeReportModels: ITimeReport[] = [];
    weekDays: any[] = [];
    weekends: any[] = [];
    selecetedWorkshiftreportmodel: any;
    moduleLoaded: boolean = false;

    constructor(private timeReportService: TimeReportService, private assignmentService: AssignmentService, private router: Router) {

    }
    async activate(params: any) {
        console.log(params);
        params.id ? this.workItemId = Number(params.id) : this.workItemId = null;
        params.returnUrl ? this.returnUrl = params.returnUrl : this.returnUrl = '';
        if (this.workItemId)
            this.loadData();
    }

    async loadData() {
        this.workItem = await this.assignmentService.getDetails(this.workItemId);
        if (this.workItem && this.workItem.WorkShifts.length > 0) {
            if (!this.hasSavedReportModel()) {
                console.log('Server call..');
                for (var i = 0; i < this.workItem.WorkShifts.length; i++) {
                    if (this.workItem.WorkShifts[i].TimeReportId) {
                        var response = await this.timeReportService.get(this.workItem.WorkShifts[i].TimeReportId);
                    } else {
                        try {
                            var response = await this.timeReportService.create(this.workItem.WorkShifts[i]);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.timeReportModels.push(response);
                }
            }
            this.weekDays = Enumerable.from(this.workItem.WeekDatesAsDateStrings).take(5).toArray();
            this.weekends = Enumerable.from(this.workItem.WeekDatesAsDateStrings).skip(5).take(2).toArray();
            this.moduleLoaded = true;
        }
    }
    private hasSavedReportModel() {
        var localStorageValue = localStorage.getItem('reportable_work_shifts');
        if (!localStorageValue) return false;

        var _timereportmodel = JSON.parse(localStorageValue);
        if (Enumerable.from().all((x: any) => x.WorkItemId == this.workItemId)) {
            this.timeReportModels = _timereportmodel;
            console.log('loading form localstorage...');
            return true;
        }
        return false;
    }

    getShiftDetails(date: any, timereports: any) {
        var shiftIncludingReportModels = Enumerable.from(this.workItem.WorkShifts).where((x: any) => x.Date == date)
            .select((x: any) => {
                return {
                    workShift: x,
                    workShiftReportModel: Enumerable.from(this.timeReportModels).firstOrDefault((rm: any) => rm.WorkShift.id == x.id)
                }
            }).toArray();
        return shiftIncludingReportModels;
    }
    showReportedDetails(workshiftreportmodel: any) {
        this.selecetedWorkshiftreportmodel = null;
        this.selecetedWorkshiftreportmodel = workshiftreportmodel;
        console.log(this.selecetedWorkshiftreportmodel);
        // open modal
        (<any>$('#workshiftReportedDetails')).modal({
            keyboard: false,
            backdrop: 'static'
        });
    }
    editTimeReport(reportModel: any) {
        console.log(this.timeReportModels);
        console.log(this.returnUrl);
        localStorage.setItem('reportable_work_shifts', JSON.stringify(this.timeReportModels));
        var returnurl = 'reportshifts?id=' + this.workItem.WorkItemId;
        if(this.returnUrl)
            returnurl = returnurl + '&returnUrl=' + this.returnUrl;

        this.router.navigateToRoute('edittimereport', { id: reportModel.workShift.id, returnUrl: returnurl});
    }
    async reportShift(reportModel: TimeReport) {
        if (reportModel.TimeReportLines.length > 0) {
            //let _reportedmodel: any = await this.timeReportService.confirm(reportModel);
            reportModel = await this.timeReportService.confirm(reportModel);
            
            //_reportedmodel.WorkShift.IsTimeReported = true;
            reportModel.WorkShift.IsTimeReported = true;


            localStorage.removeItem('reportable_work_shifts');
            if (this.returnUrl) this.router.navigateToRoute('index');
            else this.router.navigateToRoute('index');
        }
    }
    async reportShifts() {
        if (confirm("Är du säker att du vill markera alla pass som rapporterade? ")) {
            var count = 0;
            this.timeReportModels.forEach(async (item: any) => {
                count++;
                if (!item.WorkShift.IsTimeReported && item.TimeReportLines.length > 0) {
                    item = await this.timeReportService.confirm(item);
                }
                if (this.timeReportModels.length == count) {
                    this.router.navigateToRoute('index');
                }
            });
        }
    }

    cancel() {
        //console.log(this.router);
        //console.log(this.returnUrl);
        if (this.returnUrl) {
            this.router.navigate(this.returnUrl);
        } else {
            this.router.navigate('index');
        }
    }


}

