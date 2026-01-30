const weekdayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function nextWeekday(base: Date, target: number) {
  const result = new Date(base);
  const diff = (target + 7 - base.getDay()) % 7 || 7;
  result.setDate(base.getDate() + diff);
  return result;
}

function parseTime(text: string) {
  const timeMatch = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!timeMatch) {
    return null;
  }
  let hours = Number(timeMatch[1]);
  const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0;
  const meridian = timeMatch[3]?.toLowerCase();
  if (meridian === "pm" && hours < 12) {
    hours += 12;
  }
  if (meridian === "am" && hours === 12) {
    hours = 0;
  }
  return { hours, minutes };
}

export function parseReminder(text: string) {
  const normalized = text.toLowerCase();
  if (!normalized.includes("remind me")) {
    return null;
  }

  const now = new Date();
  let due = new Date(now);

  const inMatch = normalized.match(/in\s+(\d+)\s+(minute|minutes|hour|hours|day|days)/);
  if (inMatch) {
    const value = Number(inMatch[1]);
    const unit = inMatch[2];
    if (unit.startsWith("minute")) {
      due.setMinutes(due.getMinutes() + value);
    } else if (unit.startsWith("hour")) {
      due.setHours(due.getHours() + value);
    } else {
      due.setDate(due.getDate() + value);
    }
    return due;
  }

  if (normalized.includes("tomorrow")) {
    due.setDate(due.getDate() + 1);
  } else if (normalized.includes("today")) {
    // keep today
  } else {
    const weekdayMatch = Object.keys(weekdayMap).find((day) => normalized.includes(day));
    if (weekdayMatch) {
      due = nextWeekday(due, weekdayMap[weekdayMatch]);
    }
  }

  const time = parseTime(normalized);
  if (time) {
    due.setHours(time.hours, time.minutes, 0, 0);
  } else {
    due.setHours(9, 0, 0, 0);
  }

  return due;
}
