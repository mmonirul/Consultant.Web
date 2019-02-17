import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import * as Enumerable from 'linq';

@autoinject
export class EditTimeLog {
    model: any = {
        ManualTimeGroups: [],
        AutoCalculatingTimeGroups: [],
        FromDefaultPriceProfileTimeGroupId: null,
        FromTime: '',
        ToTime: '',
        Description: ''
    };
    title: any;
    selecetedTimeGroup: any = {
        DefaultPriceProfileTimeGroupId: null,
        Name: "",
        SortOrder: null,
        Uom: ""
    };
    constructor(public controller: DialogController) {
        controller.settings.centerHorizontalOnly = true;
    }
    async activate(objectModel: any) {
        this.model = objectModel.model;
        if (this.model.FromDefaultPriceProfileTimeGroupId) {
            this.selecetedTimeGroup = Enumerable.from(this.model.ManualTimeGroups).firstOrDefault((x: any) => x.DefaultPriceProfileTimeGroupId == this.model.FromDefaultPriceProfileTimeGroupId);
        }
        this.title = objectModel.title;
    }
    ok() {
        if (this.selecetedTimeGroup && this.selecetedTimeGroup.DefaultPriceProfileTimeGroupId) {
            this.model.FromDefaultPriceProfileTimeGroupId = this.selecetedTimeGroup.DefaultPriceProfileTimeGroupId
        } else {
            this.model.FromDefaultPriceProfileTimeGroupId = null;
        }
        this.controller.ok(this.model);
    }
}
