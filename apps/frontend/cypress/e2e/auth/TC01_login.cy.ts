describe("login", () => {
    beforeEach(() => {
        cy.loginByApi(Cypress.env("users").courseStudent);
        cy.visit("/");
    });
    it("logs in", () => {
        //If login successful the avatar should be visible
        cy.get(".MuiAvatar-root").should("exist");
    });
});
