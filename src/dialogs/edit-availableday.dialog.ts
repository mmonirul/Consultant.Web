import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import * as moment from 'moment';

@autoinject
export class EditAvailableDay {

    model: any;
    title: any;
    dateEntered: string = moment().format("YYYY-MM-DD");

    constructor(public controller: DialogController) {
        controller.settings.centerHorizontalOnly = true;
    }
    async activate(objectModel: any) {
        this.model = JSON.parse(JSON.stringify(objectModel.model));
        this.title = objectModel.title;
    }
}
