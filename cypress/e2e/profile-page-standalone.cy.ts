// Define sample mock data for different roles
const studentUser = {
  id: 1,
  name: 'John Student Doe',
  email: 'john.student@test.com',
  role: 'student' as const,
  created_at: '2023-01-15T00:00:00.000Z',
  is_active: true,
  avatar_url: '/uploads/avatars/student.jpg',
  last_login: '2025-10-22T10:00:00.000Z',
};

const studentStats = {
  total_courses: 5,
  completed_courses: 3,
  active_courses: 2,
  average_grade: 85.5,
};

const lecturerUser = {
  id: 2,
  name: 'Dr. Jane Lecturer Smith',
  email: 'jane.lecturer@test.com',
  role: 'lecturer' as const,
  created_at: '2022-05-10T00:00:00.000Z',
  is_active: true,
  avatar_url: null,
  last_login: '2025-10-23T11:00:00.000Z',
};

const lecturerStats = {
  total_courses: 8,
  total_students: 150,
  active_courses: 4,
};

const adminUser = {
  id: 3,
  name: 'Admin User',
  email: 'admin.user@test.com',
  role: 'admin' as const,
  created_at: '2021-01-01T00:00:00.000Z',
  is_active: true,
  avatar_url: null,
};

const adminStats = {
  total_users: 500,
  total_courses: 100,
  pending_enrollments: 12,
};

// --- Helper Functions to Mock API & Auth ---

/**
 * Mocks the profile and stats API calls for a given role.
 */
const mockApiCalls = (user: any, stats: any) => {
  // 1. Mock /profile endpoint
  cy.intercept('GET', '**/api/profile', {
    statusCode: 200,
    body: user,
  }).as('getProfile');

  // 2. Mock Role-specific Stats endpoint
  const statsUrl = 
    user.role === 'student' ? `**/api/users/${user.id}/stats` :
    user.role === 'lecturer' ? `**/api/lecturers/${user.id}/stats` :
    user.role === 'admin' ? '**/api/admin/stats' : '404'; // Default to 404 if role is unknown
  
  cy.intercept('GET', statsUrl, {
    statusCode: 200,
    body: stats,
  }).as('getStats');
  
  // 3. Mock Avatar URL for successful image fetch
  if (user.avatar_url) {
      cy.intercept('GET', `**${user.avatar_url}`, {
        statusCode: 200,
        // Using a tiny placeholder image content
        body: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjRRAwAAAABJRU5ErkJggg==',
        headers: { 'Content-Type': 'image/png' },
      }).as('getAvatarImage');
  }
};

/**
 * Sets up local storage for authentication before visiting the page.
 */
const setupAuth = (user: any) => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', `${user.role}-test-token`);
    win.localStorage.setItem('user', JSON.stringify(user));
    win.localStorage.setItem('isAuthenticated', 'true');
  });
};


describe('Profile Page - Role and Data Integrity Tests', () => {
  beforeEach(() => {
    // Navigate to the profile page (assuming the component is at the root '/profile')
    // NOTE: You might need to adjust this URL based on your Next.js routing.
    cy.visit('/profile', { failOnStatusCode: false });
  });

  // --- STUDENT ROLE TESTS ---
  context('As a Student', () => {
    beforeEach(() => {
      setupAuth(studentUser);
      mockApiCalls(studentUser, studentStats);
      // Re-fetch the page with mocks/auth
      cy.reload(); 
      cy.wait(['@getProfile', '@getStats']);
    });

    it('should display the student user profile and stats', () => {
      // 1. Profile Information
      cy.get('h1').should('contain', 'My Profile');
      cy.contains('h3', studentUser.name).should('be.visible');
      cy.contains('span', 'Student').should('have.class', 'bg-green-100');
      cy.contains('span', studentUser.email).should('be.visible'); 
      cy.contains('span', 'Joined').should('be.visible'); // Just check "Joined" is present
      // 2. Check the Account Status section specifically for the date
      cy.get('.space-y-3').contains('span', 'Member since').siblings('span').should('contain', '2023');
      
      // 2. Avatar
      cy.get('img[alt="Profile"]').should('have.attr', 'src').and('include', studentUser.avatar_url);

      // 3. Student Stats Section
      cy.contains('h2', 'Academic Progress').should('be.visible');
      cy.contains('Total Courses').siblings('div').should('contain', studentStats.total_courses);
      cy.contains('Active Courses').siblings('div').should('contain', studentStats.active_courses);
      cy.contains('Average Grade').siblings('div').should('contain', `${studentStats.average_grade}%`);
      
      // 4. Quick Actions
      cy.contains('span', 'Browse Courses').should('be.visible');
      cy.contains('span', 'My Courses').should('be.visible');
    });
  });

  // --- LECTURER ROLE TESTS ---
  context('As a Lecturer', () => {
    beforeEach(() => {
      setupAuth(lecturerUser);
      mockApiCalls(lecturerUser, lecturerStats);
      cy.reload();
      cy.wait(['@getProfile', '@getStats']);
    });

    it('should display the lecturer profile, total students, and course stats', () => {
      // 1. Profile Information
      cy.contains('h3', lecturerUser.name).should('be.visible');
      cy.contains('span', 'Lecturer').should('have.class', 'bg-blue-100');
      
      // 2. Avatar Placeholder (since avatar_url is null)
      cy.get('img[alt="Profile"]').should('not.exist');
      cy.contains('div', lecturerUser.name.charAt(0)).should('have.class', 'rounded-full');

      // 3. Lecturer Stats Section
      cy.contains('h2', 'Teaching Overview').should('be.visible');
      cy.contains('Total Courses').siblings('div').should('contain', lecturerStats.total_courses);
      cy.contains('Active Courses').siblings('div').should('contain', lecturerStats.active_courses);
      cy.contains('Total Students').siblings('div').should('contain', lecturerStats.total_students);

      // 4. Quick Actions
      cy.contains('span', 'My Courses').should('be.visible');
      cy.contains('span', 'Create Course').should('be.visible');
    });
  });

  // --- ADMIN ROLE TESTS ---
  context('As an Admin', () => {
    beforeEach(() => {
      setupAuth(adminUser);
      mockApiCalls(adminUser, adminStats);
      cy.reload();
      cy.wait(['@getProfile', '@getStats']);
    });

    it('should display the admin profile and system overview stats', () => {
      // 1. Profile Information
      cy.contains('h3', adminUser.name).should('be.visible');
      cy.contains('span', 'Administrator').should('have.class', 'bg-red-100');
      
      // 2. Admin Stats Section
      cy.contains('h2', 'System Overview').should('be.visible');
      cy.contains('Total Users').siblings('div').should('contain', adminStats.total_users);
      cy.contains('Total Courses').siblings('div').should('contain', adminStats.total_courses);
      cy.contains('Pending Enrollments').siblings('div').should('contain', adminStats.pending_enrollments);
      
      // 3. Quick Actions
      cy.contains('span', 'Admin Dashboard').should('be.visible');
      cy.contains('span', 'Manage Courses').should('be.visible');
    });
  });
});



describe('Profile Page - Interaction and Error Handling Tests', () => {
  beforeEach(() => {
    setupAuth(studentUser);
    mockApiCalls(studentUser, studentStats);
    cy.visit('/profile', { failOnStatusCode: false });
    cy.wait(['@getProfile', '@getStats']);
  });

  it('should allow the user to edit and save profile information', () => {
    const newName = 'New John Doe';
    const newEmail = 'new.john.doe@test.com';

    // 1. Click Edit
    cy.contains('button', 'Edit Profile').click();
    cy.contains('button', 'Save').should('be.visible');

    // 2. Enter new values
    cy.get('input[type="text"]').clear().type(newName);
    cy.get('input[type="email"]').clear().type(newEmail);

    // 3. Mock the PUT request
    cy.intercept('PUT', '**/api/profile', {
      statusCode: 200,
      body: { ...studentUser, name: newName, email: newEmail, avatar_url: null }, // Avatar removed for clean mock
    }).as('saveProfile');

    // 4. Click Save
    cy.contains('button', 'Save').click();
    cy.wait('@saveProfile').its('request.body').should('deep.equal', { name: newName, email: newEmail });

    // 5. Verify view mode and updated info
    cy.contains('button', 'Edit Profile').should('be.visible');
    cy.contains('h3', newName).should('be.visible');
    cy.contains('span', newEmail).should('be.visible');
  });

  it('should allow the user to cancel editing', () => {
    // 1. Click Edit
    cy.contains('button', 'Edit Profile').click();

    // 2. Change values
    cy.get('input[type="text"]').clear().type('Temporary Name');

    // 3. Click Cancel
    cy.contains('button', 'Cancel').click();

    // 4. Verify original values are restored and view mode is active
    cy.contains('h3', studentUser.name).should('be.visible');
    cy.contains('button', 'Edit Profile').should('be.visible');
  });

  it('should display an error message on profile save failure', () => {
    // 1. Click Edit
    cy.contains('button', 'Edit Profile').click();
    
    // 2. Mock PUT request to fail
    cy.intercept('PUT', '**/api/profile', {
      statusCode: 400,
      body: { error: 'Invalid name format' },
    }).as('failSaveProfile');

    // 3. Click Save
    cy.contains('button', 'Save').click();
    cy.wait('@failSaveProfile');

    // 4. Verify error is displayed and still in edit mode
    cy.contains('Invalid name format').should('be.visible');
    cy.contains('button', 'Save').should('be.visible');
  });
});



describe('Profile Page - Avatar Management Tests', () => {
    beforeEach(() => {
        setupAuth(lecturerUser); // Lecturer starts without an avatar
        mockApiCalls(lecturerUser, lecturerStats);
        cy.visit('/profile', { failOnStatusCode: false });
        cy.wait(['@getProfile', '@getStats']);
    });

    it('should allow the user to upload a new avatar', () => {
        const newAvatarUrl = '/uploads/avatars/new-lecturer.png';

        // 1. Mock POST request for avatar upload
        cy.intercept('POST', '**/api/profile/avatar', {
            statusCode: 200,
            body: { ...lecturerUser, avatar_url: newAvatarUrl },
        }).as('uploadAvatar');
        
       // 2. Create a mock file
    cy.fixture('test-image.png', 'base64').then(base64String => {
       // 🛑 CRITICAL FIX: Convert the Base64 string into a Cypress Buffer object.
       const fileBuffer = Cypress.Buffer.from(base64String, 'base64');

    cy.get('input[type="file"]').selectFile({
        contents: fileBuffer, // Pass the Buffer object as the contents
        fileName: 'test-image.png',
        mimeType: 'image/png'
    }, { force: true });
});

        // 3. Wait for the upload request
        cy.wait('@uploadAvatar');

        // 4. Verify the new avatar is displayed and the 'Remove photo' button appears
        cy.get('img[alt="Profile"]').should('have.attr', 'src').and('include', newAvatarUrl);
        cy.contains('button', 'Remove photo').should('be.visible');
    });
    
    it('should allow the user to remove an existing avatar', () => {
        // Set user with an existing avatar for this specific test
        const lecturerWithAvatar = { ...lecturerUser, avatar_url: '/uploads/avatars/existing.png' };
        setupAuth(lecturerWithAvatar);
        mockApiCalls(lecturerWithAvatar, lecturerStats);
        cy.reload(); // Reload with avatar-enabled user
        cy.wait('@getProfile');

        // 1. Verify 'Remove photo' button is visible
        cy.contains('button', 'Remove photo').should('be.visible');

        // 2. Mock DELETE request for avatar removal
        cy.intercept('DELETE', '**/api/profile/avatar', {
            statusCode: 200,
            body: { ...lecturerUser, avatar_url: null }, // Response with null avatar
        }).as('removeAvatar');

        // 3. Click remove
        cy.contains('button', 'Remove photo').click();
        cy.wait('@removeAvatar');

        // 4. Verify the avatar is gone (placeholder or initial logic appears)
        cy.get('img[alt="Profile"]').should('not.exist');
        cy.contains('button', 'Remove photo').should('not.exist');
        cy.contains('div', lecturerUser.name.charAt(0)).should('be.visible');
    });
});