// Mock OCR Service for SmartSchedule

const MOCK_RESPONSES = [
  // Printed text - High confidence (0.85-0.95)
  {
    success: true,
    data: {
      title: 'Team Meeting',
      date: '2025-01-20',
      start_time: '14:00',
      end_time: '15:00',
      location: 'Conference Room B',
      description: 'Weekly team sync-up to discuss project progress and blockers',
      confidence: 0.92,
      text_type: 'printed',
      raw_text: 'TEAM MEETING\nDate: January 20, 2025\nTime: 2:00 PM - 3:00 PM\nLocation: Conference Room B\nAgenda: Weekly team sync-up',
    },
  },
  {
    success: true,
    data: {
      title: 'Doctor Appointment',
      date: '2025-01-18',
      start_time: '10:30',
      end_time: '11:00',
      location: 'City Medical Center, Room 204',
      description: 'Annual check-up with Dr. Smith',
      confidence: 0.88,
      text_type: 'printed',
      raw_text: 'APPOINTMENT CONFIRMATION\nPatient Visit: January 18, 2025\n10:30 AM - 11:00 AM\nCity Medical Center, Room 204\nDr. Smith - Annual Check-up',
    },
  },
  {
    success: true,
    data: {
      title: 'Dentist Cleaning',
      date: '2025-01-22',
      start_time: '09:00',
      end_time: '09:30',
      location: 'Smile Dental Clinic',
      description: 'Regular dental cleaning and check-up',
      confidence: 0.95,
      text_type: 'printed',
      raw_text: 'DENTAL APPOINTMENT\nDate: 01/22/2025\nTime: 9:00 AM\nDuration: 30 minutes\nSmile Dental Clinic\nService: Cleaning & Check-up',
    },
  },
  // Handwritten text - Lower confidence (0.55-0.75)
  {
    success: true,
    data: {
      title: 'Math Assignment Due',
      date: '2026-01-08',
      start_time: '14:30',
      end_time: '15:30',
      location: 'Professor Johnson Office',
      description: 'Submit calculus homework - Chapter 5 problems',
      confidence: 0.68,
      text_type: 'handwritten',
      raw_text: 'Math hw due!\nJan 8th @ 2:30pm\nProf Johnson office\nCalc ch.5 probs',
    },
  },
  {
    success: true,
    data: {
      title: 'Study Session',
      date: '2025-01-25',
      start_time: '18:00',
      end_time: '20:00',
      location: 'Main Library, 3rd Floor',
      description: 'Group study for midterms with Alex and Sarah',
      confidence: 0.72,
      text_type: 'handwritten',
      raw_text: 'Study group\nSat Jan 25\n6pm-8pm\nlibrary 3rd fl\nw/ Alex + Sarah - midterms',
    },
  },
  {
    success: true,
    data: {
      title: 'Project Deadline',
      date: '2025-01-30',
      start_time: '23:59',
      end_time: '23:59',
      location: 'Online Submission',
      description: 'Final project submission for CS301',
      confidence: 0.58,
      text_type: 'handwritten',
      raw_text: 'PROJECT DUE!!!\n1/30 midnight\nCS301 final proj\nsubmit online',
    },
  },
];

/**
 * Check if file is HEIC format
 * @param {string} file - File path or name
 * @returns {boolean}
 */
export const isHEICFile = (file) => {
  if (!file) return false;
  const extension = file.toLowerCase().split('.').pop();
  return extension === 'heic' || extension === 'heif';
};

/**
 * Process image file (placeholder for HEIC conversion)
 * @param {string} uri - Image URI
 * @returns {Promise<string>} - Processed image URI
 */
export const processImageFile = async (uri) => {
  // In a real app, this would convert HEIC to JPEG if needed
  return uri;
};

/**
 * Simulate OCR processing with random delay
 * @param {string} uri - Image URI
 * @returns {Promise<Object>} - OCR result
 */
export const mockOCR = async (uri) => {
  // Random delay between 2-4 seconds
  const delay = 2000 + Math.random() * 2000;
  
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  // 10% chance of failure
  if (Math.random() < 0.1) {
    return {
      success: false,
      error: 'Failed to process image. Please try again.',
    };
  }
  
  // Return random mock response
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[randomIndex];
};

/**
 * Call OCR API (uses mock for demo)
 * @param {string} uri - Image URI
 * @returns {Promise<Object>} - OCR result
 */
export const callOCRAPI = async (uri) => {
  try {
    // Process image file first (HEIC conversion, etc.)
    const processedUri = await processImageFile(uri);
    
    // Call mock OCR
    const result = await mockOCR(processedUri);
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

export default {
  isHEICFile,
  processImageFile,
  mockOCR,
  callOCRAPI,
  MOCK_RESPONSES,
};

