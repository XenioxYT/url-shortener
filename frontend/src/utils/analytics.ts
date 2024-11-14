import { ClickEvent } from '../types';
import { format, startOfMinute, startOfHour, startOfDay, startOfWeek } from 'date-fns';

export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export const timeUnitFormats = {
  minutes: 'HH:mm',
  hours: 'HH:00',
  days: 'MMM dd',
  weeks: 'MMM dd',
};

export const aggregateClicksByTime = (clicks: ClickEvent[], unit: TimeUnit) => {
  const grouped = new Map<number, number>();
  
  clicks.forEach(click => {
    let time: Date;
    const clickDate = new Date(click.timestamp);
    
    switch (unit) {
      case 'minutes':
        time = startOfMinute(clickDate);
        break;
      case 'hours':
        time = startOfHour(clickDate);
        break;
      case 'days':
        time = startOfDay(clickDate);
        break;
      case 'weeks':
        time = startOfWeek(clickDate);
        break;
    }
    
    const timestamp = time.getTime();
    grouped.set(timestamp, (grouped.get(timestamp) || 0) + 1);
  });

  return Array.from(grouped.entries())
    .map(([time, clicks]) => ({ time, clicks }))
    .sort((a, b) => a.time - b.time);
};
