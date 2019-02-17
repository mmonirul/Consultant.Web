import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject
export class EditTimeGroup {
    model: any;
    title: any;

    constructor(public controller: DialogController) {
        controller.settings.centerHorizontalOnly = true;

    }
    async activate(objectModel: any) {
        this.model = objectModel.model;
        this.title = objectModel.title;
    }
}
