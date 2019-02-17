import { PLATFORM, autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { FileUtil } from 'utils/helpers';
import { AuthUser } from 'utils/auth-user'
import { Constants } from 'utils/constants'
import { AccountService, PersonDetails, IPersonDetails, PostFileModel } from 'services/account.service'


@autoinject
export class EditPersonDetails {

    person: PersonDetails = new PersonDetails();

    fileName: any;
    file: any;
    isSaving: boolean = false;
    showSuccessAlert: boolean = false;

    constructor(private router: Router, private accountService: AccountService) {

    }

    async activate(params: any) {
        this.person = await this.accountService.getDetails(Number(AuthUser.UserId));
    }

    get imageUrl(): string {
        return this.person.ImageUrl ? this.person.ImageUrl : Constants.defaultPersonAvatar;
    }

    fileSelected(event: any) {
        if (event.target.files.length > 0) {
            this.uploadFiles(event.target.files);
        }
    }
    allowDrop(ev: DragEvent) {
        ev.preventDefault();
    }
    drop(event: DragEvent) {
        event.preventDefault();

        let files = event.dataTransfer.files;
        if (files.length > 0) {
            this.uploadFiles(files);
        }
    }
    async uploadFiles(files: FileList) {
        for (var i = 0; i < files.length; i++) {
            var imageType = /image.*/;
            if (files[i].type.match(imageType)) {
                var base64str = await FileUtil.getBase64(files[i]);
                var postfilemodel: PostFileModel = new PostFileModel({
                    Directory: 'profilepic_' + this.person.PersonId,
                    FileName: files[i].name,
                    DataUriString: base64str.toString(),
                    PublicAccess: true
                });
                var result: any = await this.accountService.upload(postfilemodel);
                this.person.ImageUrl = result.Url;
            } else {
                alert('You must select image!');
            }
        }
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
