describe("Visiting home page", () => {
    afterEach(() => {
        cy.logOut();
    });

    it("logs in as a student and displays the student interface", () => {
        cy.loginByApi(Cypress.env("users").courseStudent);
        cy.visit("/");
        cy.findByText("Past courses").should("exist");
        cy.findByText("Future courses").should("exist");
        cy.findByText("Completed courses").should("exist");
        cy.findByText("Create course").should("not.exist");
        cy.findByText("Import course").should("not.exist");
    });

    it("logs in as a course checker and displays the student interface", () => {
        cy.loginByApi(Cypress.env("users").courseChecker);
        cy.visit("/");
        cy.findByText("Past courses").should("exist");
        cy.findByText("Future courses").should("exist");
        cy.findByText("Completed courses").should("exist");
        cy.findByText("Create course").should("not.exist");
        cy.findByText("Import course").should("not.exist");
    });

    it("logs in as a course editor and displays the staff interface", () => {
        cy.loginByApi(Cypress.env("users").courseEditor);
        cy.visit("/");
        cy.findByText("Create course").should("not.exist");
        cy.findByText("Import course").should("not.exist");
        cy.findByText("Past courses").should("not.exist");
        cy.findByText("Future courses").should("not.exist");
        cy.findByText("Completed courses").should("not.exist");
        cy.findByText("Archived courses").should("exist");
    });
});
