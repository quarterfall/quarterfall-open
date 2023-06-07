import { aliasMutation } from "../../../utils/gql-test-utils";

describe("copyModule", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const existingCourse = Cypress.env("existingCourse");
    const moduleToBeCopied = Cypress.env("moduleToBeCreated");

    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}/content`);
        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "CopyModule");
            }
        );
    });
    it("clicks course module and copies module", () => {
        cy.getBySel(`moduleColumnButton_${moduleToBeCopied?.title}`).click();
        cy.getBySel(`copyModuleButton_${moduleToBeCopied?.title}`).click();
        cy.wait("@gqlCopyModuleMutation");
        cy.get<Cypress.WaitXHR>("@gqlCopyModuleMutation").then(
            ({ response }) => {
                const { body } = response;
                const data = body["data"];
                cy.getBySel(
                    `moduleColumnHeader_${
                        (data?.createModule?.modules || []).slice(-1)[0].title
                    }`
                ).should("exist");
            }
        );
    });
});
