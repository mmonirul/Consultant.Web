import { TimeReportClient, ITimeReportClient, TimeReport, ITimeReport, WorkShiftClient, IWorkShiftClient, WorkShift } from 'apiclient/coreapiclient-generated';
import { AuthUser } from '../utils/auth-user';
import { Constants } from '../utils/constants';
import axios from 'axios';

export { TimeReport, TimeReportClient, ITimeReport, IWorkShift, WorkShift, Timelog, TimeEntry, DateEpoch, TimeReportLine, TimeGroupMini, ITimeReportLine, ITimelog, ITimeEntry } from 'apiclient/coreapiclient-generated';
export class TimeReportService {

    private timeReportClient: ITimeReportClient;
    private workShiftClient: IWorkShiftClient;

    constructor() {
        this.timeReportClient = new TimeReportClient(Constants.apiCoreBaseUrl);
        this.workShiftClient = new WorkShiftClient(Constants.apiCoreBaseUrl);
    }
    async getWorkShift(id: string): Promise<WorkShift> {
        return await this.workShiftClient.get(id);
    }

    async get(id: string): Promise<TimeReport> {
        return await this.timeReportClient.get(id);
    }
    async create(model: WorkShift): Promise<TimeReport> {
        return await this.timeReportClient.createNewFromWorkShift(model);
    }
    async recalculate(model: TimeReport): Promise<TimeReport> {
        //return await this.timeReportClient.recalculate(model);
        var response = await axios.post('https://api.adocka.com/TimeReport/Recalculate', model, { headers: { 'Authorization': `Bearer ${AuthUser.AccessToken}` } });
        return response.data;
    }
    async save(model: TimeReport): Promise<TimeReport> {
        return await this.timeReportClient.post(model);
    }
    async confirm(model: TimeReport) {
        let response = await axios.post('https://api.adocka.com/TimeReport/Post', model, { headers: { 'Authorization': `Bearer ${AuthUser.AccessToken}` } });
        return response.data;
    }
}
