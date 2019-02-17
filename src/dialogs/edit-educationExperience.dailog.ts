import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject
export class EditEducationExperience {
    model: any;

    constructor(public controller: DialogController) {
        controller.settings.centerHorizontalOnly = true;

    }
    async activate(objectModel: any) {
        this.model = objectModel;
    }


}
