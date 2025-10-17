describe('Student Dashboard Tests', () => {
  beforeEach(() => {
    // Login as student before each test
    cy.loginAs('student');
    cy.visit('/dashboard');
  });

  it('should display student dashboard', () => {
    cy.contains('Student Dashboard').should('be.visible');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should display dashboard tabs', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('My Courses').should('be.visible');
    cy.contains('Browse Courses').should('be.visible');
    cy.contains('Assignments').should('be.visible');
  });

  it('should display quick stats', () => {
    cy.contains('My Courses').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Pending Assignments').should('be.visible');
  });

  it('should switch between tabs', () => {
    // Click Quick Actions tab
    cy.contains('button', 'Quick Actions').click();
    cy.contains('AI Assistant').should('be.visible');

    // Click My Courses tab
    cy.contains('button', 'My Courses').click();
    cy.contains('My Courses').should('be.visible');

    // Click Browse Courses tab
    cy.contains('button', 'Browse Courses').click();
    cy.contains('Available Courses').should('be.visible');
  });

  it('should display AI course recommendations section', () => {
    cy.contains('AI Course Recommendations').should('be.visible');
    cy.get('input[placeholder*="Web Development"]').should('be.visible');
  });

  it('should search for course recommendations', () => {
    const searchQuery = 'Web Development';
    
    // Mock the API response
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

    // Type search query
    cy.get('input[placeholder*="Web Development"]').type(searchQuery);
    cy.contains('Find Courses').click();

    // Wait for API call
    cy.wait('@getRecommendations');

    // Verify results
    cy.contains('Recommended Courses for').should('be.visible');
    cy.contains('Web Development Fundamentals').should('be.visible');
  });

  it('should enroll in a course', () => {
    // Mock courses API
    cy.intercept('GET', '**/api/courses', {
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
    }).as('getCourses');

    // Mock enrollment API
    cy.intercept('POST', '**/api/courses/1/enroll', {
      statusCode: 201,
      body: { success: true }
    }).as('enrollCourse');

    // Navigate to Browse Courses
    cy.contains('button', 'Browse Courses').click();
    cy.wait('@getCourses');

    // Enroll in course
    cy.contains('Enroll Now').click();
    cy.wait('@enrollCourse');

    // Verify success message
    cy.contains('Successfully enrolled').should('be.visible');
  });

  it('should display enrolled courses in My Courses tab', () => {
    // Mock enrollments API
    cy.intercept('GET', '**/api/enrollments', {
      statusCode: 200,
      body: [
        {
          id: 1,
          course_id: 1,
          status: 'active'
        }
      ]
    }).as('getEnrollments');

    // Mock courses API
    cy.intercept('GET', '**/api/courses', {
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
    }).as('getCourses');

    // Navigate to My Courses
    cy.contains('button', 'My Courses').click();
    cy.wait('@getEnrollments');
    cy.wait('@getCourses');

    // Verify enrolled course is displayed
    cy.contains('Introduction to Programming').should('be.visible');
    cy.contains('ENROLLED').should('be.visible');
  });

  it('should use quick actions', () => {
    // Navigate to Quick Actions tab
    cy.contains('button', 'Quick Actions').click();

    // Verify quick action cards are visible
    cy.contains('AI Assistant').should('be.visible');
    cy.contains('Quick Knowledge Check').should('be.visible');
    cy.contains('Generate Study Plan').should('be.visible');
    cy.contains('Join Study Group').should('be.visible');
  });

  it('should handle empty states gracefully', () => {
    // Mock empty enrollments
    cy.intercept('GET', '**/api/enrollments', {
      statusCode: 200,
      body: []
    }).as('getEnrollments');

    // Navigate to My Courses
    cy.contains('button', 'My Courses').click();
    cy.wait('@getEnrollments');

    // Verify empty state message
    cy.contains('No enrolled courses').should('be.visible');
    cy.contains('Browse Courses').should('be.visible');
  });
});

describe('Student Dashboard - Error Handling', () => {
  beforeEach(() => {
    cy.loginAs('student');
  });

  it('should handle API errors gracefully', () => {
    // Mock failed API call
    cy.intercept('GET', '**/api/courses', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getCourses');

    cy.visit('/dashboard');
    cy.wait('@getCourses');

    // Should show error message
    cy.contains('Failed to load courses').should('be.visible');
  });

  it('should handle network errors', () => {
    // Force network error
    cy.intercept('GET', '**/api/courses', { forceNetworkError: true }).as('getCourses');

    cy.visit('/dashboard');
    
    // Should handle error gracefully
    cy.contains('dashboard', { matchCase: false }).should('be.visible');
  });
});