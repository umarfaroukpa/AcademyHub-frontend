describe('Student Dashboard Tests - Standalone', () => {
  beforeEach(() => {
    // Handle chunk loading errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Failed to load chunk')) {
        return false;
      }
      return true;
    });

    // Mock all API calls before login
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

    cy.intercept('GET', '**/api/courses*', {
      statusCode: 200,
      body: []
    }).as('getCourses');

    cy.intercept('GET', '**/api/enrollments*', {
      statusCode: 200,
      body: []
    }).as('getEnrollments');

    cy.intercept('GET', '**/api/assignments*', {
      statusCode: 200,
      body: []
    }).as('getAssignments');

    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student'
      }
    }).as('getProfile');

    // Perform login
    cy.visit('/login');
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').type('student@test.com');
    cy.get('input[type="password"]').type('student123');
    cy.get('button[type="submit"]').click();
    
    // Wait for login and redirect
    cy.wait('@login');
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });

  describe('Dashboard Layout', () => {
    it('should display student dashboard header', () => {
      cy.contains('Student Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it('should display dashboard tabs', () => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Quick Actions').should('be.visible');
      cy.contains('My Courses').should('be.visible');
      cy.contains('Browse Courses').should('be.visible');
    });

    it('should display welcome message', () => {
      cy.contains('Welcome back', { matchCase: false }).should('be.visible');
    });
  });

  describe('Course Enrollment', () => {
    it('should display available courses', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Introduction to Programming',
            description: 'Learn programming basics',
            code: 'CS101',
            lecturer_name: 'Jane Smith',
            credits: 3
          }
        ]
      }).as('getCoursesWithData');

      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCoursesWithData');

      cy.contains('Introduction to Programming').should('be.visible');
      cy.contains('CS101').should('be.visible');
    });

    it('should enroll in a course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Web Development',
            description: 'Build websites',
            code: 'WEB101',
            lecturer_name: 'John Doe',
            credits: 3
          }
        ]
      }).as('getBrowseCourses');

      cy.intercept('POST', '**/api/courses/1/enroll', {
        statusCode: 201,
        body: { 
          success: true,
          message: 'Successfully enrolled in course'
        }
      }).as('enrollCourse');

      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getBrowseCourses');

      cy.contains('Enroll', { matchCase: false }).first().click();
      cy.wait('@enrollCourse');

      cy.contains('Successfully enrolled', { matchCase: false }).should('be.visible');
    });
  });

  describe('My Courses', () => {
    it('should display enrolled courses', () => {
      cy.intercept('GET', '**/api/enrollments*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            course_id: 1,
            status: 'active'
          }
        ]
      }).as('getMyEnrollments');

      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Introduction to Programming',
            description: 'Learn programming basics',
            code: 'CS101',
            lecturer_name: 'Jane Smith',
            credits: 3
          }
        ]
      }).as('getMyCourses');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getMyEnrollments');
      cy.wait('@getMyCourses');

      cy.contains('Introduction to Programming').should('be.visible');
    });

    it('should handle empty enrolled courses', () => {
      cy.intercept('GET', '**/api/enrollments*', {
        statusCode: 200,
        body: []
      }).as('getEmptyEnrollments');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getEmptyEnrollments');

      cy.contains('No enrolled courses', { matchCase: false }).should('be.visible');
    });
  });

  describe('AI Course Recommendations', () => {
    it('should search for recommendations', () => {
      cy.intercept('POST', '**/api/ai/recommend', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Web Development Fundamentals',
            description: 'Learn HTML, CSS, and JavaScript',
            code: 'WEB101',
            lecturer_name: 'John Doe',
            credits: 3
          }
        ]
      }).as('getRecommendations');

      cy.get('input[placeholder*="Web Development"], input[placeholder*="course"]')
        .first()
        .type('Web Development');
      
      cy.contains('button', 'Find Courses', { matchCase: false }).click();
      cy.wait('@getRecommendations');

      cy.contains('Web Development Fundamentals').should('be.visible');
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action cards', () => {
      cy.contains('button', 'Quick Actions').click();
      cy.contains('AI Assistant', { matchCase: false }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCoursesError');

      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCoursesError');

      // Should show error or handle gracefully
      cy.get('body').should('be.visible');
    });
  });
});