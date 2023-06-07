describe("deleteCourse", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseToBeDeleted = Cypress.env("courseToBeCreated");
    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit("/");
    });
    it("clicks course menu and deletes course", () => {
        cy.getBySel(`courseCard_Copy ${courseToBeDeleted?.title}`).within(
            () => {
                cy.getBySel("courseMenuButton").click();
            }
        );
        cy.getBySel("archiveCourseMenuItem").should("not.exist");
        cy.getBySel("deleteCourseMenuItem").click();
        cy.getBySel("deleteCourseDialogSubmit").click();

        cy.getBySel("toast").should("exist");
        cy.getBySel(`courseCard_Copy ${courseToBeDeleted?.title}`).should(
            "not.exist"
        );
    });
});
