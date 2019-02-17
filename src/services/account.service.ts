import {
    AccountClient, Company, PersonClient, Person, PersonDetails, PostFileModel, Experience, KnowledgeOfSystemOptionClient, KnowledgeOfSystemOption,
    FileClient, AvailableForWorkClient, AvailableForWork, AreaOfExpertise, AreaOfExpertiseClient, CountyCouncilClient, CountyCouncil, EducationClient, ExperienceClient,
    IFileClient, IAccountClient, IAvailableForWorkClient, IPersonClient, IAreaOfExpertiseClient, ICountyCouncilClient, IPostFileModel, IEducationClient, IExperienceClient, ICountyCouncil, IKnowledgeOfSystemOptionClient
} from 'apiclient/coreapiclient-generated';

import { AuthUser } from '../utils/auth-user';
import { Constants } from '../utils/constants';
import axios from 'axios';
import { Education } from 'apiclient/_coreapiclient-generated';

export {
    Company, ICompany, Person, PersonDetails, IPerson, IPersonDetails, PostFileModel, AvailableForWork, CountyCouncil, AreaOfExpertise, Education, Experience, KnowledgeOfSystemOption
} from 'apiclient/coreapiclient-generated';

export class AccountService {

    private accountClient: IAccountClient;
    private personClient: IPersonClient;
    private educationClient: IEducationClient;
    private experienceClient: IExperienceClient;
    private countyCouncilClient: ICountyCouncilClient;
    private fileClient: IFileClient;
    private availableForWorkClient: IAvailableForWorkClient;
    private areaOfExpertiseClient: IAreaOfExpertiseClient;
    private knowledgeOfSystemOptionClient: IKnowledgeOfSystemOptionClient;

    constructor() {
        this.accountClient = new AccountClient(Constants.apiCoreBaseUrl);
        this.personClient = new PersonClient(Constants.apiCoreBaseUrl);
        this.educationClient = new EducationClient(Constants.apiCoreBaseUrl);
        this.experienceClient = new ExperienceClient(Constants.apiCoreBaseUrl);
        this.countyCouncilClient = new CountyCouncilClient(Constants.apiCoreBaseUrl);
        this.areaOfExpertiseClient = new AreaOfExpertiseClient(Constants.apiCoreBaseUrl);
        this.knowledgeOfSystemOptionClient = new KnowledgeOfSystemOptionClient(Constants.apiCoreBaseUrl);


        this.fileClient = new FileClient(Constants.apiCoreBaseUrl);
        this.availableForWorkClient = new AvailableForWorkClient(Constants.apiCoreBaseUrl);
    }
    async getCompanyDetails(): Promise<Company> {
        return await this.accountClient.editProfile();
    }
    async getDetails(id: number): Promise<PersonDetails> {
        return await this.personClient.getDetails(id);
    }
    async update(id: number, model: PersonDetails): Promise<PersonDetails> {
        return await this.personClient.put(id, model);
    }
    async upload(model: PostFileModel) {
        return await this.fileClient.post(model);
    }
    async getCountyCouncils(): Promise<CountyCouncil[]> {
        return await this.countyCouncilClient.getAll();
    }
    async getAreaOfExpertises(): Promise<AreaOfExpertise[]> {
        return await this.areaOfExpertiseClient.getAll();
    }
    async getEducations(personid: number): Promise<Education[]> {
        return await this.educationClient.get(personid);
    }
    async saveEducation(model: Education): Promise<Education> {
        if (model.EducationId)
            return await this.educationClient.put(model.EducationId, model);
        return await this.educationClient.post(model);
    }
    async deleteEducation(model: Education): Promise<void> {
        if(model.EducationId)
            return await this.educationClient.delete(model.EducationId);
    }

    async getExperience(personid: number): Promise<Experience[]> {
        return await this.experienceClient.get(personid)
    }
    async saveExperience(model: Experience): Promise<Experience> {
        if (model.ExperienceId)
            return await this.experienceClient.put(model.ExperienceId, model);
        return await this.experienceClient.post(model);
    }
    async deleteExperience(model: Experience): Promise<void> {
        if (model.ExperienceId)
            return await this.experienceClient.delete(model.ExperienceId);
    }


    async getKnowledgeOfSystemOptions(): Promise<KnowledgeOfSystemOption[]> {
        return await this.knowledgeOfSystemOptionClient.getAll();
    }



    async getAvailableDays(id: string): Promise<AvailableForWork[]> {
        return await this.availableForWorkClient.getAllAvailableDays(id);
    }
    //async updateAvailableDays(id: string, model: AvailableForWork[]): Promise<AvailableForWork[]> {
    //    return await this.availableForWorkClient.putAllAvailableDays(id, model);
    //}
    async updateAvailableDays(id: string, model: AvailableForWork[]) {
        return await axios.put('https://api.adocka.com/AvailableForWork/PutAllAvailableDays?personid='+id, model, { headers: { 'Authorization': `Bearer ${AuthUser.AccessToken}` } });
    }
}
