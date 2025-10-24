import { setupDashboard } from '../support/dashbaord-helpers';


describe('Admin Dashboard Tests', () => {
  beforeEach(() => {
    // Handle any uncaught exceptions
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Failed to load chunk')) {
        return false;
      }
      return true;
    });

    cy.loginAs('admin');
    cy.visit('/dashboard');
  });

  describe('Dashboard Overview', () => {
    it('should display admin dashboard header', () => {
      cy.contains('Admin Dashboard', { timeout: 10000 }).should('be.visible');
      cy.contains('Complete system administration', { matchCase: false }).should('be.visible');
    });

    it('should display navigation tabs', () => {
      cy.contains('button', 'Overview').should('be.visible');
      cy.contains('button', 'Users').should('be.visible');
      cy.contains('button', 'Courses').should('be.visible');
      cy.contains('button', 'Enrollments').should('be.visible');
    });

    it('should display system statistics', () => {
      cy.contains('Total Students', { matchCase: false }).should('be.visible');
      cy.contains('Total Lecturers', { matchCase: false }).should('be.visible');
      cy.contains('Total Courses', { matchCase: false }).should('be.visible');
      cy.contains('Pending Enrollments', { matchCase: false }).should('be.visible');
    });

    it('should switch between tabs successfully', () => {
      // Click Users tab
      cy.contains('button', 'Users').click();
      cy.contains('User Management', { timeout: 5000 }).should('be.visible');

      // Click Courses tab
      cy.contains('button', 'Courses').click();
      cy.contains('Course Management', { timeout: 5000 }).should('be.visible');

      // Click Enrollments tab
      cy.contains('button', 'Enrollments').click();
      cy.contains('Enrollment Management', { timeout: 5000 }).should('be.visible');

      // Return to Overview
      cy.contains('button', 'Overview').click();
      cy.contains('Quick Actions', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      cy.contains('button', 'Users').click();
    });

    it('should display user management interface', () => {
      cy.contains('User Management').should('be.visible');
      cy.contains('Add User', { matchCase: false }).should('be.visible');
    });

    it('should display users list', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'John Student',
            email: 'john@student.com',
            role: 'student',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'Jane Lecturer',
            email: 'jane@lecturer.com',
            role: 'lecturer',
            is_active: true,
            created_at: '2024-01-02T00:00:00Z'
          },
          {
            id: 3,
            name: 'Bob Admin',
            email: 'bob@admin.com',
            role: 'admin',
            is_active: true,
            created_at: '2024-01-03T00:00:00Z'
          }
        ]
      }).as('getUsers');

      cy.wait('@getUsers');

      cy.contains('John Student').should('be.visible');
      cy.contains('Jane Lecturer').should('be.visible');
      cy.contains('Bob Admin').should('be.visible');
      cy.contains('student').should('be.visible');
      cy.contains('lecturer').should('be.visible');
    });

    it('should open Add User modal', () => {
      cy.contains('Add User', { matchCase: false }).click();
      cy.contains('Add New User').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('select[name="role"]').should('be.visible');
    });

    it('should create a new user successfully', () => {
      cy.intercept('POST', '**/api/admin/users', {
        statusCode: 201,
        body: {
          id: 4,
          name: 'New User',
          email: 'new@user.com',
          role: 'student',
          is_active: true
        }
      }).as('createUser');

      cy.contains('Add User', { matchCase: false }).click();

      // Fill user form
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type('new@user.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('select[name="role"]').select('student');

      cy.get('button[type="submit"]').click();
      cy.wait('@createUser');

      cy.contains('User created', { matchCase: false }).should('be.visible');
    });

    it('should validate user form inputs', () => {
      cy.contains('Add User', { matchCase: false }).click();

      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      cy.contains('required', { matchCase: false }).should('be.visible');

      // Test email validation
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.contains('valid email', { matchCase: false }).should('be.visible');

      // Test password length
      cy.get('input[name="email"]').clear().type('test@email.com');
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.contains('at least', { matchCase: false }).should('be.visible');
    });

    it('should edit user details', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'Test User',
            email: 'test@user.com',
            role: 'student',
            is_active: true,
            created_at: '2024-01-01'
          }
        ]
      }).as('getUsers');

      cy.intercept('PUT', '**/api/admin/users/1', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Updated User',
          email: 'updated@user.com',
          role: 'lecturer'
        }
      }).as('updateUser');

      cy.wait('@getUsers');

      cy.contains('Edit', { matchCase: false }).first().click();

      cy.get('input[name="name"]').clear().type('Updated User');
      cy.get('input[name="email"]').clear().type('updated@user.com');
      cy.get('select[name="role"]').select('lecturer');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateUser');
      cy.contains('User updated', { matchCase: false }).should('be.visible');
    });

    it('should toggle user active status', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'Test User',
            email: 'test@user.com',
            role: 'student',
            is_active: true,
            created_at: '2024-01-01'
          }
        ]
      }).as('getUsers');

      cy.intercept('PATCH', '**/api/admin/users/1/status', {
        statusCode: 200,
        body: { 
          message: 'User deactivated successfully',
          is_active: false
        }
      }).as('toggleStatus');

      cy.wait('@getUsers');

      cy.contains('Deactivate', { matchCase: false }).click();
      cy.wait('@toggleStatus');
      cy.contains('User deactivated', { matchCase: false }).should('be.visible');
    });

    it('should delete user', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'User to Delete',
            email: 'delete@user.com',
            role: 'student',
            is_active: true
          }
        ]
      }).as('getUsers');

      cy.intercept('DELETE', '**/api/admin/users/1', {
        statusCode: 200,
        body: { message: 'User deleted successfully' }
      }).as('deleteUser');

      cy.wait('@getUsers');

      // Mock confirm dialog
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.contains('Delete', { matchCase: false }).first().click();
      cy.wait('@deleteUser');

      cy.contains('User deleted', { matchCase: false }).should('be.visible');
    });

    it('should search users', () => {
      cy.intercept('GET', '**/api/admin/users*search=search*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'Search Test User',
            email: 'search@test.com',
            role: 'lecturer',
            is_active: true,
            created_at: '2024-01-01'
          }
        ]
      }).as('searchUsers');

      cy.get('input[placeholder*="Search users"], input[placeholder*="Search"]')
        .first()
        .type('Search Test');

      cy.wait('@searchUsers');
      cy.contains('Search Test User').should('be.visible');
    });

    it('should filter users by role', () => {
      cy.intercept('GET', '**/api/admin/users*role=student*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            name: 'Student Only',
            email: 'student@test.com',
            role: 'student',
            is_active: true
          }
        ]
      }).as('filterUsers');

      cy.get('select[name="role"], [role="combobox"]').first().then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select('student');
        }
      });

      cy.wait('@filterUsers');
      cy.contains('Student Only').should('be.visible');
    });

    it('should handle user creation errors', () => {
      cy.intercept('POST', '**/api/admin/users', {
        statusCode: 400,
        body: {
          error: 'Email already exists'
        }
      }).as('createUserError');

      cy.contains('Add User', { matchCase: false }).click();

      cy.get('input[name="name"]').type('Duplicate User');
      cy.get('input[name="email"]').type('existing@user.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('select[name="role"]').select('student');
      cy.get('button[type="submit"]').click();

      cy.wait('@createUserError');
      cy.contains('already exists', { matchCase: false }).should('be.visible');
    });
  });

  describe('Course Management', () => {
    beforeEach(() => {
      cy.contains('button', 'Courses').click();
    });

    it('should display course management interface', () => {
      cy.contains('Course Management').should('be.visible');
      cy.contains('Create Course', { matchCase: false }).should('be.visible');
    });

    it('should display courses list', () => {
      cy.intercept('GET', '**/api/admin/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Learn programming basics',
            lecturer_name: 'Dr. Smith',
            credits: 3,
            enrolled_students: 25
          },
          {
            id: 2,
            code: 'MATH201',
            title: 'Advanced Mathematics',
            description: 'Advanced math topics',
            lecturer_name: 'Prof. Johnson',
            credits: 4,
            enrolled_students: 30
          }
        ]
      }).as('getCourses');

      cy.wait('@getCourses');

      cy.contains('Introduction to Computer Science').should('be.visible');
      cy.contains('Advanced Mathematics').should('be.visible');
      cy.contains('CS101').should('be.visible');
      cy.contains('Dr. Smith').should('be.visible');
    });

    it('should create a new course', () => {
      // Mock lecturers for dropdown
      cy.intercept('GET', '**/api/admin/lecturers', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Dr. Smith' },
          { id: 2, name: 'Prof. Johnson' }
        ]
      }).as('getLecturers');

      cy.intercept('POST', '**/api/admin/courses', {
        statusCode: 201,
        body: {
          id: 3,
          code: 'PHYS101',
          title: 'Physics Fundamentals',
          description: 'Basic physics concepts',
          credits: 3,
          lecturer_id: 1
        }
      }).as('createCourse');

      cy.contains('Create Course', { matchCase: false }).click();
      cy.wait('@getLecturers');

      // Fill course form
      cy.get('input[name="code"]').type('PHYS101');
      cy.get('input[name="title"]').type('Physics Fundamentals');
      cy.get('textarea[name="description"]').type('Basic physics concepts');
      cy.get('input[name="credits"]').clear().type('3');
      cy.get('select[name="lecturer_id"]').select('1');

      cy.get('button[type="submit"]').click();
      cy.wait('@createCourse');

      cy.contains('Course created', { matchCase: false }).should('be.visible');
    });

    it('should validate course form inputs', () => {
      cy.contains('Create Course', { matchCase: false }).click();

      // Test required fields
      cy.get('button[type="submit"]').click();
      cy.contains('required', { matchCase: false }).should('be.visible');

      // Test credit range
      cy.get('input[name="code"]').type('TEST101');
      cy.get('input[name="title"]').type('Test Course');
      cy.get('input[name="credits"]').clear().type('0');
      cy.get('button[type="submit"]').click();
      cy.contains('greater than', { matchCase: false }).should('be.visible');

      cy.get('input[name="credits"]').clear().type('11');
      cy.get('button[type="submit"]').click();
      cy.contains('less than', { matchCase: false }).should('be.visible');
    });

    it('should edit course details', () => {
      cy.intercept('GET', '**/api/admin/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Old Title',
            description: 'Old description',
            lecturer_name: 'Dr. Smith',
            credits: 3
          }
        ]
      }).as('getCourses');

      cy.intercept('PUT', '**/api/admin/courses/1', {
        statusCode: 200,
        body: {
          id: 1,
          code: 'CS101',
          title: 'Updated Title',
          description: 'Updated description'
        }
      }).as('updateCourse');

      cy.wait('@getCourses');

      cy.contains('Edit', { matchCase: false }).first().click();

      cy.get('input[name="title"]').clear().type('Updated Title');
      cy.get('textarea[name="description"]').clear().type('Updated description');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateCourse');
      cy.contains('Course updated', { matchCase: false }).should('be.visible');
    });

    it('should delete a course', () => {
      cy.intercept('GET', '**/api/admin/courses*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'DELETE101',
            title: 'Course to Delete',
            description: 'This course will be deleted',
            lecturer_name: 'Dr. Delete',
            credits: 3
          }
        ]
      }).as('getCourses');

      cy.intercept('DELETE', '**/api/admin/courses/1', {
        statusCode: 200,
        body: { message: 'Course deleted successfully' }
      }).as('deleteCourse');

      cy.wait('@getCourses');

      // Mock confirm dialog
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.contains('Delete', { matchCase: false }).first().click();
      cy.wait('@deleteCourse');

      cy.contains('Course deleted', { matchCase: false }).should('be.visible');
    });

    it('should view course details and enrollments', () => {
      cy.intercept('GET', '**/api/admin/courses*', {
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

      cy.intercept('GET', '**/api/admin/courses/1', {
        statusCode: 200,
        body: {
          id: 1,
          code: 'CS101',
          title: 'Introduction to CS',
          enrolled_students: [
            { id: 1, name: 'Student 1', email: 'student1@test.com' },
            { id: 2, name: 'Student 2', email: 'student2@test.com' }
          ]
        }
      }).as('getCourseDetails');

      cy.wait('@getCourses');

      cy.contains('View Details', { matchCase: false }).first().click();
      cy.wait('@getCourseDetails');

      cy.contains('Student 1').should('be.visible');
      cy.contains('Student 2').should('be.visible');
    });

    it('should search courses', () => {
      cy.intercept('GET', '**/api/admin/courses*search=Computer*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            code: 'CS101',
            title: 'Computer Science',
            description: 'CS course',
            lecturer_name: 'Dr. Smith',
            credits: 3
          }
        ]
      }).as('searchCourses');

      cy.get('input[placeholder*="Search"], input[type="search"]')
        .first()
        .type('Computer');

      cy.wait('@searchCourses');
      cy.contains('Computer Science').should('be.visible');
    });
  });

  describe('Enrollment Management', () => {
    beforeEach(() => {
      cy.contains('button', 'Enrollments').click();
    });

    it('should display enrollment management interface', () => {
      cy.contains('Enrollment Management').should('be.visible');
    });

    it('should display enrollments list', () => {
      cy.intercept('GET', '**/api/admin/enrollments*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'John Doe',
            course_name: 'Introduction to CS',
            status: 'pending',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            student_name: 'Jane Smith',
            course_name: 'Data Structures',
            status: 'active',
            created_at: '2024-01-02T00:00:00Z'
          }
        ]
      }).as('getEnrollments');

      cy.wait('@getEnrollments');

      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
      cy.contains('Introduction to CS').should('be.visible');
      cy.contains('pending').should('be.visible');
    });

    it('should approve enrollment', () => {
      cy.intercept('GET', '**/api/admin/enrollments*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Jane Smith',
            course_name: 'Math 101',
            status: 'pending',
            created_at: '2024-01-01'
          }
        ]
      }).as('getPendingEnrollments');

      cy.intercept('PUT', '**/api/admin/enrollments/1', {
        statusCode: 200,
        body: { message: 'Enrollment approved successfully' }
      }).as('approveEnrollment');

      cy.wait('@getPendingEnrollments');

      cy.contains('Approve', { matchCase: false }).click();
      cy.wait('@approveEnrollment');

      cy.contains('Enrollment approved', { matchCase: false }).should('be.visible');
    });

    it('should reject enrollment', () => {
      cy.intercept('GET', '**/api/admin/enrollments*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Bob Johnson',
            course_name: 'Physics 201',
            status: 'pending',
            created_at: '2024-01-01'
          }
        ]
      }).as('getEnrollmentsForReject');

      cy.intercept('PUT', '**/api/admin/enrollments/1', {
        statusCode: 200,
        body: { message: 'Enrollment rejected successfully' }
      }).as('rejectEnrollment');

      cy.wait('@getEnrollmentsForReject');

      cy.contains('Reject', { matchCase: false }).click();
      cy.wait('@rejectEnrollment');

      cy.contains('Enrollment rejected', { matchCase: false }).should('be.visible');
    });

    it('should mark enrollment as completed', () => {
      cy.intercept('GET', '**/api/admin/enrollments*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Alice Brown',
            course_name: 'Chemistry 101',
            status: 'active',
            created_at: '2024-01-01'
          }
        ]
      }).as('getActiveEnrollments');

      cy.intercept('PUT', '**/api/admin/enrollments/1', {
        statusCode: 200,
        body: { message: 'Enrollment completed successfully' }
      }).as('completeEnrollment');

      cy.wait('@getActiveEnrollments');

      cy.contains('Complete', { matchCase: false }).click();
      cy.wait('@completeEnrollment');

      cy.contains('Enrollment completed', { matchCase: false }).should('be.visible');
    });

    it('should filter enrollments by status', () => {
      cy.intercept('GET', '**/api/admin/enrollments*status=pending*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Pending Student',
            course_name: 'Test Course',
            status: 'pending',
            created_at: '2024-01-01'
          }
        ]
      }).as('filterEnrollments');

      cy.get('select[name="status"], [role="combobox"]').first().then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select('pending');
        }
      });

      cy.wait('@filterEnrollments');
      cy.contains('Pending Student').should('be.visible');
    });
  });

  describe('AI Syllabus Generator', () => {
    it('should display AI Syllabus Generator', () => {
      cy.contains('AI Syllabus Generator').should('be.visible');
      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .should('be.visible');
    });

    it('should generate syllabus with AI', () => {
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 200,
        body: {
          title: 'Syllabus for Advanced Programming',
          description: 'Advanced programming concepts',
          learning_outcomes: [
            'Master advanced algorithms',
            'Understand software architecture'
          ],
          weeks: [
            {
              week: 1,
              topics: ['Review', 'Advanced Data Structures'],
              assignments: ['Algorithm Analysis']
            }
          ],
          assessment: [
            {
              type: 'Project',
              weight: 40,
              description: 'Final project'
            }
          ]
        }
      }).as('generateSyllabus');

      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Advanced Programming');
      cy.contains('button', 'Generate').click();

      cy.wait('@generateSyllabus');

      cy.contains('Syllabus for Advanced Programming').should('be.visible');
      cy.contains('Learning Outcomes').should('be.visible');
    });

    it('should handle syllabus generation errors', () => {
      cy.intercept('POST', '**/api/ai/syllabus', {
        statusCode: 500,
        body: { error: 'AI service unavailable' }
      }).as('generateSyllabusError');

      cy.get('input[placeholder*="course topic"], input[placeholder*="topic"]')
        .type('Error Course');
      cy.contains('button', 'Generate').click();

      cy.wait('@generateSyllabusError');
      cy.contains('Failed', { matchCase: false }).should('be.visible');
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', () => {
      cy.contains('Quick Actions').should('be.visible');
      cy.contains('Add User', { matchCase: false }).should('be.visible');
      cy.contains('Create Course', { matchCase: false }).should('be.visible');
    });

    it('should open Add User modal from quick actions', () => {
      cy.contains('Add User', { matchCase: false }).first().click();
      cy.contains('Add New User').should('be.visible');
    });

    it('should open Create Course modal from quick actions', () => {
      cy.contains('Create Course', { matchCase: false }).first().click();
      cy.contains('Create New Course').should('be.visible');
    });
  });

  describe('System Statistics', () => {
    it('should display accurate statistics', () => {
      cy.intercept('GET', '**/api/admin/statistics', {
        statusCode: 200,
        body: {
          total_students: 150,
          total_lecturers: 25,
          total_courses: 45,
          pending_enrollments: 12
        }
      }).as('getStatistics');

      cy.visit('/dashboard');
      cy.wait('@getStatistics');

      cy.contains('150').should('be.visible');
      cy.contains('25').should('be.visible');
      cy.contains('45').should('be.visible');
      cy.contains('12').should('be.visible');
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk approve enrollments', () => {
      cy.intercept('GET', '**/api/admin/enrollments*', {
        statusCode: 200,
        body: [
          { id: 1, student_name: 'Student 1', course_name: 'Course 1', status: 'pending' },
          { id: 2, student_name: 'Student 2', course_name: 'Course 2', status: 'pending' }
        ]
      }).as('getBulkEnrollments');

      cy.intercept('POST', '**/api/admin/enrollments/bulk-approve', {
        statusCode: 200,
        body: { message: 'Enrollments approved successfully' }
      }).as('bulkApprove');

      cy.contains('button', 'Enrollments').click();
      cy.wait('@getBulkEnrollments');

      // Select multiple enrollments
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').eq(1).check();

      cy.contains('Bulk Approve', { matchCase: false }).click();
      cy.wait('@bulkApprove');

      cy.contains('Enrollments approved', { matchCase: false }).should('be.visible');
    });

    it('should bulk delete users', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: [
          { id: 1, name: 'User 1', email: 'user1@test.com', role: 'student' },
          { id: 2, name: 'User 2', email: 'user2@test.com', role: 'student' }
        ]
      }).as('getBulkUsers');

      cy.intercept('POST', '**/api/admin/users/bulk-delete', {
        statusCode: 200,
        body: { message: 'Users deleted successfully' }
      }).as('bulkDelete');

      cy.contains('button', 'Users').click();
      cy.wait('@getBulkUsers');

      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').eq(1).check();

      cy.contains('Bulk Delete', { matchCase: false }).click();
      cy.wait('@bulkDelete');

      cy.contains('Users deleted', { matchCase: false }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle users API errors gracefully', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getUsersError');

      cy.contains('button', 'Users').click();
      cy.wait('@getUsersError');

      cy.contains('Failed to load', { matchCase: false }).should('be.visible');
    });

    it('should handle courses API errors', () => {
      cy.intercept('GET', '**/api/admin/courses*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCoursesError');

      cy.contains('button', 'Courses').click();
      cy.wait('@getCoursesError');

      cy.contains('Failed to load', { matchCase: false }).should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '**/api/admin/courses*', { 
        forceNetworkError: true 
      }).as('networkError');

      cy.contains('button', 'Courses').click();
      cy.get('body').should('be.visible');
    });

    it('should handle empty states', () => {
      cy.intercept('GET', '**/api/admin/users*', {
        statusCode: 200,
        body: []
      }).as('getEmptyUsers');

      cy.contains('button', 'Users').click();
      cy.wait('@getEmptyUsers');

      cy.contains('No users found', { matchCase: false }).should('be.visible');
    });
  });

  describe('Data Validation', () => {
    it('should validate user form inputs', () => {
      cy.contains('button', 'Users').click();
      cy.contains('Add User', { matchCase: false }).click();

      // Test required fields
      cy.get('button[type="submit"]').click();
      cy.contains('required', { matchCase: false }).should('be.visible');

      // Test email validation
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.contains('valid email', { matchCase: false }).should('be.visible');

      // Test password length
      cy.get('input[name="email"]').clear().type('valid@email.com');
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.contains('at least', { matchCase: false }).should('be.visible');
    });

    it('should validate course form inputs', () => {
      cy.contains('button', 'Courses').click();
      cy.contains('Create Course', { matchCase: false }).click();

      // Test required fields
      cy.get('button[type="submit"]').click();
      cy.contains('required', { matchCase: false }).should('be.visible');

      // Test credit range
      cy.get('input[name="code"]').type('TEST101');
      cy.get('input[name="title"]').type('Test Course');
      cy.get('input[name="credits"]').clear().type('0');
      cy.get('button[type="submit"]').click();
      cy.contains('greater than', { matchCase: false }).should('be.visible');

      cy.get('input[name="credits"]').clear().type('11');
      cy.get('button[type="submit"]').click();
      cy.contains('less than', { matchCase: false }).should('be.visible');
    });
  });

  describe('Export and Reports', () => {
    it('should export users list', () => {
      cy.intercept('GET', '**/api/admin/users/export', {
        statusCode: 200,
        body: { url: 'https://example.com/users.csv' }
      }).as('exportUsers');

      cy.contains('button', 'Users').click();
      cy.contains('Export', { matchCase: false }).click();

      cy.wait('@exportUsers');
      cy.contains('Export successful', { matchCase: false }).should('be.visible');
    });

    it('should generate system report', () => {
      cy.intercept('GET', '**/api/admin/reports/system', {
        statusCode: 200,
        body: { url: 'https://example.com/report.pdf' }
      }).as('generateReport');

      cy.contains('Generate Report', { matchCase: false }).click();
      cy.wait('@generateReport');

      cy.contains('Report generated', { matchCase: false }).should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    it('should search across all entities', () => {
      cy.intercept('GET', '**/api/admin/search*', {
        statusCode: 200,
        body: {
          users: [{ id: 1, name: 'Test User', type: 'user' }],
          courses: [{ id: 1, title: 'Test Course', type: 'course' }]
        }
      }).as('globalSearch');

      cy.get('input[placeholder*="Search"], input[type="search"]')
        .first()
        .type('Test');

      cy.wait('@globalSearch');
      cy.contains('Test User').should('be.visible');
      cy.contains('Test Course').should('be.visible');
    });

    it('should filter by date range', () => {
      cy.intercept('GET', '**/api/admin/enrollments*from=*to=*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            student_name: 'Filtered Student',
            course_name: 'Filtered Course',
            status: 'active',
            created_at: '2024-01-15'
          }
        ]
      }).as('filterByDate');

      cy.contains('button', 'Enrollments').click();
      
      cy.get('input[name="from_date"]').type('2024-01-01');
      cy.get('input[name="to_date"]').type('2024-01-31');
      cy.contains('Apply Filter', { matchCase: false }).click();

      cy.wait('@filterByDate');
      cy.contains('Filtered Student').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should paginate users list', () => {
      cy.intercept('GET', '**/api/admin/users*page=1*', {
        statusCode: 200,
        body: [
          { id: 1, name: 'User 1', email: 'user1@test.com', role: 'student' }
        ],
        headers: {
          'x-total-count': '50',
          'x-total-pages': '5'
        }
      }).as('getUsersPage1');

      cy.intercept('GET', '**/api/admin/users*page=2*', {
        statusCode: 200,
        body: [
          { id: 11, name: 'User 11', email: 'user11@test.com', role: 'student' }
        ]
      }).as('getUsersPage2');

      cy.contains('button', 'Users').click();
      cy.wait('@getUsersPage1');

      cy.contains('Next', { matchCase: false }).click();
      cy.wait('@getUsersPage2');

      cy.contains('User 11').should('be.visible');
    });
  });

  describe('Notifications and Alerts', () => {
    it('should display system notifications', () => {
      cy.intercept('GET', '**/api/admin/notifications', {
        statusCode: 200,
        body: [
          {
            id: 1,
            type: 'warning',
            message: 'System maintenance scheduled',
            created_at: '2024-12-18'
          }
        ]
      }).as('getNotifications');

      cy.contains('Notifications', { matchCase: false }).click();
      cy.wait('@getNotifications');

      cy.contains('System maintenance scheduled').should('be.visible');
    });

    it('should dismiss notification', () => {
      cy.intercept('GET', '**/api/admin/notifications', {
        statusCode: 200,
        body: [
          {
            id: 1,
            type: 'info',
            message: 'Test notification'
          }
        ]
      }).as('getNotificationsList');

      cy.intercept('DELETE', '**/api/admin/notifications/1', {
        statusCode: 200,
        body: { message: 'Notification dismissed' }
      }).as('dismissNotification');

      cy.contains('Notifications', { matchCase: false }).click();
      cy.wait('@getNotificationsList');

      cy.contains('Dismiss', { matchCase: false }).first().click();
      cy.wait('@dismissNotification');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').type('{tab}');
      cy.focused().should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.get('button').first().should('have.attr', 'aria-label');
    });
  });
});