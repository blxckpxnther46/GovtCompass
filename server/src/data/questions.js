/**
 * Onboarding questions configuration.
 * Shared by backend + future frontend.
 */
const questions = [
  {
    id: 'state',
    label: 'Which state do you live in?',
    type: 'select',
    options: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
    ],
  },
  {
    id: 'bestProfileType',
    label: 'Which best describes you?',
    type: 'select',
    options: [
      'Student',
      'Farmer',
      'Business Owner',
      'Job Seeker',
      'Employee',
      'Homemaker',
      'Senior Citizen',
      'Other',
    ],
  },
  {
    id: 'primaryGoal',
    label: 'What are you primarily looking for today?',
    type: 'select',
    options: [
      'Scholarships & Education',
      'Healthcare Support',
      'Financial Assistance',
      'Housing & Welfare',
      'Business Funding',
      'Startup Support',
      'Agriculture Support',
      'Skill Development',
      'Pension & Senior Benefits',
      'Women Empowerment',
    ],
  },
  {
    id: 'incomeRange',
    label: 'What is your annual household income range?',
    type: 'select',
    options: [
      'Below ₹1.5 Lakh',
      '₹1.5L – ₹3L',
      '₹3L – ₹5L',
      '₹5L – ₹8L',
      '₹8L – ₹12L',
      'Above ₹12L',
    ],
  },
  {
    id: 'ageRange',
    label: 'What is your age range?',
    type: 'select',
    options: ['Below 18', '18 – 25', '26 – 40', '41 – 59', '60+'],
  },
  {
    id: 'category',
    label: 'What is your social category?',
    type: 'select',
    options: [
      'General',
      'OBC',
      'SC',
      'ST',
      'EWS',
      'Prefer not to say',
    ],
  },
  {
    id: 'gender',
    label: 'What is your gender?',
    type: 'select',
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  {
    id: 'disability',
    label: 'Do you have a disability?',
    type: 'select',
    options: ['Yes', 'No'],
  },
  {
    id: 'ruralUrban',
    label: 'Do you live in a rural or urban area?',
    type: 'select',
    options: ['Rural', 'Urban'],
  },

  // Student-specific
  {
    id: 'educationLevel',
    label: 'What is your current education level?',
    type: 'select',
    options: ['School', '12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD'],
  },
  {
    id: 'fieldOfStudy',
    label: 'What field are you studying?',
    type: 'select',
    options: ['Engineering', 'Medical', 'Arts', 'Commerce', 'Science', 'Law', 'Other'],
  },

  // Farmer-specific
  {
    id: 'landOwnership',
    label: 'Do you own agricultural land?',
    type: 'select',
    options: ['Yes', 'No'],
  },
  {
    id: 'landHolding',
    label: 'What is your land holding size?',
    type: 'select',
    options: ['Below 1 Acre', '1–5 Acres', 'Above 5 Acres'],
  },

  // Business Owner-specific
  {
    id: 'businessStage',
    label: 'What stage is your business in?',
    type: 'select',
    options: ['Idea Stage', 'Startup', 'Existing Business'],
  },
  {
    id: 'businessType',
    label: 'What type of business do you operate?',
    type: 'select',
    options: ['Technology', 'Manufacturing', 'Agriculture', 'Retail', 'Services', 'Other'],
  },

  // Optional final question
  {
    id: 'customContext',
    label: 'Anything else we should know while finding opportunities for you?',
    type: 'text',
  },
];

function getQuestions() {
  return questions;
}

function getFirstQuestion() {
  return questions[0] ?? null;
}

export { questions, getQuestions, getFirstQuestion };
