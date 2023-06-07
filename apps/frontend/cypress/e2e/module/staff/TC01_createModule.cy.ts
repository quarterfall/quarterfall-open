import { aliasMutation } from "../../../utils/gql-test-utils";

describe("createModule", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const existingCourse = Cypress.env("existingCourse");
    const moduleToBeCreated = Cypress.env("moduleToBeCreated");
    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}/content`);
        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "CreateModule");
            }
        );
    });
    it("creates a module and finds it on the page", () => {
        cy.getBySel("createModuleButton").click();
        cy.getBySel("createModuleDialogTitle").type(moduleToBeCreated?.title);
        cy.getBySel("createModuleDialogDescription").type(
            moduleToBeCreated?.description
        );
        cy.getBySel("createModuleDialogSubmit").click();
        cy.wait("@gqlCreateModuleMutation");
        cy.get<Cypress.WaitXHR>("@gqlCreateModuleMutation").then(
            ({ response }) => {
                const { body } = response;
                const data = body["data"];
                cy.getBySel(
                    `moduleColumnHeader_${
                        (data?.createModule?.modules || []).slice(-1)[0]?.title
                    }`
                ).should("exist");
            }
        );
    });
});
