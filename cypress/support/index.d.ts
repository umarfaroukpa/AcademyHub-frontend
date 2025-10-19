// cypress/support/index.d.ts

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login with email and password
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>

    /**
     * Custom command to login as specific role
     * @example cy.loginAs('student')
     */
    loginAs(role: 'student' | 'lecturer' | 'admin'): Chainable<void>

    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<void>

    /**
     * Custom command to check if user is logged in
     * @example cy.isLoggedIn()
     */
    isLoggedIn(): Chainable<boolean>

    /**
     * Custom command to handle login with retry
     * @example cy.loginWithRetry('user@test.com', 'password123')
     */
    loginWithRetry(email: string, password: string, retries?: number): Chainable<void>

    /**
     * Custom command to mock API calls
     * @example cy.mockApiCall('GET', '/users', { users: [] })
     */
    mockApiCall(method: string, url: string, response: any, alias?: string): Chainable<void>

    /**
     * Custom command to wait for API response
     * @example cy.waitForApi('getUsers')
     */
    waitForApi(alias: string): Chainable<void>

    /**
     * Custom command to get user role
     * @example cy.getUserRole()
     */
    getUserRole(): Chainable<string | null>
  }
}