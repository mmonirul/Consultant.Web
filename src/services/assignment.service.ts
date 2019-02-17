import {
    IWorkItemClient, IWorkShiftClient,
    WorkItemClient, WorkItem, WorkItemDetailsModel, WorkShiftClient, WorkShift, SearchWorkItemsModel, WorkShiftSearchModel, WorkItemCandidate

} from 'apiclient/coreapiclient-generated';
import { AuthUser } from 'utils/auth-user';
import { Constants } from 'utils/constants';
import axios from 'axios';

export {
    IWorkItemClient, WorkItemClient, WorkItem, WorkItemDetailsModel, SearchWorkItemsModel, WorkItemTimeGroup, TimeEntry, WorkShift, WorkShiftSearchModel, WorkShiftCandidate, WorkItemCandidate
} from 'apiclient/coreapiclient-generated';

export class AssignmentService {

    private workitemClient: IWorkItemClient;
    private workShiftClient: IWorkShiftClient;

    constructor() {
        this.workitemClient = new WorkItemClient(Constants.apiCoreBaseUrl);
        this.workShiftClient = new WorkShiftClient(Constants.apiCoreBaseUrl);
    }
    async getSearchModel() {
        return await this.workitemClient.getWorkItemsSearchModel();
    }
    async searchWorkItems(searchmodel: SearchWorkItemsModel) {
        return await this.workitemClient.getWorkItems(searchmodel);
    }
    async getDetails(id: number): Promise<WorkItemDetailsModel> {
        return await this.workitemClient.getWorkItemDetails(id);
    }
    async save(workitem: WorkItemDetailsModel): Promise<WorkItemDetailsModel> {
        if (!workitem.WorkItemId) return await this.workitemClient.post(workitem);

        return await this.workitemClient.put(workitem.WorkItemId, workitem);
    }

    async saveWorkItem(model: WorkItemDetailsModel) {
        return await axios.post('https://api.adocka.com/WorkItem/Post', model, { headers: { 'Authorization': `Bearer ${AuthUser.AccessToken}` } });
    }
    async updateWorkItem(model: WorkItemDetailsModel) {
        return await axios.put('https://api.adocka.com/WorkItem/Put?id='+model.WorkItemId, model, { headers: { 'Authorization': `Bearer ${AuthUser.AccessToken}` } });
    }

    async getCandidates(id: number): Promise<WorkItemCandidate[]> {
        return this.workitemClient.getWorkItemCandidates(id);
    }
    async apply(model: WorkItemCandidate): Promise<WorkItemCandidate> {
        return this.workitemClient.postWorkItemCandidate(model);
    }

    async searchWorkShifts(searchmodel: WorkShiftSearchModel): Promise<WorkShift[]> {
        return await this.workShiftClient.search(searchmodel);
    }
    async shiftDetails(id: string): Promise<WorkShift> {
        return await this.workShiftClient.get(id);
    }
    async updateWorkShift(id: string, model: WorkShift): Promise<WorkShift> {
        return await this.workShiftClient.put(id, model);
    }

}
