import { bindable } from 'aurelia-framework';
import * as Enumerable from 'linq';
import { WorkItemDetailsModel } from 'services/assignment.service';

export class DetailsView {
    
    @bindable workitem: WorkItemDetailsModel;
    
    constructor() {
    }
    async created() {
    }
    bind() {
        console.log(this.workitem);
    }
    attached() {
    }
}
