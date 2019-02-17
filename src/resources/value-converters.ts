import * as moment from 'moment';

export class RemoveSpaceValueConverter {
    toView(value: string) {
        if (value) {
            try {
                return value.replace(/\s/g, '');
            } catch (error) {
                console.log(`Error in remove-space-value-converter: ${error}`);
            }
        }
    }
}

export class DateFormatValueConverter {
    constructor() {
        moment.locale('sv');
    }
    toView(value: any, format: any) {
        return moment(value).format(format);
    }
}

export class TruncateValueConverter {
    toView(value: string, length = 10) {
        if (value) {
            return value.length > length ? value.substring(0, length) + '...' : value;
        }
        return '';
    }
}
export class TranslateValueConverter {
    toView(value: any) {
        if (value === 'availability')
            return 'Tillgänglighet';
        else
            return value;
    }
}