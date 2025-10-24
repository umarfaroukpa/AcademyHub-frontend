/// <reference types="cypress" />

Cypress.Commands.add('setupLecturerMocks', () => {
  // Mock admin statistics
  cy.intercept('GET', '**/api/**statistics**', {
    statusCode: 200,
    body: {
      total_students: 150,
      total_lecturers: 25,
      total_courses: 45,
      pending_enrollments: 12
    }
  }).as('getStatistics');

  // Mock admin users
  cy.intercept('GET', '**/api/**users**', {
    statusCode: 200,
    body: [
      {
        id: 1,
        name: 'John Student',
        email: 'john@student.com',
        role: 'student',
        is_active: true,
        created_at: '2024-01-01'
      },
      {
        id: 2,
        name: 'Jane Lecturer',
        email: 'jane@lecturer.com',
        role: 'lecturer',
        is_active: true,
        created_at: '2024-01-02'
      }
    ]
  }).as('getUsers');

  // Mock admin courses
  cy.intercept('GET', '**/api/**courses**', {
    statusCode: 200,
    body: [
      {
        id: 1,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Learn programming basics',
        lecturer_name: 'Dr. Smith',
        credits: 3
      }
    ]
  }).as('getCourses');

  // Mock enrollments
  cy.intercept('GET', '**/api/**enrollments**', {
    statusCode: 200,
    body: [
      {
        id: 1,
        student_name: 'John Doe',
        course_name: 'Introduction to CS',
        status: 'pending',
        created_at: '2024-01-01'
      }
    ]
  }).as('getEnrollments');

  // Mock lecturers
  cy.intercept('GET', '**/api/**lecturers**', {
    statusCode: 200,
    body: [
      { id: 1, name: 'Dr. Smith' },
      { id: 2, name: 'Prof. Johnson' }
    ]
  }).as('getLecturers');

  // Mock POST endpoints
  cy.intercept('POST', '**/api/**users**', {
    statusCode: 201,
    body: {
      id: 3,
      name: 'New User',
      email: 'new@user.com',
      role: 'student'
    }
  }).as('createUser');

  cy.intercept('POST', '**/api/**courses**', {
    statusCode: 201,
    body: {
      id: 2,
      code: 'PHYS101',
      title: 'Physics Fundamentals',
      credits: 3
    }
  }).as('createCourse');

  // Log API calls
  cy.intercept('**/api/**', (req) => {
    console.log(`📡 API ${req.method}: ${req.url}`);
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  // Set localStorage before visit
  cy.window().then((win) => {
    win.localStorage.clear();
    win.localStorage.setItem('token', 'mock-admin-token-12345');
    win.localStorage.setItem('user', JSON.stringify({
      id: 3,
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    }));
    win.localStorage.setItem('isAuthenticated', 'true');
    win.localStorage.setItem('userRole', 'admin');
  });

  // Visit with error handling
  cy.visit('/', {
    timeout: 30000,
    failOnStatusCode: false,
    onBeforeLoad(win) {
      win.localStorage.setItem('token', 'mock-admin-token-12345');
      win.localStorage.setItem('user', JSON.stringify({
        id: 3,
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    }
  });

  // Verify not on login page
  cy.url({ timeout: 10000 }).should('not.include', 'login');
});

Cypress.Commands.add('setupLecturerMocks', () => {
  // Mock lecturer authentication
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: 'fake-jwt-token-lecturer',
      user: {
        id: 2,
        email: 'lecturer@test.com',
        name: 'Test Lecturer',
        role: 'lecturer'
      }
    }
  }).as('login');

  // Mock profile
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      id: 2,
      email: 'lecturer@test.com',
      name: 'Test Lecturer',
      role: 'lecturer'
    }
  }).as('getProfile');

  // Mock courses with flexible patterns
  const coursePatterns = [
    '**/api/courses*',
    '**/api/lecturer/courses*',
    '**/courses*'
  ];

  coursePatterns.forEach(pattern => {
    cy.intercept('GET', pattern, {
      statusCode: 200,
      body: []
    }).as('getCourses');
  });

  // Mock assignments
  cy.intercept('GET', '**/api/assignments*', {
    statusCode: 200,
    body: []
  }).as('getAssignments');

  // Mock students
  cy.intercept('GET', '**/api/courses/*/students', {
    statusCode: 200,
    body: []
  }).as('getStudents');

  // Mock course creation
  cy.intercept('POST', '**/api/courses', (req) => {
    req.reply({
      statusCode: 201,
      body: {
        id: 1,
        ...req.body,
        lecturer_id: 2
      }
    });
  }).as('createCourse');

  // Mock AI syllabus generation
  cy.intercept('POST', '**/api/ai/syllabus', {
    statusCode: 200,
    body: {
      title: 'Generated Syllabus',
      description: 'AI-generated course content',
      learning_outcomes: ['Outcome 1', 'Outcome 2'],
      weeks: []
    }
  }).as('generateSyllabus');

  // Log all API calls
  cy.intercept('**/api/**', (req) => {
    console.log(`📡 API ${req.method}: ${req.url}`);
  });
});

Cypress.Commands.add('loginAsLecturer', () => {
  // Set localStorage first
  cy.window().then((win) => {
    win.localStorage.clear();
    win.localStorage.setItem('token', 'fake-jwt-token-lecturer');
    win.localStorage.setItem('user', JSON.stringify({
      id: 2,
      email: 'lecturer@test.com',
      name: 'Test Lecturer',
      role: 'lecturer'
    }));
    win.localStorage.setItem('isAuthenticated', 'true');
    win.localStorage.setItem('userRole', 'lecturer');
  });

  // Visit dashboard
  cy.visit('/', {
    timeout: 30000,
    failOnStatusCode: false,
    onBeforeLoad(win) {
      win.localStorage.setItem('token', 'fake-jwt-token-lecturer');
      win.localStorage.setItem('user', JSON.stringify({
        id: 2,
        email: 'lecturer@test.com',
        name: 'Test Lecturer',
        role: 'lecturer'
      }));
    }
  });

  // Verify not on login page
  cy.url({ timeout: 10000 }).should('not.include', 'login');
});

Cypress.Commands.add('setupStudentMocks', () => {
  // Mock student authentication
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: 'fake-jwt-token-student',
      user: {
        id: 1,
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student'
      }
    }
  }).as('login');

  // Mock profile
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      id: 1,
      email: 'student@test.com',
      name: 'Test Student',
      role: 'student'
    }
  }).as('getProfile');

  // Mock enrolled courses
  cy.intercept('GET', '**/api/student/courses*', {
    statusCode: 200,
    body: []
  }).as('getEnrolledCourses');

  // Mock available courses
  cy.intercept('GET', '**/api/courses*', {
    statusCode: 200,
    body: [
      {
        id: 1,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 3
      }
    ]
  }).as('getAvailableCourses');

  // Mock assignments
  cy.intercept('GET', '**/api/student/assignments*', {
    statusCode: 200,
    body: []
  }).as('getAssignments');

  // Mock grades
  cy.intercept('GET', '**/api/student/grades*', {
    statusCode: 200,
    body: []
  }).as('getGrades');

  // Log all API calls
  cy.intercept('**/api/**', (req) => {
    console.log(`📡 API ${req.method}: ${req.url}`);
  });
});

Cypress.Commands.add('loginAsStudent', () => {
  // Set localStorage first
  cy.window().then((win) => {
    win.localStorage.clear();
    win.localStorage.setItem('token', 'fake-jwt-token-student');
    win.localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'student@test.com',
      name: 'Test Student',
      role: 'student'
    }));
    win.localStorage.setItem('isAuthenticated', 'true');
    win.localStorage.setItem('userRole', 'student');
  });

  // Visit dashboard
  cy.visit('/', {
    timeout: 30000,
    failOnStatusCode: false,
    onBeforeLoad(win) {
      win.localStorage.setItem('token', 'fake-jwt-token-student');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student'
      }));
    }
  });

  // Verify not on login page
  cy.url({ timeout: 10000 }).should('not.include', 'login');
});


Cypress.Commands.add('navigateToSection', (sectionName: string) => {
  cy.contains(sectionName, { matchCase: false, timeout: 10000 })
    .should('be.visible')
    .click({ force: true });
  cy.wait(1000);
});

Cypress.Commands.add('checkServerAvailability', () => {
  cy.request({
    url: 'http://localhost:3000',
    timeout: 10000,
    failOnStatusCode: false
  }).then((response) => {
    console.log(`✅ Server status: ${response.status}`);
  });
});

Cypress.Commands.add('debugPage', () => {
  cy.get('body').then(($body) => {
    console.log('=== 🎯 PAGE DEBUG INFO ===');
    console.log(`Page Title: ${document.title}`);
    console.log(`Current URL: ${window.location.href}`);
    console.log(`Body text length: ${$body.text().length}`);
    console.log(`Visible buttons: ${$body.find('button:visible').length}`);
    console.log(`Visible inputs: ${$body.find('input:visible').length}`);
    
    const visibleText = $body.text().replace(/\s+/g, ' ').substring(0, 300);
    console.log(`Visible text preview: ${visibleText}...`);
  });
});

Cypress.Commands.add('logPageInfo', () => {
  cy.window().then((win) => {
    const title = win.document.title;
    const url = win.location.href;
    console.log('Page Info:', { title, url });
  });
});


Cypress.Commands.add('setupFlexibleMocks', () => {
  // Statistics with multiple patterns
  const statsPatterns = [
    '**/api/statistics**',
    '**/api/admin/statistics**',
    '**/api/stats**',
    '**/statistics**',
    '**/*statistics*'
  ];

  statsPatterns.forEach(pattern => {
    cy.intercept('GET', pattern, {
      statusCode: 200,
      body: {
        total_students: 150,
        total_lecturers: 25,
        total_courses: 45,
        pending_enrollments: 12
      }
    }).as('getStatistics');
  });

  // Users with multiple patterns
  const userPatterns = [
    '**/api/users**',
    '**/api/admin/users**',
    '**/users**',
    '**/*users*'
  ];

  userPatterns.forEach(pattern => {
    cy.intercept('GET', pattern, {
      statusCode: 200,
      body: [
        { id: 1, name: 'John Student', email: 'john@test.com', role: 'student' },
        { id: 2, name: 'Jane Lecturer', email: 'jane@test.com', role: 'lecturer' }
      ]
    }).as('getUsers');
  });

  // Courses with multiple patterns
  const coursePatterns = [
    '**/api/courses**',
    '**/api/admin/courses**',
    '**/courses**',
    '**/*courses*'
  ];

  coursePatterns.forEach(pattern => {
    cy.intercept('GET', pattern, {
      statusCode: 200,
      body: [
        {
          id: 1,
          code: 'CS101',
          title: 'Introduction to Computer Science',
          credits: 3
        }
      ]
    }).as('getCourses');
  });

  // Log ALL API requests
  cy.intercept('**/*', (req) => {
    if (req.url.includes('api') || req.url.includes('localhost:4000')) {
      console.log(`🌐 API Request: ${req.method} ${req.url}`);
    }
  });
});


declare global {
  namespace Cypress {
    interface Chainable {
      // Admin commands
      setupAdminMocks(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      
      // Lecturer commands
      setupLecturerMocks(): Chainable<void>;
      loginAsLecturer(): Chainable<void>;
      
      // Student commands
      setupStudentMocks(): Chainable<void>;
      loginAsStudent(): Chainable<void>;
      
      // Utility commands
      navigateToSection(sectionName: string): Chainable<void>;
      checkServerAvailability(): Chainable<void>;
      debugPage(): Chainable<void>;
      logPageInfo(): Chainable<void>;
      setupFlexibleMocks(): Chainable<void>;
    }
  }
}

export {};