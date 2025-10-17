/// <reference types="cypress" />

  import './commands';

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Verify token is stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
      expect(win.localStorage.getItem('user')).to.exist;
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

// Custom command to intercept API calls
Cypress.Commands.add('mockApiCall', (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS', url: string, response: any, alias?: string) => {
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
    return token && user;
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

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAs(role: 'student' | 'lecturer' | 'admin'): Chainable<void>;
      logout(): Chainable<void>;
      mockApiCall(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS', url: string, response: any, alias?: string): Chainable<void>;
      waitForApi(alias: string): Chainable<void>;
      isAuthenticated(): Chainable<boolean>;
      getUserRole(): Chainable<string | null>;
    }
  }
}