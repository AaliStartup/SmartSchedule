/**
 * PDF Text Extraction Service
 * 
 * This service extracts text content from PDF files.
 * Uses multiple methods depending on the environment.
 */

import * as FileSystem from 'expo-file-system';

/**
 * Extract text from a PDF file
 * 
 * For React Native, we read the PDF as base64 and extract text patterns.
 * PDFs store text in a specific format that we can parse.
 * 
 * @param {string} uri - The URI of the PDF file
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const extractTextFromPDF = async (uri) => {
  try {
    console.log('Extracting text from PDF:', uri);
    
    // Read the PDF file as base64
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      return {
        success: false,
        error: 'File not found',
      };
    }
    
    // Read file content
    const base64Content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Decode base64 to get raw PDF content
    const pdfContent = atob(base64Content);
    
    // Extract text from PDF content
    const extractedText = extractTextFromPDFContent(pdfContent);
    
    if (extractedText && extractedText.length > 0) {
      return {
        success: true,
        text: extractedText,
      };
    }
    
    // If no text found, try alternative extraction
    const alternativeText = extractTextAlternative(pdfContent);
    
    return {
      success: true,
      text: alternativeText || 'No text content found in PDF',
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract text from PDF',
    };
  }
};

/**
 * Extract text from raw PDF content
 * 
 * PDF files store text in specific patterns:
 * - Text streams between "BT" and "ET" markers
 * - Text in parentheses after "Tj" or "TJ" operators
 * - Unicode text in angle brackets
 */
const extractTextFromPDFContent = (pdfContent) => {
  const textParts = [];
  
  // Method 1: Extract text from PDF text streams
  // Text in PDFs is often stored between BT (begin text) and ET (end text)
  const textStreamRegex = /BT[\s\S]*?ET/g;
  const textStreams = pdfContent.match(textStreamRegex) || [];
  
  for (const stream of textStreams) {
    // Extract text from Tj operator (show text)
    const tjMatches = stream.match(/\(([^)]*)\)\s*Tj/g) || [];
    for (const match of tjMatches) {
      const text = match.match(/\(([^)]*)\)/)?.[1];
      if (text) {
        textParts.push(cleanPDFText(text));
      }
    }
    
    // Extract text from TJ operator (show text with positioning)
    const tjArrayMatches = stream.match(/\[([^\]]*)\]\s*TJ/g) || [];
    for (const match of tjArrayMatches) {
      const arrayContent = match.match(/\[([^\]]*)\]/)?.[1] || '';
      const textMatches = arrayContent.match(/\(([^)]*)\)/g) || [];
      for (const textMatch of textMatches) {
        const text = textMatch.match(/\(([^)]*)\)/)?.[1];
        if (text) {
          textParts.push(cleanPDFText(text));
        }
      }
    }
  }
  
  // Method 2: Extract readable strings from the PDF
  // Look for sequences of printable characters
  const readableStrings = extractReadableStrings(pdfContent);
  textParts.push(...readableStrings);
  
  return textParts.join(' ').trim();
};

/**
 * Clean PDF text by removing escape sequences and special characters
 */
const cleanPDFText = (text) => {
  if (!text) return '';
  
  return text
    // Unescape PDF escape sequences
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    // Remove non-printable characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
};

/**
 * Extract readable strings from PDF content
 * Looks for common patterns like dates, words, etc.
 */
const extractReadableStrings = (content) => {
  const strings = [];
  
  // Look for date patterns
  const datePatterns = [
    /\b(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})?\b/gi,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{1,2})(?:st|nd|rd|th)?[,\s]*(\d{4})?\b/gi,
    /\b(Week|Wk)\s*(\d+)\b/gi,
    /\b(Midterm|Mid-term|Final|Exam|Quiz|Test|Assignment|Due|Deadline)\b/gi,
  ];
  
  for (const pattern of datePatterns) {
    const matches = content.match(pattern) || [];
    strings.push(...matches);
  }
  
  // Look for common academic terms
  const academicTerms = content.match(/\b(Lecture|Tutorial|Lab|Chapter|Chap|Section|Week|Mid-?term|Final|Exam|Quiz|Assignment|Project|Deadline|Due)\b/gi) || [];
  strings.push(...academicTerms);
  
  return [...new Set(strings)]; // Remove duplicates
};

/**
 * Alternative text extraction for problematic PDFs
 */
const extractTextAlternative = (content) => {
  // Try to find any readable text sequences
  const readableRegex = /[\x20-\x7E]{10,}/g;
  const matches = content.match(readableRegex) || [];
  
  // Filter out binary-looking strings
  const filtered = matches.filter(str => {
    const letterCount = (str.match(/[a-zA-Z]/g) || []).length;
    return letterCount / str.length > 0.5; // At least 50% letters
  });
  
  return filtered.join(' ');
};

/**
 * Parse extracted text to find calendar events
 * 
 * @param {string} text - Extracted text from PDF
 * @param {object} options - Parsing options
 * @returns {Array} - Array of event objects
 */
export const parseTextForEvents = (text, options = {}) => {
  const { courseName = 'Course', year = 2023 } = options;
  const events = [];
  const lines = text.split(/[\n\r]+/);
  
  // Month mapping
  const monthMap = {
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
  
  // Process each line looking for dates
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ');
    
    // Pattern 1: "6 Sep" or "6 September"
    let match = line.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\b/i);
    if (match) {
      const day = parseInt(match[1]);
      const month = monthMap[match[2].toLowerCase().substring(0, 3)];
      if (month && day >= 1 && day <= 31) {
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const event = createEventFromContext(date, context, courseName);
        if (event && !events.find(e => e.date === date)) {
          events.push(event);
        }
      }
    }
    
    // Pattern 2: "Sep 6" or "September 6"
    match = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (match) {
      const month = monthMap[match[1].toLowerCase().substring(0, 3)];
      const day = parseInt(match[2]);
      if (month && day >= 1 && day <= 31) {
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const event = createEventFromContext(date, context, courseName);
        if (event && !events.find(e => e.date === date)) {
          events.push(event);
        }
      }
    }
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return events;
};

/**
 * Create an event object from context
 */
const createEventFromContext = (date, context, courseName) => {
  const lowerContext = context.toLowerCase();
  
  let type = 'lecture';
  let title = `${courseName} Event`;
  let selected = false;
  
  // Determine event type
  if (lowerContext.includes('exam') || lowerContext.includes('midterm') || lowerContext.includes('mid-term') || lowerContext.includes('final')) {
    type = 'exam';
    selected = true;
    if (lowerContext.includes('midterm') || lowerContext.includes('mid-term')) {
      title = `${courseName} Midterm Exam`;
    } else if (lowerContext.includes('final')) {
      title = `${courseName} Final Exam`;
    } else {
      title = `${courseName} Exam`;
    }
  } else if (lowerContext.includes('due') || lowerContext.includes('deadline') || lowerContext.includes('assignment')) {
    type = 'deadline';
    selected = true;
    title = `${courseName} Assignment Due`;
  } else if (lowerContext.includes('quiz')) {
    type = 'exam';
    selected = true;
    title = `${courseName} Quiz`;
  } else if (lowerContext.includes('lecture') || lowerContext.includes('chapter') || lowerContext.includes('chap')) {
    type = 'lecture';
    title = `${courseName} Lecture`;
  }
  
  // Try to extract topic
  const topicMatch = context.match(/(?::|–|-)\s*([A-Z][^|,\n]{5,50})/);
  if (topicMatch && type === 'lecture') {
    title = `${courseName}: ${topicMatch[1].trim()}`;
  }
  
  return {
    id: `event-${date}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    date,
    startTime: '10:30',
    endTime: '12:20',
    type,
    description: context.substring(0, 200).trim(),
    source: 'PDF Extraction',
    confidence: 0.85,
    selected,
  };
};

export default {
  extractTextFromPDF,
  parseTextForEvents,
};

