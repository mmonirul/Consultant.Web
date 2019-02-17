import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Apptest {
    ea: any;
    heading: string;
    title: string = "Hello World!";

    constructor(eventAggregator) {
        this.heading = 'Testing Aurelia With Jest';
        this.ea = eventAggregator;
    }
    fireEvent() {
        this.ea.publish('event-fired');
    }
}