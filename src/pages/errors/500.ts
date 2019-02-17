import { PLATFORM, autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";

@autoinject
export class Status500 {

    constructor(private router: Router) {
       
    }
    async activate(params: any) {
        console.log('Status500');   
    }

}
