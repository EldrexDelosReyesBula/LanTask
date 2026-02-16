
export const parseNaturalLanguageDate = (input: string): Date | null => {
  if (!input) return null;
  const now = new Date();
  const lower = input.toLowerCase().trim()
    .replace(/(\d+)(st|nd|rd|th)/g, '$1') // Remove ordinal suffixes (1st -> 1)
    .replace(/[,;]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize spaces

  let target = new Date();
  let dateSet = false;
  let timeSet = false;

  // Helper to add days
  const addDays = (d: Date, n: number) => { d.setDate(d.getDate() + n); return d; };

  // --- 1. Relative Day Keywords ---
  if (lower.includes('today')) { dateSet = true; }
  else if (lower.includes('tomorrow') || lower.includes('tmrw') || lower.includes('tmr')) { addDays(target, 1); dateSet = true; }
  else if (lower.includes('yesterday')) { addDays(target, -1); dateSet = true; }
  else if (lower.includes('day after tomorrow')) { addDays(target, 2); dateSet = true; }
  
  // --- 2. Relative "In X" / "X ago" ---
  const relDayMatch = lower.match(/(?:in|after)\s+(\d+)\s+days?/);
  if (relDayMatch) { addDays(target, parseInt(relDayMatch[1])); dateSet = true; }
  
  const relWeekMatch = lower.match(/(?:in|after)\s+(\d+)\s+weeks?/);
  if (relWeekMatch) { addDays(target, parseInt(relWeekMatch[1]) * 7); dateSet = true; }

  const relMonthMatch = lower.match(/(?:in|after)\s+(\d+)\s+months?/);
  if (relMonthMatch) { target.setMonth(target.getMonth() + parseInt(relMonthMatch[1])); dateSet = true; }

  // --- 3. Weekdays (monday, next friday, etc.) ---
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  // Regex to catch "next friday", "this monday", "friday"
  const dayRegex = new RegExp(`(next|this|last|coming)?\\s*(${days.join('|')})[a-z]*`, 'g');
  let dayMatch;
  
  // We loop to find the last valid day mention if multiple exist, or just the first
  while ((dayMatch = dayRegex.exec(lower)) !== null && !dateSet) {
      const mod = dayMatch[1] || 'this';
      const dayStr = dayMatch[2].substring(0, 3); // sun, mon
      const targetDay = days.indexOf(dayStr);
      const currentDay = now.getDay();
      
      let diff = targetDay - currentDay;
      
      if (mod === 'this' || mod === 'coming') {
          // "This Friday" logic:
          // If today is Friday, "This Friday" usually means today.
          // If today is Monday (1) and we say "This Friday" (5), diff is 4.
          // If today is Friday (5) and we say "This Monday" (1), diff is -4. 
          // For tasks, we usually mean the upcoming one.
          if (diff < 0) diff += 7;
      } else if (mod === 'next') {
          // "Next Friday" usually implies skipping the upcoming one and going to the next week's
          if (diff < 0) diff += 7;
          diff += 7;
      } else if (mod === 'last') {
          if (diff > 0) diff -= 7;
          diff -= 7;
      }
      addDays(target, diff);
      dateSet = true;
  }

  // --- 4. Absolute Dates (March 5, 5 March, 12/25) ---
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  // Match "March 5" or "5 March"
  const dateStrMatch = lower.match(/([a-z]{3})[a-z]*\s+(\d{1,2})/) || lower.match(/(\d{1,2})\s+([a-z]{3})[a-z]*/);
  
  if (dateStrMatch && !dateSet) {
      const p1 = dateStrMatch[1];
      const p2 = dateStrMatch[2];
      let mStr, dStr;
      
      // Determine which part is month vs day
      if (isNaN(parseInt(p1))) { mStr = p1; dStr = p2; }
      else { dStr = p1; mStr = p2; }
      
      const mIndex = months.indexOf(mStr.substring(0, 3));
      if (mIndex > -1) {
          target.setMonth(mIndex);
          target.setDate(parseInt(dStr));
          
          // If date has passed this year (e.g. "Jan 1" said in "Feb"), assume next year
          // Unless "last" was used in context (simplified here)
          if (target < now && !lower.includes('last')) {
             target.setFullYear(now.getFullYear() + 1);
          }
          dateSet = true;
      }
  }

  // --- 5. Time Parsing ---
  // Default to 9am if date is set but no time specified
  if (dateSet) target.setHours(9, 0, 0, 0);

  // Look for specific time patterns
  // 1. "at 5", "at 5pm"
  // 2. "5:00", "17:00"
  // 3. "5pm", "5a"
  
  // We avoid matching years like "2024" as time "20:24" by requiring colon or am/pm or "at" context
  const timeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?/);
  const strictTimeMatch = lower.match(/(\d{1,2}):(\d{2})/); // 5:00
  const ampmMatch = lower.match(/(\d{1,2})\s*(am|pm|a|p)/); // 5pm
  const atMatch = lower.match(/at\s+(\d{1,2})/); // at 5

  if (timeMatch && (strictTimeMatch || ampmMatch || atMatch)) {
      let h = parseInt(timeMatch[1]);
      let m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[0].match(/am|pm|a|p/);
      
      if (meridiem) {
          const isPm = meridiem[0].startsWith('p');
          if (isPm && h < 12) h += 12;
          if (!isPm && h === 12) h = 0;
      } else {
          // Heuristic for "at 5": 
          // If < 8, assume PM (13-19) for tasks (e.g. "at 2" -> 2pm)
          // If 8-11, assume AM. 12 -> 12pm.
          if (h < 8) h += 12;
      }
      
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
          target.setHours(h, m, 0, 0);
          timeSet = true;
      }
  }

  // Named times
  if (lower.includes('morning')) { target.setHours(9, 0, 0, 0); timeSet = true; }
  if (lower.includes('noon') || lower.includes('midday')) { target.setHours(12, 0, 0, 0); timeSet = true; }
  if (lower.includes('afternoon')) { target.setHours(14, 0, 0, 0); timeSet = true; }
  if (lower.includes('evening')) { target.setHours(18, 0, 0, 0); timeSet = true; }
  if (lower.includes('night') || lower.includes('tonight')) { target.setHours(21, 0, 0, 0); timeSet = true; }

  // Fallback: If time was set but date wasn't, assume today (if time is future) or tomorrow
  if (timeSet && !dateSet) {
      if (target < now) {
          addDays(target, 1);
      }
      dateSet = true;
  }

  return dateSet || timeSet ? target : null;
};
