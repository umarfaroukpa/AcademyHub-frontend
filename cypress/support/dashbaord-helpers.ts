/**
 * Setup authentication mocks for dashboard tests
 */
export function setupAuthMocks(role: 'student' | 'lecturer' | 'admin') {
  // Mock login API
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: `fake-jwt-token-${role}`,
      user: {
        id: role === 'student' ? 1 : role === 'lecturer' ? 2 : 3,
        email: `${role}@test.com`,
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role
      }
    }
  }).as('login');

  // Mock user profile API
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      id: role === 'student' ? 1 : role === 'lecturer' ? 2 : 3,
      email: `${role}@test.com`,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role
    }
  }).as('getProfile');
}

/**
 * Setup common API mocks for student dashboard
 */
export function setupStudentDashboardMocks() {
  // Mock courses API
  cy.intercept('GET', '**/api/courses*', {
    statusCode: 200,
    body: []
  }).as('getCourses');

  // Mock enrollments API
  cy.intercept('GET', '**/api/enrollments*', {
    statusCode: 200,
    body: []
  }).as('getEnrollments');

  // Mock assignments API
  cy.intercept('GET', '**/api/assignments*', {
    statusCode: 200,
    body: []
  }).as('getAssignments');

  // Mock recommendations API
  cy.intercept('POST', '**/api/ai/recommend', {
    statusCode: 200,
    body: []
  }).as('getRecommendations');
}

/**
 * Setup common API mocks for lecturer dashboard
 */
export function setupLecturerDashboardMocks() {
  // Mock courses API
  cy.intercept('GET', '**/api/courses*', {
    statusCode: 200,
    body: []
  }).as('getCourses');

  // Mock students API
  cy.intercept('GET', '**/api/courses/*/students', {
    statusCode: 200,
    body: []
  }).as('getStudents');

  // Mock assignments API
  cy.intercept('GET', '**/api/assignments*', {
    statusCode: 200,
    body: []
  }).as('getAssignments');

  // Mock syllabus generation API
  cy.intercept('POST', '**/api/ai/syllabus', {
    statusCode: 200,
    body: {
      title: 'Generated Syllabus',
      description: 'AI generated content',
      learning_outcomes: [],
      weeks: [],
      assessment: []
    }
  }).as('generateSyllabus');
}

/**
 * Setup common API mocks for admin dashboard
 */
export function setupAdminDashboardMocks() {
  // Mock users API
  cy.intercept('GET', '**/api/admin/users*', {
    statusCode: 200,
    body: []
  }).as('getUsers');

  // Mock courses API
  cy.intercept('GET', '**/api/admin/courses*', {
    statusCode: 200,
    body: []
  }).as('getCourses');

  // Mock enrollments API
  cy.intercept('GET', '**/api/admin/enrollments*', {
    statusCode: 200,
    body: []
  }).as('getEnrollments');

  // Mock lecturers API
  cy.intercept('GET', '**/api/admin/lecturers*', {
    statusCode: 200,
    body: []
  }).as('getLecturers');

  // Mock statistics API
  cy.intercept('GET', '**/api/admin/statistics', {
    statusCode: 200,
    body: {
      total_students: 0,
      total_lecturers: 0,
      total_courses: 0,
      pending_enrollments: 0
    }
  }).as('getStatistics');
}

/**
 * Login helper with mocked authentication
 */
export function loginWithMock(role: 'student' | 'lecturer' | 'admin') {
  // Setup auth mocks
  setupAuthMocks(role);

  // Visit login page
  cy.visit('/login');

  // Wait for page load
  cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');

  // Fill credentials
  cy.get('input[type="email"]').type(`${role}@test.com`);
  cy.get('input[type="password"]').type(`${role}123`);

  // Submit
  cy.get('button[type="submit"]').click();

  // Wait for login
  cy.wait('@login');

  // Wait for redirect
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
}

/**
 * Setup dashboard with proper mocks based on role
 */
export function setupDashboard(role: 'student' | 'lecturer' | 'admin') {
  // Handle chunk loading errors
  cy.on('uncaught:exception', (err) => {
    if (err.message.includes('Failed to load chunk')) {
      return false;
    }
    return true;
  });

  // Setup auth mocks
  setupAuthMocks(role);

  // Setup role-specific mocks
  if (role === 'student') {
    setupStudentDashboardMocks();
  } else if (role === 'lecturer') {
    setupLecturerDashboardMocks();
  } else if (role === 'admin') {
    setupAdminDashboardMocks();
  }
}

// Declare helpers for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      setupAuthMocks(role: 'student' | 'lecturer' | 'admin'): void;
      setupDashboard(role: 'student' | 'lecturer' | 'admin'): void;
      loginWithMock(role: 'student' | 'lecturer' | 'admin'): Chainable<void>;
    }
  }
}

// Add as Cypress commands
Cypress.Commands.add('setupAuthMocks', setupAuthMocks);
Cypress.Commands.add('setupDashboard', setupDashboard);
Cypress.Commands.add('loginWithMock', loginWithMock);