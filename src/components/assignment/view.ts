import { bindable } from 'aurelia-framework';
import * as Enumerable from 'linq';

export class AssignmentView {
    
    @bindable workitem: any;

    constructor() {
    }
    async created() {
    }
    bind() {
    }
    attached() {
    }
    sortByDay(workshifts: any[]) {
        return Enumerable.from(workshifts).orderBy((x: any) => x.Date).toArray();
    }

}
