import { aliasMutation } from "../../../utils/gql-test-utils";

describe("deleteModule", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const existingCourse = Cypress.env("existingCourse");
    const moduleToBeDeleted = Cypress.env("moduleToBeCreated");
    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}/content`);
        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "DeleteModule");
            }
        );
    });
    it("clicks course module and deletes module", () => {
        cy.getBySel(`moduleColumnButton_${moduleToBeDeleted?.title}`)
            .eq(1)
            .should("exist")
            .click();
        cy.getBySel(`deleteModuleButton_${moduleToBeDeleted?.title}`)
            .should("exist")
            .click();
        cy.getBySel("deleteModuleDialogSubmit").click();
        cy.wait("@gqlDeleteModuleMutation");

        cy.getBySel(`moduleColumnHeader_${moduleToBeDeleted?.title}`).should(
            "not.have.length.above",
            1
        );
    });
});
