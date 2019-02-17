import * as moment from 'moment';
import * as oidcClient from 'oidc-client';
import oidcConfig from "utils/oidc-config";


export class UserUtil {
    static userManager() {
        return new oidcClient.UserManager(oidcConfig.userManagerSettings);
    }
}


export class FileUtil {
    static getBase64(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader: any = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error: any) => reject(error);
        });
    }
}

export class MomentHelpers {
    static getWeeksInMonth(date: string) {
        var start: any = moment(date).startOf('month');
        var end: any = moment(date).endOf('month');
        var firstWeekOfMonth = moment(start).isoWeek();
        const weekCount = moment.duration(end - start).weeks() + 1;
        console.log(firstWeekOfMonth);
        var weeks: number[] = [];
        for (var i = 0; i < weekCount; i++) {
            weeks.push(firstWeekOfMonth + i);
        }
        return weeks;
    }

    static getDaysInWeek(weeknr: number, year: number) {
        let startOfWeek = moment().isoWeek(weeknr).year(year).startOf('isoWeek');
        let endOfWeek = moment().isoWeek(weeknr).year(year).endOf('isoWeek');
        let days = [];
        var day = startOfWeek;
        while (day <= endOfWeek) {
            days.push(day.toDate());
            day = day.clone().add(1, 'd');
        }
        return days;
    }
}
export class DateUtil {
    static isoWeekDays(): Array<any> {
        var days = new Array();
        days[0] = { DayOfWeek: 1, DayOfWeekName: 'Mån' };
        days[1] = { DayOfWeek: 2, DayOfWeekName: 'Tis' };
        days[2] = { DayOfWeek: 3, DayOfWeekName: 'Ons' };
        days[3] = { DayOfWeek: 4, DayOfWeekName: 'Tor' };
        days[4] = { DayOfWeek: 5, DayOfWeekName: 'Fre' };
        days[5] = { DayOfWeek: 6, DayOfWeekName: 'Lör' };
        days[6] = { DayOfWeek: 7, DayOfWeekName: 'Sön' };
        return days;
    }
    static isoWeekDates(year: number, week: number): Array<moment.Moment> {
        var firstdateinfirstweek = moment().isoWeek(week).isoWeekYear(year).isoWeekday(1);
        var weekdates = [];
        for (var i = 0; i < 7; i++) {
            var date = firstdateinfirstweek.clone().add(i, 'days');
            weekdates.push(date);
        }
        return weekdates;
    }

    static YearWeeksModel(year: moment.Moment) {
        return { Year: year.isoWeekYear(), Weeks: this.weeksInYear(year) }
    }

    static weeksInYear(year: moment.Moment): Array<any> {
        var nrweeks = year.isoWeeksInYear();
        var array: Array<any> = [];
        for (var i = 1; i <= nrweeks; i++) {
            array.push({ Year: year.isoWeekYear(), Week: i, isSelected: false });
        }
        return array;
    }

    static GetDate(year: number, isoWeek: number, isoWeekday: number): moment.Moment {
        return moment().year(year).isoWeek(isoWeek).isoWeekday(isoWeekday);
    }
}

