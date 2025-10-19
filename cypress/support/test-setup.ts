
beforeEach(() => {
  // Clear all storage before each test
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.clearCookies();
  
  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', (err, runnable) => {
    console.error('Uncaught exception:', err);
    // Return false to prevent Cypress from failing the test
    return false;
  });

  // Log console errors
  Cypress.on('window:before:load', (win) => {
    cy.stub(win.console, 'error').callsFake((message) => {
      console.error('Console Error:', message);
    });
    
    cy.stub(win.console, 'warn').callsFake((message) => {
      console.warn('Console Warn:', message);
    });
  });
});

// Global afterEach hook
afterEach(function () {
  // Take screenshot on failure
  if (this.currentTest?.state === 'failed') {
    cy.screenshot();
  }
});