import { autoinject, bindable, View } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { DialogService, DialogOpenPromise, DialogOpenResult, DialogCloseResult } from 'aurelia-dialog';
import { AccountService, PersonDetails, Education, Experience, CountyCouncil, AreaOfExpertise } from 'services/account.service'
import { EditCountyCouncil } from 'dialogs/edit-countycouncil.dialog';
import { EditAreaOfExpertise } from 'dialogs/edit-areaofexpertises.dialog';
import { AuthUser } from 'utils/auth-user';
import { EditEducationExperience } from 'dialogs/edit-educationExperience.dailog';

@autoinject
export class KnowledgeAndPreferences {

    person: PersonDetails;
    knowledgeOfMedicalRecords: any = [];
    educations: Education[] = [];
    experiences: Experience[] = [];
    isSaving: boolean = false;
    showSuccessAlert: boolean = false;


    constructor(private dialogService: DialogService, private router: Router, private accountService: AccountService) {
    }
    async activate(params: any) {
        this.person = await this.accountService.getDetails(Number(AuthUser.UserId));
        if (this.person.PersonId) {
            this.experiences = await this.accountService.getExperience(this.person.PersonId);
            this.educations = await this.accountService.getEducations(this.person.PersonId);
        }
    }

    editCountyCouncil() {
        this.dialogService.open({ viewModel: EditCountyCouncil, model: this.person, lock: false })
            .then((openDialogResult: any) => {
                return openDialogResult.closeResult;
            }).then((response) => {
                if (!response.wasCancelled) {
                    this.person = response.output;
                } else {
                    console.log('bad');
                }
            });
    }
    editAreaOfExpertise() {
        this.dialogService.open({ viewModel: EditAreaOfExpertise, model: this.person, lock: false })
            .then((openDialogResult: any) => {
                return openDialogResult.closeResult;
            }).then((response) => {
                if (!response.wasCancelled) {
                    this.person = response.output;
                } else {
                    console.log('bad');
                }
            });
    }

    async addExperience() {
        let experience = new Experience({
            Where: '',
            Name: '',
            Description: '',
            From: '',
            To: '',
            PersonId: this.person.PersonId
        });
        var result = await this.getModel('Lägg till erfarenhet', 'experience', experience);
        if (!result.wasCancelled) {
            if (result.output.item.PersonId) {
                experience = await this.accountService.saveExperience(result.output.item);
                this.experiences.push(experience);
            }
        }
    }
    async deleteExperience(experience: Experience) {
        if (experience.ExperienceId) {
            try {
                await this.accountService.deleteExperience(experience);
                this.experiences = this.experiences.filter((item: any) => item.ExperienceId != experience.ExperienceId);
            } catch (error) {
                console.log(error);
            }
        }
    }

    async addEducation() {
        let education = new Education({
            Where: '',
            Name: '',
            Description: '',
            From: '',
            To: '',
            PersonId: this.person.PersonId
        });
        var result = await this.getModel('Lägg till utbildning', 'education', education);
        if (!result.wasCancelled) {
            if (result.output.item.PersonId) {
                let education = new Education(result.output.item)
                education = await this.accountService.saveEducation(education);
                this.educations.push(education);
            }
        }
    }
    async deleteEducation(education: any) {
        if (education.EducationId) {
            try {
                await this.accountService.deleteEducation(education);
                this.educations = this.educations.filter((item: any) => item.EducationId != education.EducationId);
            } catch (error) {
                console.log(error);
            }
        }
    }

    private getModel(heading: string, modelType: string = '', model: any): Promise<DialogCloseResult> {
        return this.dialogService.open({
            viewModel: EditEducationExperience, model: { title: heading, item: model, type: modelType }, lock: false
        }).then((openDialogResult: any) => {
            return openDialogResult.closeResult;
        })
    }
    async save() {
        this.isSaving = true;
        this.person = await this.accountService.update(this.person.PersonId, this.person);
        this.isSaving = false;
        if (this.person.PersonId && !this.isSaving) {
            this.showSuccessAlert = true;
            setTimeout(() => { this.showSuccessAlert = false }, 7000);
        }
    }
}
