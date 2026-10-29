import { Itinerary, Activity, DayPlan } from '../types.ts';

// Format currency
export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  return `${currencySymbol}${amount.toLocaleString()}`;
}

// Download .ics calendar file for the itinerary
export function exportToICS(itinerary: Itinerary): void {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TravelMate AI//Trip Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  itinerary.days.forEach((day: DayPlan) => {
    day.activities.forEach((activity: Activity) => {
      const cleanDate = day.date.replace(/-/g, '');
      // Format start time if available
      let startTimeStr = '090000';
      if (activity.time) {
        const timeMatch = activity.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = timeMatch[2];
          const modifier = timeMatch[3];
          if (modifier) {
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          startTimeStr = `${hours.toString().padStart(2, '0')}${minutes}00`;
        }
      }

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${activity.id}-${Date.now()}@travelmate.ai`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART:${cleanDate}T${startTimeStr}`);
      icsContent.push(`SUMMARY:${escapeICS(activity.title)} [${itinerary.destination}]`);
      icsContent.push(`LOCATION:${escapeICS(activity.location)}`);
      icsContent.push(
        `DESCRIPTION:${escapeICS(
          `${activity.description}\\nDuration: ${activity.duration}\\nCost: $${activity.estimatedCost}\\nInsider Tip: ${activity.insiderTip || 'N/A'}`
        )}`
      );
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeICS(str: string): string {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// Generate formatted Markdown string for copying
export function exportToMarkdown(itinerary: Itinerary): string {
  let md = `# ${itinerary.title}\n\n`;
  md += `**Destination:** ${itinerary.destination}\n`;
  md += `**Dates:** ${itinerary.startDate} to ${itinerary.endDate} (${itinerary.daysCount} days)\n`;
  md += `**Travel Style:** ${itinerary.travelerType} | ${itinerary.budgetTier} budget | ${itinerary.pace} pace\n\n`;
  md += `### Trip Overview\n${itinerary.overview}\n\n`;

  md += `### Highlights\n`;
  itinerary.highlights.forEach((h) => {
    md += `- ${h}\n`;
  });
  md += `\n`;

  md += `### Estimated Budget Breakdown\n`;
  md += `- **Accommodation:** $${itinerary.budget.breakdown.accommodation}\n`;
  md += `- **Food & Dining:** $${itinerary.budget.breakdown.foodAndDining}\n`;
  md += `- **Activities & Tickets:** $${itinerary.budget.breakdown.activitiesAndTickets}\n`;
  md += `- **Local Transportation:** $${itinerary.budget.breakdown.localTransportation}\n`;
  md += `- **Emergency & Misc:** $${itinerary.budget.breakdown.emergencyAndMisc}\n`;
  md += `- **Total Estimated:** $${itinerary.budget.totalEstimated}\n\n`;

  md += `## Day-by-Day Itinerary\n\n`;
  itinerary.days.forEach((day) => {
    md += `### Day ${day.dayNumber}: ${day.theme} (${day.date})\n`;
    md += `*${day.summary}*\n\n`;

    day.activities.forEach((act) => {
      md += `#### ${act.time} - ${act.title} [${act.category.toUpperCase()}]\n`;
      md += `- **Location:** ${act.location}\n`;
      md += `- **Duration:** ${act.duration} | **Est. Cost:** $${act.estimatedCost}\n`;
      md += `- ${act.description}\n`;
      if (act.insiderTip) md += `- *Insider Tip:* ${act.insiderTip}\n`;
      md += `\n`;
    });

    if (day.meals.breakfast || day.meals.lunch || day.meals.dinner) {
      md += `**Recommended Dining:**\n`;
      if (day.meals.breakfast) md += `- ☕ Breakfast: ${day.meals.breakfast.restaurantName} (${day.meals.breakfast.highlightDish})\n`;
      if (day.meals.lunch) md += `- 🍽️ Lunch: ${day.meals.lunch.restaurantName} (${day.meals.lunch.highlightDish})\n`;
      if (day.meals.dinner) md += `- 🍷 Dinner: ${day.meals.dinner.restaurantName} (${day.meals.dinner.highlightDish})\n`;
      md += `\n`;
    }

    if (day.transitTips) {
      md += `*Transit Tip:* ${day.transitTips}\n\n`;
    }
    md += `---\n\n`;
  });

  return md;
}
