// PDF Parser Service for extracting calendar events from documents
// This service extracts dates, exams, deadlines, and lecture schedules from course syllabi

/**
 * Common date patterns to look for in academic documents
 */
const DATE_PATTERNS = {
  // Patterns like "Sep 6", "October 25", "Nov 15"
  monthDay: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi,
  
  // Patterns like "6 Sep", "25 October"
  dayMonth: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/gi,
  
  // ISO format: 2023-09-06
  isoDate: /\b(\d{4})-(\d{2})-(\d{2})\b/g,
  
  // US format: 09/06/2023 or 9/6/23
  usDate: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,
};

/**
 * Keywords that indicate important academic events
 */
const EVENT_KEYWORDS = {
  exam: ['exam', 'midterm', 'mid-term', 'final', 'test', 'quiz'],
  deadline: ['due', 'deadline', 'submit', 'submission', 'assignment'],
  lecture: ['lecture', 'class', 'tutorial', 'seminar', 'lab'],
  holiday: ['holiday', 'break', 'no class', 'cancelled', 'reading week'],
};

/**
 * Month name to number mapping
 */
const MONTH_MAP = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'sept': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12,
};

/**
 * Parse month name to number
 */
const parseMonth = (monthStr) => {
  const normalized = monthStr.toLowerCase().replace(/\./g, '');
  return MONTH_MAP[normalized] || null;
};

/**
 * Determine event type based on surrounding text
 */
const determineEventType = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [type, keywords] of Object.entries(EVENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'event';
};

/**
 * Extract time from text (e.g., "10:30am", "4:30-6:20 pm")
 */
const extractTime = (text) => {
  const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?(?:\s*-\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?)?/gi;
  const match = timePattern.exec(text);
  
  if (match) {
    let startHour = parseInt(match[1]);
    const startMin = match[2] ? parseInt(match[2]) : 0;
    const startPeriod = match[3]?.toLowerCase();
    
    if (startPeriod === 'pm' && startHour !== 12) startHour += 12;
    if (startPeriod === 'am' && startHour === 12) startHour = 0;
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    
    let endTime = null;
    if (match[4]) {
      let endHour = parseInt(match[4]);
      const endMin = match[5] ? parseInt(match[5]) : 0;
      const endPeriod = match[6]?.toLowerCase();
      
      if (endPeriod === 'pm' && endHour !== 12) endHour += 12;
      if (endPeriod === 'am' && endHour === 12) endHour = 0;
      
      endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    }
    
    return { startTime, endTime };
  }
  
  return null;
};

/**
 * Parse a line/section to extract event details
 */
const parseEventFromText = (text, defaultYear = new Date().getFullYear()) => {
  const events = [];
  
  // Try to find dates in the text
  let match;
  
  // Check for "Month Day" pattern (e.g., "Sep 6", "October 25")
  const monthDayRegex = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi;
  
  while ((match = monthDayRegex.exec(text)) !== null) {
    const month = parseMonth(match[1]);
    const day = parseInt(match[2]);
    
    if (month && day >= 1 && day <= 31) {
      // Determine year based on academic calendar (Fall semester = current year, Spring = next year)
      let year = defaultYear;
      if (month >= 1 && month <= 4) {
        year = defaultYear + 1; // Spring semester dates are next year
      }
      
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const eventType = determineEventType(text);
      const timeInfo = extractTime(text);
      
      events.push({
        date: dateStr,
        type: eventType,
        rawText: text.trim(),
        startTime: timeInfo?.startTime || null,
        endTime: timeInfo?.endTime || null,
      });
    }
  }
  
  return events;
};

/**
 * Extract all events from document text
 */
export const extractEventsFromText = (text, options = {}) => {
  const { year = 2023, courseName = 'Course' } = options;
  const lines = text.split('\n');
  const allEvents = [];
  const seenDates = new Set();
  
  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ');
    
    const events = parseEventFromText(line, year);
    
    for (const event of events) {
      // Avoid duplicates
      const key = `${event.date}-${event.type}`;
      if (!seenDates.has(key)) {
        seenDates.add(key);
        
        // Generate a meaningful title
        let title = generateEventTitle(event, context, courseName);
        
        allEvents.push({
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          date: event.date,
          startTime: event.startTime || '09:00',
          endTime: event.endTime || '10:00',
          type: event.type,
          description: event.rawText,
          source: 'PDF Import',
          confidence: 0.85,
          selected: event.type === 'exam' || event.type === 'deadline', // Auto-select important events
        });
      }
    }
  }
  
  // Sort by date
  allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return allEvents;
};

/**
 * Generate a meaningful title for the event
 */
const generateEventTitle = (event, context, courseName) => {
  const lowerContext = context.toLowerCase();
  
  if (event.type === 'exam') {
    if (lowerContext.includes('midterm') || lowerContext.includes('mid-term')) {
      return `${courseName} Midterm Exam`;
    }
    if (lowerContext.includes('final')) {
      return `${courseName} Final Exam`;
    }
    if (lowerContext.includes('quiz')) {
      return `${courseName} Quiz`;
    }
    return `${courseName} Exam`;
  }
  
  if (event.type === 'deadline') {
    // Try to extract what's due
    const assignmentMatch = context.match(/(?:assignment|homework|hw|project|essay|report)\s*#?\s*(\d+)?/i);
    if (assignmentMatch) {
      const num = assignmentMatch[1] ? ` ${assignmentMatch[1]}` : '';
      return `${courseName} Assignment${num} Due`;
    }
    return `${courseName} Deadline`;
  }
  
  if (event.type === 'lecture') {
    // Try to extract topic
    const topicMatch = context.match(/(?:topic|chapter|chap|ch\.?)[\s:]+([^,\n]+)/i);
    if (topicMatch) {
      return `${courseName}: ${topicMatch[1].trim()}`;
    }
    return `${courseName} Lecture`;
  }
  
  if (event.type === 'holiday') {
    return 'No Class - Holiday';
  }
  
  return `${courseName} Event`;
};

/**
 * Parse a course syllabus specifically
 * This handles the structured format of academic syllabi
 */
export const parseSyllabus = (text, courseInfo = {}) => {
  const { courseName = 'BUS254', semester = 'Fall', year = 2023 } = courseInfo;
  
  const events = [];
  
  // Extract course schedule table entries
  // Pattern for "Week X | Date | Topic" format
  const weekPattern = /(?:Wk|Week)\s*(\d+)[^\n]*?(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2})[^\n]*?([^\n|]+)/gi;
  
  let match;
  while ((match = weekPattern.exec(text)) !== null) {
    const weekNum = match[1];
    const dateStr = match[2];
    const topic = match[3]?.trim() || `Week ${weekNum}`;
    
    // Parse the date
    const parsedEvents = parseEventFromText(dateStr, year);
    if (parsedEvents.length > 0) {
      const eventDate = parsedEvents[0].date;
      
      events.push({
        id: `syllabus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${courseName} - ${topic}`,
        date: eventDate,
        startTime: '10:30',
        endTime: '12:20',
        type: 'lecture',
        description: `Week ${weekNum}: ${topic}`,
        source: 'Syllabus Import',
        confidence: 0.9,
        selected: false,
      });
    }
  }
  
  // Look for specific exam mentions
  if (text.toLowerCase().includes('mid-term') || text.toLowerCase().includes('midterm')) {
    const midtermMatch = text.match(/mid-?term[^]*?(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2})/i);
    if (midtermMatch) {
      const parsedDates = parseEventFromText(midtermMatch[1], year);
      if (parsedDates.length > 0) {
        events.push({
          id: `exam-midterm-${Date.now()}`,
          title: `${courseName} Midterm Exam`,
          date: parsedDates[0].date,
          startTime: '10:30',
          endTime: '12:20',
          type: 'exam',
          description: 'Midterm Examination',
          source: 'Syllabus Import',
          confidence: 0.95,
          selected: true,
        });
      }
    }
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return events;
};

/**
 * Mock PDF text extraction (simulates reading PDF content)
 * In a real app, this would use a PDF parsing library
 */
export const extractTextFromPDF = async (uri) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo, return mock syllabus content similar to the BUS254 syllabus
  // In production, you'd use react-native-pdf-lib or similar
  return {
    success: true,
    text: `
      BUS254 Managerial Accounting - Fall 2023
      
      INSTRUCTOR: Dr. Hwee Cheng Tan
      
      D100 (Burnaby)
      Lecture: Thursday 10:30am - 12:20pm
      Venue: B9200
      
      E100 (Burnaby)  
      Lecture: Wednesday 4:30-6:20 pm
      Venue: C9002
      
      COURSE OUTLINE:
      
      Week 1 | Sep 6-7 | Intro to course, Basic cost concepts | Chap 1, Chap 2
      Week 2 | Sep 13-14 | Preparation of manufacturing accounts, Job-order costing | Chap 2, Chap 3
      Week 3 | Sep 20-21 | Job-order costing (II) | Chap 3
      Week 4 | Sep 27-28 | Activity-based costing | Chap 5
      Week 5 | Oct 4-5 | Alternative inventory costing methods | Chap 8
      Week 6 | Oct 11-12 | Cost volume profit analysis | Chap 6
      Week 7 | Oct 18-19 | Incremental analysis | Chap 7
      Week 8 | Oct 25-26 | Mid-term Exam (Topics in weeks 1 to 5) | No tutorials
      Week 9 | Nov 1-2 | Pricing | Chap 9
      Week 10 | Nov 8-9 | Budgetary planning | Chap 10
      Week 11 | Nov 15-16 | Budgetary control and responsibility accounting | Chap 11
      Week 12 | Nov 22-23 | Standard cost and variance analysis | Chap 12
      Week 13 | Nov 29-30 | Review
      
      Final Exam: To be announced (December)
      
      ASSESSMENT:
      Homework: 8% - Due weekly at tutorials
      Groupwork: 12%
      Tutorial participation: 3%
      Mid-term: 19% - Week 8
      Final Exam: 58%
    `,
    metadata: {
      courseName: 'BUS254',
      semester: 'Fall',
      year: 2023,
    }
  };
};

/**
 * Main function to process a PDF and extract calendar events
 */
export const processPDFForCalendar = async (uri) => {
  try {
    // Extract text from PDF
    const extractResult = await extractTextFromPDF(uri);
    
    if (!extractResult.success) {
      return {
        success: false,
        error: 'Failed to extract text from PDF',
      };
    }
    
    // Parse the extracted text
    const events = parseSyllabus(extractResult.text, extractResult.metadata);
    
    // Also extract any additional dates found
    const additionalEvents = extractEventsFromText(
      extractResult.text, 
      { year: extractResult.metadata?.year || 2023, courseName: extractResult.metadata?.courseName || 'Course' }
    );
    
    // Merge and deduplicate
    const allEvents = [...events];
    const existingDates = new Set(events.map(e => e.date));
    
    for (const event of additionalEvents) {
      if (!existingDates.has(event.date)) {
        allEvents.push(event);
        existingDates.add(event.date);
      }
    }
    
    // Sort by date
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      success: true,
      events: allEvents,
      metadata: extractResult.metadata,
      totalFound: allEvents.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An error occurred while processing the PDF',
    };
  }
};

export default {
  extractEventsFromText,
  parseSyllabus,
  extractTextFromPDF,
  processPDFForCalendar,
};

