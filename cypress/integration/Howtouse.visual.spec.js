describe('Howtouse Page - Visual Test', () => {
    it('should match the baseline', () => {
      cy.eyesOpen({
        appName: 'Personal Budget App',
        testName: 'Howtouse Page',
      });
  
      cy.visit('/Howtouse');
      cy.eyesCheckWindow();
  
      cy.eyesClose();
    });
  });