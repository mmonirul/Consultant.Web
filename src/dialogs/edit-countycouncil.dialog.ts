import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { CountyCouncil, AreaOfExpertise, AccountService, PersonDetails, KnowledgeOfSystemOption } from 'services/account.service';
import * as Enumerable from 'linq';

@autoinject
export class EditCountyCouncil {
    model: PersonDetails;
    countyCounclis: CountyCouncil[];
    selectedCountyCouncils: CountyCouncil[];
    knowledgeOfSystemOptions: KnowledgeOfSystemOption[];

    constructor(public controller: DialogController, private accountService: AccountService) {
        controller.settings.centerHorizontalOnly = true;

    }
    async activate(objectModel: any) {
        this.model = objectModel;
        this.countyCounclis = await this.accountService.getCountyCouncils();
        this.selectedCountyCouncils = this.getSelectedCountyCouncils(this.model, this.countyCounclis);
        this.knowledgeOfSystemOptions = await this.accountService.getKnowledgeOfSystemOptions();
        console.log(this.knowledgeOfSystemOptions);
    }
    private getSelectedCountyCouncils(person: PersonDetails, countyCounclis: CountyCouncil[]): any {
        var selected: CountyCouncil[] = [];
        if (person.PreferedCountyCouncilNames && person.PreferedCountyCouncilNames.length > 0) {
            for (var i = 0; i < person.PreferedCountyCouncilNames.length; i++) {
                let countyCouncil = Enumerable.from(countyCounclis).firstOrDefault(x => x.Name == person.PreferedCountyCouncilNames[i]);
                if (countyCouncil != null) selected.push(countyCouncil);
            }
        }
        return selected;
    }

    save() {
        let names = this.selectedCountyCouncils.map(x => x.Name);
        this.model.PreferedCountyCouncilNames = names;
        this.controller.ok(this.model);
    }

}
