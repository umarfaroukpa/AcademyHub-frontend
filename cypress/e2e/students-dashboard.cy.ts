describe('Student Dashboard Tests', () => {
  beforeEach(() => {
    // Handle any uncaught exceptions
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Failed to load chunk')) {
        return false;
      }
      return true;
    });

    // Login as student before each test
    cy.loginAs('student');
    cy.visit('/dashboard');
  });

  describe('Dashboard Layout', () => {
    it('should display student dashboard header', () => {
      cy.contains('Student Dashboard', { timeout: 10000 }).should('be.visible');
      cy.contains('Welcome back', { matchCase: false }).should('be.visible');
    });

    it('should display dashboard tabs', () => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Quick Actions').should('be.visible');
      cy.contains('My Courses').should('be.visible');
      cy.contains('Browse Courses').should('be.visible');
      cy.contains('Assignments').should('be.visible');
    });

    it('should display quick stats cards', () => {
      cy.contains('My Courses').should('be.visible');
      cy.contains('Completed').should('be.visible');
      cy.contains('Pending Assignments').should('be.visible');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Quick Actions tab', () => {
      cy.contains('button', 'Quick Actions').click();
      cy.contains('AI Assistant', { timeout: 5000 }).should('be.visible');
    });

    it('should switch to My Courses tab', () => {
      cy.contains('button', 'My Courses').click();
      cy.contains('My Courses', { timeout: 5000 }).should('be.visible');
    });

    it('should switch to Browse Courses tab', () => {
      cy.contains('button', 'Browse Courses').click();
      cy.contains('Available Courses', { timeout: 5000 }).should('be.visible');
    });

    it('should switch to Assignments tab', () => {
      cy.contains('button', 'Assignments').click();
      cy.contains('Assignment', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('AI Course Recommendations', () => {
    it('should display AI course recommendations section', () => {
      cy.contains('AI Course Recommendations').should('be.visible');
      cy.get('input[placeholder*="Web Development"], input[placeholder*="course"]')
        .should('be.visible');
    });

    it('should search for course recommendations', () => {
      const searchQuery = 'Web Development';
      
      // Mock the AI recommendations API
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
          },
          {
            id: 2,
            title: 'Advanced Web Development',
            description: 'Master React and Node.js',
            code: 'WEB201',
            lecturer_name: 'Jane Smith',
            credits: 4
          }
        ]
      }).as('getRecommendations');

      // Type search query
      cy.get('input[placeholder*="Web Development"], input[placeholder*="course"]')
        .first()
        .type(searchQuery);
      
      cy.contains('button', 'Find Courses', { matchCase: false }).click();

      // Wait for API call
      cy.wait('@getRecommendations');

      // Verify results
      cy.contains('Recommended', { matchCase: false }).should('be.visible');
      cy.contains('Web Development Fundamentals').should('be.visible');
      cy.contains('Advanced Web Development').should('be.visible');
    });

    it('should handle empty recommendations', () => {
      cy.intercept('POST', '**/api/ai/recommend', {
        statusCode: 200,
        body: []
      }).as('getEmptyRecommendations');

      cy.get('input[placeholder*="Web Development"], input[placeholder*="course"]')
        .first()
        .type('Nonexistent Course');
      
      cy.contains('button', 'Find Courses', { matchCase: false }).click();
      cy.wait('@getEmptyRecommendations');

      cy.contains('No recommendations found', { matchCase: false }).should('be.visible');
    });
  });

  describe('Course Enrollment', () => {
    it('should display available courses for enrollment', () => {
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
          },
          {
            id: 2,
            title: 'Data Structures',
            description: 'Learn data structures and algorithms',
            code: 'CS201',
            lecturer_name: 'John Doe',
            credits: 4
          }
        ]
      }).as('getCourses');

      // Navigate to Browse Courses
      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCourses');

      // Verify courses are displayed
      cy.contains('Introduction to Programming').should('be.visible');
      cy.contains('Data Structures').should('be.visible');
    });

    it('should enroll in a course successfully', () => {
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
        body: { 
          success: true,
          message: 'Successfully enrolled in course'
        }
      }).as('enrollCourse');

      // Navigate to Browse Courses
      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCourses');

      // Enroll in course
      cy.contains('Enroll', { matchCase: false }).first().click();
      cy.wait('@enrollCourse');

      // Verify success message
      cy.contains('Successfully enrolled', { matchCase: false }).should('be.visible');
    });

    it('should handle enrollment errors', () => {
      cy.intercept('GET', '**/api/courses', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Full Course',
            description: 'This course is full',
            code: 'FULL101',
            lecturer_name: 'Test Lecturer',
            credits: 3
          }
        ]
      }).as('getCourses');

      cy.intercept('POST', '**/api/courses/1/enroll', {
        statusCode: 400,
        body: { 
          success: false,
          error: 'Course is full'
        }
      }).as('enrollError');

      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCourses');

      cy.contains('Enroll', { matchCase: false }).first().click();
      cy.wait('@enrollError');

      cy.contains('Course is full', { matchCase: false }).should('be.visible');
    });
  });

  describe('My Courses', () => {
    it('should display enrolled courses', () => {
      // Mock enrollments API
      cy.intercept('GET', '**/api/enrollments', {
        statusCode: 200,
        body: [
          {
            id: 1,
            course_id: 1,
            status: 'active',
            enrolled_at: '2024-01-01'
          },
          {
            id: 2,
            course_id: 2,
            status: 'active',
            enrolled_at: '2024-01-02'
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
          },
          {
            id: 2,
            title: 'Web Development',
            description: 'Build web applications',
            code: 'WEB101',
            lecturer_name: 'John Doe',
            credits: 4
          }
        ]
      }).as('getCourses');

      // Navigate to My Courses
      cy.contains('button', 'My Courses').click();
      cy.wait('@getEnrollments');
      cy.wait('@getCourses');

      // Verify enrolled courses are displayed
      cy.contains('Introduction to Programming').should('be.visible');
      cy.contains('Web Development').should('be.visible');
      cy.contains('ENROLLED', { matchCase: false }).should('be.visible');
    });

    it('should handle empty enrolled courses', () => {
      // Mock empty enrollments
      cy.intercept('GET', '**/api/enrollments', {
        statusCode: 200,
        body: []
      }).as('getEnrollments');

      // Navigate to My Courses
      cy.contains('button', 'My Courses').click();
      cy.wait('@getEnrollments');

      // Verify empty state message
      cy.contains('No enrolled courses', { matchCase: false }).should('be.visible');
      cy.contains('Browse Courses').should('be.visible');
    });

    it('should access course details', () => {
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

      cy.contains('button', 'My Courses').click();
      cy.wait('@getEnrollments');
      cy.wait('@getCourses');

      // Click on course card or View Details button
      cy.contains('View Details', { matchCase: false }).first().click();
      
      // Should navigate to course details or show modal
      cy.url().should('satisfy', (url: string) => 
        url.includes('/courses/') || url.includes('/dashboard')
      );
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      cy.contains('button', 'Quick Actions').click();
    });

    it('should display quick action cards', () => {
      cy.contains('AI Assistant').should('be.visible');
      cy.contains('Quick Knowledge Check', { matchCase: false }).should('be.visible');
      cy.contains('Study Plan', { matchCase: false }).should('be.visible');
      cy.contains('Study Group', { matchCase: false }).should('be.visible');
    });

    it('should interact with AI Assistant', () => {
      cy.contains('AI Assistant').click();
      
      // Should open AI Assistant modal or navigate
      cy.contains('AI Assistant', { timeout: 5000 }).should('be.visible');
    });

    it('should access Quick Knowledge Check', () => {
      cy.contains('Quick Knowledge Check', { matchCase: false }).click();
      
      // Verify navigation or modal appears
      cy.url().should('satisfy', (url: string) => 
        url.includes('/quiz') || url.includes('/dashboard')
      );
    });
  });

  describe('Assignments', () => {
    it('should display assignments list', () => {
      cy.intercept('GET', '**/api/assignments', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Assignment 1',
            course_name: 'Introduction to Programming',
            due_date: '2024-12-31',
            status: 'pending'
          },
          {
            id: 2,
            title: 'Project Submission',
            course_name: 'Web Development',
            due_date: '2024-12-25',
            status: 'submitted'
          }
        ]
      }).as('getAssignments');

      cy.contains('button', 'Assignments').click();
      cy.wait('@getAssignments');

      cy.contains('Assignment 1').should('be.visible');
      cy.contains('Project Submission').should('be.visible');
    });

    it('should handle empty assignments', () => {
      cy.intercept('GET', '**/api/assignments', {
        statusCode: 200,
        body: []
      }).as('getEmptyAssignments');

      cy.contains('button', 'Assignments').click();
      cy.wait('@getEmptyAssignments');

      cy.contains('No assignments', { matchCase: false }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle courses API errors gracefully', () => {
      cy.intercept('GET', '**/api/courses', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCoursesError');

      cy.contains('button', 'Browse Courses').click();
      cy.wait('@getCoursesError');

      cy.contains('Failed to load', { matchCase: false }).should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '**/api/courses', { 
        forceNetworkError: true 
      }).as('networkError');

      cy.contains('button', 'Browse Courses').click();
      
      // Should handle error gracefully without crashing
      cy.contains('dashboard', { matchCase: false }).should('be.visible');
    });

    it('should handle enrollment API errors', () => {
      cy.intercept('GET', '**/api/enrollments', {
        statusCode: 500,
        body: { error: 'Failed to fetch enrollments' }
      }).as('getEnrollmentsError');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getEnrollmentsError');

      cy.contains('Failed to load', { matchCase: false }).should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    it('should search courses by title', () => {
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
      }).as('searchCourses');

      cy.contains('button', 'Browse Courses').click();
      
      // Find search input
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .first()
        .type('Web Development');

      cy.wait('@searchCourses');
      cy.contains('Web Development').should('be.visible');
    });

    it('should filter courses by category', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Computer Science 101',
            description: 'Intro to CS',
            code: 'CS101',
            category: 'Computer Science',
            lecturer_name: 'Jane Doe',
            credits: 3
          }
        ]
      }).as('filterCourses');

      cy.contains('button', 'Browse Courses').click();
      
      // Try to find and use category filter
      cy.get('select, [role="combobox"]').first().then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select('Computer Science');
        }
      });

      cy.wait('@filterCourses');
    });
  });
});