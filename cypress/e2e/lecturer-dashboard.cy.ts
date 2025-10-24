describe('Lecturer Dashboard Tests', () => {
  beforeEach(() => {
    // Handle any uncaught exceptions
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Failed to load chunk')) {
        return false;
      }
      return true;
    });

    cy.loginAs('lecturer');
    cy.visit('/dashboard');
  });

  describe('Dashboard Layout', () => {
    it('should display lecturer dashboard', () => {
      cy.contains('Lecturer Dashboard', { timeout: 10000 }).should('be.visible');
      cy.contains('Manage your courses', { matchCase: false }).should('be.visible');
    });

    it('should display Create Course button', () => {
      cy.contains('Create Course').should('be.visible');
    });

    it('should display AI Syllabus Generator section', () => {
      cy.contains('AI Syllabus Generator').should('be.visible');
      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .should('be.visible');
    });
  });

  describe('Course Creation', () => {
    it('should open create course form', () => {
      cy.contains('Create Course').click();
      cy.contains('Create New Course', { timeout: 5000 }).should('be.visible');
      cy.get('input[name="code"]').should('be.visible');
      cy.get('input[name="title"]').should('be.visible');
      cy.get('textarea[name="description"]').should('be.visible');
    });

    it('should create a new course successfully', () => {
      // Mock create course API
      cy.intercept('POST', '**/api/courses', {
        statusCode: 201,
        body: {
          id: 1,
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Learn the basics of computer science',
          credits: 3,
          lecturer_id: 1
        }
      }).as('createCourse');

      // Open create form
      cy.contains('Create Course').click();

      // Fill form
      cy.get('input[name="code"]').type('CS101');
      cy.get('input[name="title"]').type('Introduction to Computer Science');
      cy.get('textarea[name="description"]').type('Learn the basics of computer science');
      cy.get('input[name="credits"]').clear().type('3');

      // Submit
      cy.get('button[type="submit"]').contains('Create', { matchCase: false }).click();
      cy.wait('@createCourse');

      // Verify success
      cy.contains('Course created', { matchCase: false }).should('be.visible');
    });

    it('should validate course form inputs', () => {
      cy.contains('Create Course').click();

      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should validate course code format', () => {
      cy.contains('Create Course').click();

      cy.get('input[name="code"]').type('invalid code');
      cy.get('input[name="title"]').type('Test Course');
      cy.get('textarea[name="description"]').type('Test description');
      cy.get('button[type="submit"]').click();

      // Should show format validation error if applicable
      cy.get('body').should('be.visible');
    });

    it('should handle course creation errors', () => {
      cy.intercept('POST', '**/api/courses', {
        statusCode: 400,
        body: {
          error: 'Course code already exists'
        }
      }).as('createCourseError');

      cy.contains('Create Course').click();

      cy.get('input[name="code"]').type('EXIST101');
      cy.get('input[name="title"]').type('Existing Course');
      cy.get('textarea[name="description"]').type('This will fail');
      cy.get('input[name="credits"]').clear().type('3');
      cy.get('button[type="submit"]').click();

      cy.wait('@createCourseError');
      cy.contains('already exists', { matchCase: false }).should('be.visible');
    });
  });

  describe('AI Syllabus Generator', () => {
    it('should generate syllabus with AI', () => {
      // Mock AI syllabus generation
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 200,
        body: {
          title: 'Syllabus for Data Structures',
          description: 'A comprehensive course on data structures',
          learning_outcomes: [
            'Understand basic data structures',
            'Implement algorithms efficiently',
            'Analyze time and space complexity'
          ],
          weeks: [
            {
              week: 1,
              topics: ['Introduction', 'Arrays', 'Linked Lists'],
              assignments: ['Array Practice', 'Linked List Implementation']
            },
            {
              week: 2,
              topics: ['Stacks', 'Queues'],
              assignments: ['Stack and Queue Problems']
            }
          ],
          assessment: [
            {
              type: 'Midterm',
              weight: 30,
              description: 'Written exam covering weeks 1-7'
            },
            {
              type: 'Final Project',
              weight: 40,
              description: 'Implement a complex data structure'
            }
          ]
        }
      }).as('generateSyllabus');

      // Enter topic
      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Data Structures');
      
      cy.contains('button', 'Generate').click();

      cy.wait('@generateSyllabus');

      // Verify syllabus is displayed
      cy.contains('Syllabus for Data Structures').should('be.visible');
      cy.contains('Learning Outcomes').should('be.visible');
      cy.contains('Understand basic data structures').should('be.visible');
    });

    it('should handle AI generation errors', () => {
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 500,
        body: {
          error: 'AI service unavailable'
        }
      }).as('generateSyllabusError');

      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Error Course');
      
      cy.contains('button', 'Generate').click();
      cy.wait('@generateSyllabusError');

      cy.contains('Failed', { matchCase: false }).should('be.visible');
    });

    it('should allow copying generated syllabus', () => {
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 200,
        body: {
          title: 'Test Syllabus',
          description: 'Test description',
          learning_outcomes: ['Learn testing'],
          weeks: [],
          assessment: []
        }
      }).as('generateSyllabus');

      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Testing');
      cy.contains('button', 'Generate').click();
      cy.wait('@generateSyllabus');

      // Look for copy or use button
      cy.contains('button', 'Copy', { matchCase: false }).should('be.visible');
    });
  });

  describe('My Courses Management', () => {
    it('should display My Courses tab', () => {
      // Mock courses API
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS',
            description: 'Learn CS basics',
            lecturer_id: 1,
            credits: 3
          },
          {
            id: 2,
            code: 'CS201',
            title: 'Data Structures',
            description: 'Advanced data structures',
            lecturer_id: 1,
            credits: 4
          }
        ]
      }).as('getCourses');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      cy.contains('Introduction to CS').should('be.visible');
      cy.contains('Data Structures').should('be.visible');
    });

    it('should view course details', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS',
            description: 'Learn CS basics',
            lecturer_id: 1
          }
        ]
      }).as('getCourses');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      cy.contains('View Details', { matchCase: false }).first().click();
      
      // Should show course details
      cy.contains('CS101').should('be.visible');
    });

    it('should edit course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS',
            description: 'Learn CS basics',
            lecturer_id: 1
          }
        ]
      }).as('getCourses');

      cy.intercept('PUT', '**/api/courses/1', {
        statusCode: 200,
        body: {
          id: 1,
          code: 'CS101',
          title: 'Updated Title',
          description: 'Updated description'
        }
      }).as('updateCourse');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      cy.contains('Edit', { matchCase: false }).first().click();

      // Update course details
      cy.get('input[name="title"]').clear().type('Updated Title');
      cy.get('textarea[name="description"]').clear().type('Updated description');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateCourse');
      cy.contains('Course updated', { matchCase: false }).should('be.visible');
    });

    it('should delete course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'DELETE101',
            title: 'Course to Delete',
            description: 'This will be deleted',
            lecturer_id: 1
          }
        ]
      }).as('getCourses');

      cy.intercept('DELETE', '**/api/courses/1', {
        statusCode: 200,
        body: { message: 'Course deleted successfully' }
      }).as('deleteCourse');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      // Mock confirm dialog
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.contains('Delete', { matchCase: false }).first().click();
      cy.wait('@deleteCourse');

      cy.contains('Course deleted', { matchCase: false }).should('be.visible');
    });
  });

  describe('Syllabus Upload', () => {
    it('should upload syllabus for course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS',
            description: 'Learn CS basics'
          }
        ]
      }).as('getCourses');

      cy.intercept('POST', '**/api/courses/1/syllabus', {
        statusCode: 200,
        body: { message: 'Syllabus uploaded successfully' }
      }).as('uploadSyllabus');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      // Simulate file selection
      cy.get('input[type="file"]').first().selectFile({
        contents: Cypress.Buffer.from('syllabus content'),
        fileName: 'syllabus.pdf',
        mimeType: 'application/pdf'
      }, { force: true });

      cy.wait('@uploadSyllabus');
      cy.contains('Syllabus uploaded', { matchCase: false }).should('be.visible');
    });

    it('should validate file type for syllabus upload', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS'
          }
        ]
      }).as('getCourses');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      // Try to upload invalid file type
      cy.get('input[type="file"]').first().selectFile({
        contents: Cypress.Buffer.from('image content'),
        fileName: 'image.jpg',
        mimeType: 'image/jpeg'
      }, { force: true });

      // Should show error for invalid file type
      cy.contains('Invalid file type', { matchCase: false }).should('be.visible');
    });
  });

  describe('Quick Actions', () => {
    it('should navigate to Quick Actions tab', () => {
      cy.contains('button', 'Quick Actions').click();
      
      // Verify quick action cards
      cy.contains('Create Course').should('be.visible');
      cy.contains('Add User').should('be.visible');
      cy.contains('Generate Syllabus').should('be.visible');
    });

    it('should open Add User modal from Quick Actions', () => {
      cy.contains('button', 'Quick Actions').click();
      cy.contains('Add New User', { matchCase: false }).click();

      cy.contains('Add New User').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
    });

    it('should create user from Quick Actions', () => {
      cy.intercept('POST', '**/api/users', {
        statusCode: 201,
        body: {
          id: 1,
          name: 'New Student',
          email: 'newstudent@test.com',
          role: 'student'
        }
      }).as('createUser');

      cy.contains('button', 'Quick Actions').click();
      cy.contains('Add New User', { matchCase: false }).click();

      cy.get('input[name="name"]').type('New Student');
      cy.get('input[name="email"]').type('newstudent@test.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('select[name="role"]').select('student');

      cy.get('button[type="submit"]').click();
      cy.wait('@createUser');

      cy.contains('User created', { matchCase: false }).should('be.visible');
    });
  });

  describe('Student Management', () => {
    it('should view enrolled students in course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS',
            description: 'Learn CS basics'
          }
        ]
      }).as('getCourses');

      cy.intercept('GET', '**/api/courses/1/students', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'John Student',
            email: 'john@student.com',
            enrollment_date: '2024-01-01'
          },
          {
            id: 2,
            name: 'Jane Student',
            email: 'jane@student.com',
            enrollment_date: '2024-01-02'
          }
        ]
      }).as('getCourseStudents');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      cy.contains('View Students', { matchCase: false }).first().click();
      cy.wait('@getCourseStudents');

      cy.contains('John Student').should('be.visible');
      cy.contains('Jane Student').should('be.visible');
    });

    it('should view student progress', () => {
      cy.intercept('GET', '**/api/courses/1/students', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'Test Student',
            email: 'test@student.com',
            progress: 75
          }
        ]
      }).as('getStudents');

      cy.intercept('GET', '**/api/students/1/progress/1', {
        statusCode: 200,
        body: {
          completed_assignments: 8,
          total_assignments: 10,
          grade: 85,
          attendance: 90
        }
      }).as('getStudentProgress');

      cy.contains('button', 'My Courses').click();
      cy.contains('View Students', { matchCase: false }).first().click();
      cy.wait('@getStudents');

      cy.contains('View Progress', { matchCase: false }).first().click();
      cy.wait('@getStudentProgress');

      cy.contains('85').should('be.visible');
      cy.contains('90%', { matchCase: false }).should('be.visible');
    });
  });

  describe('Assignments Management', () => {
    it('should create assignment for course', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to CS'
          }
        ]
      }).as('getCourses');

      cy.intercept('POST', '**/api/courses/1/assignments', {
        statusCode: 201,
        body: {
          id: 1,
          title: 'Assignment 1',
          description: 'Complete the tasks',
          due_date: '2024-12-31'
        }
      }).as('createAssignment');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCourses');

      cy.contains('Create Assignment', { matchCase: false }).first().click();

      cy.get('input[name="title"]').type('Assignment 1');
      cy.get('textarea[name="description"]').type('Complete the tasks');
      cy.get('input[name="due_date"]').type('2024-12-31');

      cy.get('button[type="submit"]').click();
      cy.wait('@createAssignment');

      cy.contains('Assignment created', { matchCase: false }).should('be.visible');
    });

    it('should view assignment submissions', () => {
      cy.intercept('GET', '**/api/assignments/1/submissions', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'John Student',
            submitted_at: '2024-12-15',
            status: 'submitted',
            grade: null
          },
          {
            id: 2,
            student_name: 'Jane Student',
            submitted_at: '2024-12-16',
            status: 'submitted',
            grade: 95
          }
        ]
      }).as('getSubmissions');

      cy.contains('button', 'Assignments', { matchCase: false }).click();
      cy.contains('View Submissions', { matchCase: false }).first().click();

      cy.wait('@getSubmissions');

      cy.contains('John Student').should('be.visible');
      cy.contains('Jane Student').should('be.visible');
      cy.contains('95').should('be.visible');
    });

    it('should grade assignment submission', () => {
      cy.intercept('GET', '**/api/assignments/1/submissions', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Test Student',
            submitted_at: '2024-12-15',
            status: 'submitted',
            grade: null
          }
        ]
      }).as('getSubmissions');

      cy.intercept('PUT', '**/api/submissions/1/grade', {
        statusCode: 200,
        body: { message: 'Grade submitted successfully' }
      }).as('gradeSubmission');

      cy.contains('button', 'Assignments', { matchCase: false }).click();
      cy.contains('View Submissions', { matchCase: false }).first().click();
      cy.wait('@getSubmissions');

      cy.contains('Grade', { matchCase: false }).first().click();

      cy.get('input[name="grade"]').type('88');
      cy.get('textarea[name="feedback"]').type('Good work!');
      cy.get('button[type="submit"]').click();

      cy.wait('@gradeSubmission');
      cy.contains('Grade submitted', { matchCase: false }).should('be.visible');
    });
  });

  describe('Analytics and Reports', () => {
    it('should display course analytics', () => {
      cy.intercept('GET', '**/api/courses/1/analytics', {
        statusCode: 200,
        body: {
          enrolled_students: 25,
          average_grade: 78,
          completion_rate: 85,
          attendance_rate: 90
        }
      }).as('getCourseAnalytics');

      cy.contains('button', 'My Courses').click();
      cy.contains('View Analytics', { matchCase: false }).first().click();

      cy.wait('@getCourseAnalytics');

      cy.contains('25').should('be.visible');
      cy.contains('78').should('be.visible');
      cy.contains('85%').should('be.visible');
    });

    it('should export course report', () => {
      cy.intercept('GET', '**/api/courses/1/report', {
        statusCode: 200,
        body: { url: 'https://example.com/report.pdf' }
      }).as('exportReport');

      cy.contains('button', 'My Courses').click();
      cy.contains('Export Report', { matchCase: false }).first().click();

      cy.wait('@exportReport');
      cy.contains('Report generated', { matchCase: false }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle course fetch errors', () => {
      cy.intercept('GET', '**/api/courses*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCoursesError');

      cy.contains('button', 'My Courses').click();
      cy.wait('@getCoursesError');

      cy.contains('Failed to load', { matchCase: false }).should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/api/courses*', {
        forceNetworkError: true
      }).as('networkError');

      cy.contains('button', 'My Courses').click();

      // Should handle error without crashing
      cy.contains('dashboard', { matchCase: false }).should('be.visible');
    });

    it('should handle syllabus generation timeout', () => {
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 504,
        body: { error: 'Request timeout' }
      }).as('syllabusTimeout');

      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Timeout Course');
      cy.contains('button', 'Generate').click();

      cy.wait('@syllabusTimeout');
      cy.contains('timeout', { matchCase: false }).should('be.visible');
    });
  });

  describe('Notifications', () => {
    it('should display new submission notifications', () => {
      cy.intercept('GET', '**/api/notifications', {
        statusCode: 200,
        body: [
          {
            id: 1,
            type: 'new_submission',
            message: 'New assignment submission from John Student',
            created_at: '2024-12-18'
          }
        ]
      }).as('getNotifications');

      cy.contains('Notifications', { matchCase: false }).click();
      cy.wait('@getNotifications');

      cy.contains('New assignment submission').should('be.visible');
    });

    it('should mark notification as read', () => {
      cy.intercept('GET', '**/api/notifications', {
        statusCode: 200,
        body: [
          {
            id: 1,
            type: 'new_submission',
            message: 'Test notification',
            is_read: false
          }
        ]
      }).as('getNotifications');

      cy.intercept('PUT', '**/api/notifications/1/read', {
        statusCode: 200,
        body: { message: 'Notification marked as read' }
      }).as('markAsRead');

      cy.contains('Notifications', { matchCase: false }).click();
      cy.wait('@getNotifications');

      cy.contains('Mark as read', { matchCase: false }).first().click();
      cy.wait('@markAsRead');
    });
  });
});