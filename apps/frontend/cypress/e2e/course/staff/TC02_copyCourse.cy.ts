import { aliasMutation } from "../../../utils/gql-test-utils";

describe("copyCourse", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseToBeCopied = Cypress.env("courseToBeCreated");

    let copiedCourse;
    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit("/");
        cy.intercept("POST", `https://api.quarterfall.local:2500`, (req) => {
            aliasMutation(req, "DuplicateCourse");
        });
    });
    it("clicks course menu and copies course", () => {
        cy.getBySel(`courseCard_${courseToBeCopied?.title}`).within(() => {
            cy.getBySel("courseMenuButton").click();
        });
        cy.getBySel("copyCourseMenuItem").click();
        cy.getBySel("copyCourseDialogTitle")
            .clear()
            .type(`Copy ${courseToBeCopied?.title}`);
        cy.getBySel("copyCourseDialogSubmit").click();

        cy.wait("@gqlDuplicateCourseMutation");

        cy.get<Cypress.WaitXHR>("@gqlDuplicateCourseMutation").then(
            ({ response }) => {
                const { body } = response;
                const data = body["data"];
                copiedCourse = data.duplicateCourse;
            }
        );

        expect(cy.getBySel("pageHeading")).to.have.text(
            `Copy ${courseToBeCopied?.title}`
        );
    });
});
