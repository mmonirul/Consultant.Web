import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { CountyCouncil, AreaOfExpertise, AccountService, PersonDetails } from 'services/account.service';
import * as Enumerable from 'linq';

@autoinject
export class EditAreaOfExpertise {
    model: PersonDetails;
    areaOfExpertises: AreaOfExpertise[];
    selectedAreaOfExpertises: AreaOfExpertise[];

    constructor(public controller: DialogController, private accountService: AccountService) {
        controller.settings.centerHorizontalOnly = true;
    }
    async activate(objectModel: any) {
        this.model = objectModel;
        this.areaOfExpertises = await this.accountService.getAreaOfExpertises();
        this.selectedAreaOfExpertises = this.getSelectedCountyCouncils(this.model, this.areaOfExpertises);
    }
    private getSelectedCountyCouncils(person: PersonDetails, areaOfExpertises: AreaOfExpertise[]): any {
        var selected: CountyCouncil[] = [];
        if (person.AllAreaOfExpertises && person.AllAreaOfExpertises.length > 0) {
            for (var i = 0; i < person.AllAreaOfExpertises.length; i++) {
                let areaOfExpertise = Enumerable.from(areaOfExpertises).firstOrDefault(x => x.Name == person.AllAreaOfExpertises[i]);
                if (areaOfExpertise != null) selected.push(areaOfExpertise);
            }
        }
        return selected;
    }

    save() {
        let names = this.selectedAreaOfExpertises.map(x => x.Name);
        this.model.AllAreaOfExpertises = names;
        this.controller.ok(this.model);
    }

}
