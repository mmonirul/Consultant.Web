import { autoinject } from "aurelia-framework";
import { Router } from 'aurelia-router';
import * as moment from 'moment';
import * as Enumerable from 'linq';
import axios from 'axios';
import { AuthUser } from 'utils/auth-user';
import { EditTimeGroup } from '../../dialogs/edit-timegroup.dialog';
import { AssignmentService, WorkItemDetailsModel, WorkItemTimeGroup, TimeEntry } from 'services/assignment.service';
import { TimeReportService, ITimeReport } from 'services/timereport.service';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { TupleOfIEnumerableOfSendMessageForTermsAcceptanceAndString } from "apiclient/coreapiclient-generated";
import { AsyncSeriesWaterfallHook } from "tapable";

@autoinject
export class ReportWorkItem {

    private returnUrl: string;
    private workItemId: number;

    workItem: WorkItemDetailsModel;
    timeEntries: TimeEntry[];
    weekDays: string[];
    weekends: string[];
    isSaving: boolean = false;

    constructor(private dialogService: DialogService, private assignmentService: AssignmentService, private router: Router) {

    }
    async activate(params: any) {

        params.returnUrl ? this.returnUrl = params.returnUrl : this.returnUrl = '';
        if (params.id) {
            this.workItemId = Number(params.id);
            return await this.loadData();
        }
        else this.router.navigateBack();
    }
    async loadData() {
        try {
            this.workItem = await this.assignmentService.getDetails(this.workItemId);
            console.log('Workitem: ', this.workItem);
            this.timeEntries = Enumerable.from(this.workItem.TimeGroups).selectMany(x => x.TimeEntries).where(x => x.Hours > 0 || x.Minutes > 0 || x.Qty > 0).orderBy(x => x.Description).toArray();
            this.weekDays = Enumerable.from(this.workItem.WeekDatesAsDateStrings).take(5).toArray();
            this.weekends = Enumerable.from(this.workItem.WeekDatesAsDateStrings).skip(5).take(2).toArray();
        } catch (e) {
            console.error(e)
        }
    }

    //getDateString(timeentry: any) {
    //    return moment(timeentry).format("YYYY-MM-DD");
    //}

    getTimeEntries(weekday: string, timeEntries: TimeEntry[]) {
        return Enumerable.from(timeEntries).where(x => moment(x.Date).format('YYYY-MM-DD') == weekday).orderBy(x => x.Description).toArray();
    }

    editTimeEntry(entity: TimeEntry) {
        var timeEntry = JSON.parse(JSON.stringify(entity));
        let _model = {
            dates: this.workItem.WeekDatesAsDateStrings,
            timeGroups: this.workItem.TimeGroups,
            selectedDate: moment(timeEntry.Date).format("YYYY-MM-DD"),
            selectedTimeGroup: Enumerable.from(this.workItem.TimeGroups).firstOrDefault((x: any) => x.WorkItemTimeGroupId == timeEntry.WorkItemTimeGroupId),
            minutes: timeEntry.Minutes,
            hours: timeEntry.Hours,
            qty: timeEntry.Qty
        };

        this.dialogService.open({ viewModel: EditTimeGroup, model: { model: _model, title: "Ändra tid" }, lock: true }).whenClosed(async (response: DialogCloseResult) => {
            if (!response.wasCancelled) {
                entity.Hours = Number(response.output.hours);
                entity.Minutes = Number(response.output.minutes);
                entity.Qty = Number(response.output.qty);
                entity.WorkItemTimeGroupId = response.output.selectedTimeGroup.WorkItemTimeGroupId;

                this.isSaving = true;
                await this.assignmentService.save(this.workItem);
                this.isSaving = false;
                this.workItem = await this.assignmentService.getDetails(this.workItemId);
                this.timeEntries = Enumerable.from(this.workItem.TimeGroups).selectMany(x => x.TimeEntries).orderBy(x => x.Description).toArray();
            } else {
                console.log('bad');
            }
        });
    }

    async deleteTimeEntry(timeentry: TimeEntry) {
        if (!confirm("Är du säker att du vill ta bort? ")) return;
        var timegroup = Enumerable.from(this.workItem.TimeGroups).firstOrDefault(x => x.WorkItemTimeGroupId == timeentry.WorkItemTimeGroupId);
        if (timegroup) {
            timegroup.TimeEntries = Enumerable.from(timegroup.TimeEntries).where(x => x.TimeEntryId !== timeentry.TimeEntryId).orderBy(x => x.Description).toArray();
            this.isSaving = true;
            this.workItem = await this.assignmentService.save(this.workItem);
            this.isSaving = false;
            this.timeEntries = Enumerable.from(this.workItem.TimeGroups).selectMany(x => x.TimeEntries).orderBy(x => x.Description).toArray();
        }
    }

    addNewTimeEntry(day: any): void {
        let _model = {
            dates: this.workItem.WeekDatesAsDateStrings,
            timeGroups: this.workItem.TimeGroups,
            selectedDate: day,
            selectedTimeGroup: this.workItem.TimeGroups.length > 0 ? this.workItem.TimeGroups[0] : null,
            minutes: 0,
            hours: 0,
            qty: 0
        };
        this.dialogService.open({ viewModel: EditTimeGroup, model: { model: _model, title: "Lägg till tid" }, lock: true }).whenClosed((response: any) => {
            if (!response.wasCancelled) this.addEnityToTimeGroup(_model);
            else console.log('bad');
        });
    }
    private async addEnityToTimeGroup(model: any) {
        console.log('date: ', model.selectedDate);
        var timeEntry: TimeEntry = new TimeEntry({
            Date: new Date(model.selectedDate),
            Description: model.selectedTimeGroup.Name,
            Hours: Number(model.hours),
            Minutes: Number(model.minutes),
            Qty: Number(model.qty),
            Uom: model.selectedTimeGroup.Uom,
            WorkItemId: this.workItem.WorkItemId,
            WorkItemTimeGroupId: model.selectedTimeGroup.WorkItemTimeGroupId,
        });
        timeEntry.init(timeEntry);
        var timeGroup = model.selectedTimeGroup;
        timeGroup.TimeEntries.push(timeEntry);
        this.timeEntries = Enumerable.from(this.workItem.TimeGroups).selectMany(x => x.TimeEntries).orderBy(x => x.Description).toArray();
        this.isSaving = true;
        this.workItem = await this.assignmentService.save(this.workItem);
        this.isSaving = false;
        this.timeEntries = Enumerable.from(this.workItem.TimeGroups).selectMany(x => x.TimeEntries).orderBy(x => x.Description).toArray();
    }

    async reportWorkItem() {
        if (confirm("Are you sure? ")) {
            this.workItem.IsTimeReported = true;
            await this.assignmentService.saveWorkItem(this.workItem);
            this.loadData();
        }
    }
    cancel() {
        if (this.returnUrl) {
            this.router.navigate(this.returnUrl);
        } else {
            this.router.navigate('index');
        }
    }


}

