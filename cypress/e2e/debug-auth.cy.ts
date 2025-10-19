describe('Debug Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should check login form elements', () => {
    // Check what's actually on the page
    cy.get('body').then(($body) => {
      cy.log('Page content:', $body.text());
    });

    // Take a screenshot for visual inspection
    cy.screenshot('login-page');

    // List all form elements
    cy.get('input, button, select, form').each(($el) => {
      cy.log(`Element: ${$el.prop('tagName')}`, 
        `type: ${$el.attr('type')}`, 
        `name: ${$el.attr('name')}`,
        `placeholder: ${$el.attr('placeholder')}`);
    });
  });

  it('should test login with console output', () => {
    // Fill the form with test credentials
    cy.get('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
      .should('be.visible')
      .type('student@test.com');
    
    cy.get('input[type="password"], input[name="password"], input[placeholder*="password" i]').first()
      .should('be.visible')
      .type('student123');

    // Click submit button
    cy.get('button[type="submit"], button').contains(/login|sign in/i).click();

    // Monitor what happens
    cy.url().then((url) => {
      cy.log(`Current URL after login attempt: ${url}`);
    });

    // Check for any error messages
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      cy.log('Page content after login attempt:', bodyText);
      
      if (bodyText.includes('error') || bodyText.includes('invalid') || bodyText.includes('fail')) {
        cy.log('ERROR DETECTED:', bodyText.match(/(error|invalid|fail)[^<\.]*/i)?.[0]);
      }
    });

    // Wait and check URL again
    cy.wait(3000);
    cy.url().then((url) => {
      cy.log(`Final URL after 3 seconds: ${url}`);
    });
  });
});