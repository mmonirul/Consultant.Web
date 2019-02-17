import * as generated from "./coreapiclient-generated";
export class CoreApiBaseClient {
    
    protected transformOptions(options: any) {
        //if (shared.AuthUser.IdentityAccessTooken)
        //{
        //    options.beforeSend = (xhr) => {
        //        xhr.setRequestHeader('Authorization', 'Bearer ' + shared.AuthUser.IdentityAccessTooken);
        //    };
        //} else
        //    window.location.href = '/';
        return options;
    }

    protected transformResult(url: string, response: any, processor: (response: any) => any) {
        // TODO: Return own result or throw exception to change default processing behavior, 
        // or call processor function to run the default processing logic

        console.log("Service call....: " + url);
        return processor(response);
    }
}
export class CoreApiConfig {
    
}
