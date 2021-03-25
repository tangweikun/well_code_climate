import moment from 'moment';

export function minuteDiff(date1: any, date2: any) {
  const hour1 = moment(date1).hours();
  const hour2 = moment(date2).hours();
  const minutes1 = moment(date1).minutes();
  const minutes2 = moment(date2).minutes();

  return hour1 * 60 + minutes1 - hour2 * 60 - minutes2;
}
