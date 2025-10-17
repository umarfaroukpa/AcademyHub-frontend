describe('Lecturer Dashboard Tests', () => {
  beforeEach(() => {
    cy.loginAs('lecturer');
    cy.visit('/dashboard');
  });

  it('should display lecturer dashboard', () => {
    cy.contains('Lecturer Dashboard').should('be.visible');
    cy.contains('Manage your courses').should('be.visible');
  });

  it('should display Create Course button', () => {
    cy.contains('Create Course').should('be.visible');
  });

  it('should show AI Syllabus Generator', () => {
    cy.contains('AI Syllabus Generator').should('be.visible');
    cy.get('input[placeholder*="course topic"]').should('be.visible');
  });

  it('should open create course form', () => {
    cy.contains('Create Course').click();
    cy.contains('Create New Course').should('be.visible');
    cy.get('input[name="code"]').should('be.visible');
    cy.get('input[name="title"]').should('be.visible');
  });

  it('should create a new course', () => {
    // Mock create course API
    cy.intercept('POST', '**/api/courses', {
      statusCode: 201,
      body: {
        id: 1,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Learn the basics of computer science'
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
    cy.get('button[type="submit"]').click();
    cy.wait('@createCourse');

    // Verify success
    cy.contains('Course created successfully').should('be.visible');
  });

  it('should generate syllabus with AI', () => {
    // Mock AI syllabus generation
    cy.intercept('POST', '**/api/ai/syllabus', {
      statusCode: 200,
      body: {
        title: 'Syllabus for Data Structures',
        description: 'A comprehensive course on data structures',
        learning_outcomes: [
          'Understand basic data structures',
          'Implement algorithms efficiently'
        ],
        weeks: [
          {
            week: 1,
            topics: ['Introduction', 'Arrays'],
            assignments: ['Array Practice']
          }
        ],
        assessment: [
          {
            type: 'Midterm',
            weight: 30,
            description: 'Written exam'
          }
        ]
      }
    }).as('generateSyllabus');

    // Enter topic
    cy.get('input[placeholder*="course topic"]').type('Data Structures');
    cy.contains('Generate').click();

    cy.wait('@generateSyllabus');

    // Verify syllabus is displayed
    cy.contains('Syllabus for Data Structures').should('be.visible');
    cy.contains('Learning Outcomes').should('be.visible');
  });

  it('should navigate to Quick Actions tab', () => {
    cy.contains('button', 'Quick Actions').click();
    
    // Verify quick action cards
    cy.contains('Create Course').should('be.visible');
    cy.contains('Add User').should('be.visible');
    cy.contains('Generate Syllabus').should('be.visible');
  });

  it('should display My Courses tab', () => {
    // Mock courses API
    cy.intercept('GET', '**/api/courses', {
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

    cy.contains('Introduction to CS').should('be.visible');
  });

  it('should upload syllabus for course', () => {
    // Mock courses
    cy.intercept('GET', '**/api/courses', {
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

    cy.contains('button', 'My Courses').click();
    cy.wait('@getCourses');

    // Mock file upload
    cy.intercept('POST', '**/api/courses/1/syllabus', {
      statusCode: 200,
      body: { message: 'Syllabus uploaded successfully' }
    }).as('uploadSyllabus');

    // Simulate file selection
    cy.get('input[type="file"]').first().selectFile({
      contents: Cypress.Buffer.from('syllabus content'),
      fileName: 'syllabus.pdf',
      mimeType: 'application/pdf'
    }, { force: true });

    cy.wait('@uploadSyllabus');
  });

  it('should open Add User modal', () => {
    cy.contains('button', 'Quick Actions').click();
    cy.contains('Add New User').click();

    cy.contains('Add New User').should('be.visible');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
  });
});