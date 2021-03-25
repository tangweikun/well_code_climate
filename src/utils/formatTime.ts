import moment from 'moment';

type TType = 'BEGIN' | 'END' | 'NORMAL' | 'DATE' | 'MONTH' | 'YYYYMMDD';

export function formatTime(date: any, type: TType) {
  if (!date) return null;
  if (type === 'BEGIN') return moment(date).format('YYYY-MM-DD 00:00:00');
  if (type === 'END') return moment(date).format('YYYY-MM-DD 23:59:59');
  if (type === 'NORMAL') return moment(date).format('YYYY-MM-DD HH:mm:ss');
  if (type === 'DATE') return moment(date).format('YYYY-MM-DD');
  if (type === 'MONTH') return moment(date).format('YYYY-MM');
  if (type === 'YYYYMMDD') return moment(date).format('YYYYMMDD');
}
