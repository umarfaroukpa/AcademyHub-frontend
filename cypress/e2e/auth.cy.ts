describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should load login page', () => {
    cy.contains('Welcome Back').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should login with valid credentials - Student', () => {
    cy.get('input[type="email"]').type('student@test.com');
    cy.get('input[type="password"]').type('student123');
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.url().should('include', '/dashboard');
    
    // Verify user data is stored
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      expect(user.role).to.equal('student');
    });
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains('Login failed').should('be.visible');
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should toggle password visibility', () => {
    cy.get('input[type="password"]').should('exist');
    cy.contains('Show').click();
    cy.get('input[type="text"]').should('exist');
    cy.contains('Hide').click();
    cy.get('input[type="password"]').should('exist');
  });

  it('should navigate to signup page', () => {
    cy.contains('Click Here to Register').click();
    cy.url().should('include', '/signup');
  });

  it('should use quick login buttons', () => {
    // Test student quick login
    cy.contains('Student').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });
});

describe('Signup Tests', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should load signup page', () => {
    cy.contains('Create Your Account').should('be.visible');
  });

  it('should validate form fields', () => {
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('Name is required').should('be.visible');
  });

  it('should validate email format', () => {
    cy.get('input[name="email"]').type('invalidemail');
    cy.get('input[name="password"]').click(); // Trigger validation
    cy.contains('valid email').should('be.visible');
  });

  it('should validate password strength', () => {
    cy.get('input[name="password"]').type('weak');
    cy.get('button[type="submit"]').click();
    cy.contains('at least 8 characters').should('be.visible');
  });

  it('should match passwords', () => {
    cy.get('input[name="password"]').type('StrongPass123');
    cy.get('input[name="confirmPassword"]').type('DifferentPass123');
    cy.get('button[type="submit"]').click();
    cy.contains('do not match').should('be.visible');
  });
});