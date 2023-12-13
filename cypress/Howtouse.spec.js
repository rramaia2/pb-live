// cypress/Howtouse.spec.js

describe('Howtouse Page', () => {
    it('loads successfully', () => {
      cy.visit('/Howtouse');
      cy.contains('How to use Personal Budget App');
    });
  });