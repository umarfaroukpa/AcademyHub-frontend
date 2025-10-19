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
      
            cy.get('input[placeholder*="Search courses"], input[placeholder*="Search"]')
              .first()
              .type('Computer');
      
            cy.wait('@searchCourses');
            cy.contains('Computer Science').should('be.visible');
          });
        });
      });