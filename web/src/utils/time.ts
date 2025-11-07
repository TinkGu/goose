import dayjs, { Dayjs } from 'dayjs';

export function isInHours(dt1: number, dt2: number, hours: number) {
  return Math.abs(dayjs(dt1).diff(dayjs(dt2))) < hours * 60 * 60 * 1000;
}

export function dateCodeToDate(dateCode: string) {
  if (dateCode.length == 4) {
    const now = dayjs();
    let year = now.year();
    let month = now.month() + 1;
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

  let mmdd = dateCode;
  if (dateCode.length == 6) {
    mmdd = dateCode.slice(2);
  }

  const month = parseInt(mmdd.slice(0, 2));
  if (month < 1 || month > 12) {
    return '月份不能小于 1 或大于 12';
  }
  const day = parseInt(mmdd.slice(2, 4));
  if (day < 1 || day > 31) {
    return '日期不能小于 1 或大于 31';
  }
  return '';
}

// 计算当前是第几月的第几周
export function getMonthWeek(date?: Dayjs) {
  if (!date) {
    date = dayjs();
  }
  let month = date.month() + 1;
  let year = date.year();
  const oneDay = dayjs(`${year}-${month}-01`); // 当月第一天
  const oneDayOfWeek = oneDay.day();

  // 找到当月第一个周一是几号
  // 如果1号不是周一，需要找到第一个周一
  let firstMonday;
  if (oneDayOfWeek === 1) {
    // 1号就是周一
    firstMonday = 1;
  } else if (oneDayOfWeek === 0) {
    // 1号是周日，第一个周一是2号
    firstMonday = 2;
  } else {
    // 1号是周二到周六，计算到下一个周一的天数
    firstMonday = 1 + (8 - oneDayOfWeek);
  }

  const currentDay = date.date(); // 当前是几号
  // 如果当前日期在第一个周一之前，算作上个月
  if (currentDay < firstMonday) {
    let lastMonth = month - 1;
    if (lastMonth === 0) {
      lastMonth = 12;
    }
    return {
      month: lastMonth,
      week: 4,
    };
  }

  // 计算是第几周（从第一个周一开始算第1周）
  const week = Math.floor((currentDay - firstMonday) / 7) + 1;
  return {
    month,
    week,
  };
}
