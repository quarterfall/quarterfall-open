describe("archiveCourse", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseToBeArchived = Cypress.env("courseToBeCreated");

    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit("/");
    });

    it("clicks course menu and archives course", () => {
        cy.getBySel(`courseCard_Copy ${courseToBeArchived?.title}`).within(
            () => {
                cy.getBySel("courseMenuButton").click();
            }
        );
        cy.getBySel("archiveCourseMenuItem").click();
        cy.getBySel("confirmationDialogSubmit").click();

        cy.getBySel("toast").should("exist");
        cy.getBySel(`courseCard_Copy ${courseToBeArchived?.title}`).within(
            () => {
                cy.getBySel("courseCardArchivedChip").should("exist");
            }
        );
    });
});
