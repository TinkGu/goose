import dayjs from 'dayjs';

export function isInHours(dt1: number, dt2: number, hours: number) {
  return Math.abs(dayjs(dt1).diff(dayjs(dt2))) < hours * 60 * 60 * 1000;
}

export function dateCodeToDate(dateCode: string) {
  if (dateCode.length == 4) {
    var now = dayjs();
    var year = now.year();
    var month = now.month() + 1;
    // 如果当前月份小于截止月份，则年份加1
    if (month < parseInt(dateCode.slice(0, 2))) {
      year++;
    }
    return dayjs(`${year}${dateCode} 23:59:59`).valueOf();
  } else if (dateCode.length == 6) {
    return dayjs(`20${dateCode} 23:59:59`).valueOf();
  }
  return 0;
}

export function checkDateCode(dateCode: string) {
  if (dateCode.length !== 4 && dateCode.length !== 6) {
    return '时间仅支持 4 位或 6 位数字';
  }

  var mmdd = dateCode;
  if (dateCode.length == 6) {
    mmdd = dateCode.slice(2);
  }

  var month = parseInt(mmdd.slice(0, 2));
  if (month < 1 || month > 12) {
    return '月份不能小于 1 或大于 12';
  }
  var day = parseInt(mmdd.slice(2, 4));
  if (day < 1 || day > 31) {
    return '日期不能小于 1 或大于 31';
  }
  return '';
}
