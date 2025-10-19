/// <reference types="cypress" />
// Custom command to intercept API calls
import type { Method } from 'cypress/types/net-stubbing';


// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    
    // Wait for page to fully load
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    
    // Fill in credentials
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for either dashboard or error
    cy.url({ timeout: 15000 }).then((url) => {
      if (url.includes('/dashboard')) {
        // Verify token is stored
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.exist;
          expect(win.localStorage.getItem('user')).to.exist;
        });
      } else {
        cy.log('Login may have failed - still on login page');
      }
    });
  });
});

// Custom command to login as specific role
Cypress.Commands.add('loginAs', (role: 'student' | 'lecturer' | 'admin') => {
  const credentials = {
    student: { email: 'student@test.com', password: 'student123' },
    lecturer: { email: 'lecturer@test.com', password: 'lecturer123' },
    admin: { email: 'admin@test.com', password: 'admin123' }
  };

  const cred = credentials[role];
  cy.login(cred.email, cred.password);
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
  cy.visit('/login');
});


Cypress.Commands.add('mockApiCall', (method: Method, url: string, response: any, alias?: string) => {
  cy.intercept(method, `**/api${url}`, response).as(alias || 'apiCall');
});

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(`@${alias}`);
});

// Custom command to check authentication
Cypress.Commands.add('isAuthenticated', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    const user = win.localStorage.getItem('user');
    return !!(token && user);
  });
});

// Custom command to get user role
Cypress.Commands.add('getUserRole', () => {
  cy.window().then((win) => {
    const userStr = win.localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  });
});

// Custom command to seed test data
Cypress.Commands.add('seedTestUsers', () => {
  const testUsers = [
    { email: 'student@test.com', password: 'student123', role: 'student', name: 'Test Student' },
    { email: 'lecturer@test.com', password: 'lecturer123', role: 'lecturer', name: 'Test Lecturer' },
    { email: 'admin@test.com', password: 'admin123', role: 'admin', name: 'Test Admin' }
  ];

  testUsers.forEach(user => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/auth/signup',
      body: user,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201) {
        cy.log(`✅ Created test user: ${user.email}`);
      } else if (response.status === 400 && response.body.error?.includes('exists')) {
        cy.log(`ℹ️ User already exists: ${user.email}`);
      } else {
        cy.log(`⚠️ Unexpected response for ${user.email}: ${response.status}`);
      }
    });
  });
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAs(role: 'student' | 'lecturer' | 'admin'): Chainable<void>;
      logout(): Chainable<void>;
      mockApiCall(method: Method, url: string, response: any, alias?: string): Chainable<void>;
      waitForApi(alias: string): Chainable<void>;
      isAuthenticated(): Chainable<boolean>;
      getUserRole(): Chainable<string | null>;
      seedTestUsers(): Chainable<void>;
    }
  }
}