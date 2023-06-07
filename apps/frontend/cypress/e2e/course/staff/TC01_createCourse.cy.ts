import { aliasMutation } from "../../../utils/gql-test-utils";

describe("createCourse", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseToBeCreated = Cypress.env("courseToBeCreated");

    let createdCourse;
    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit("/");
        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "CreateCourse");
            }
        );
    });

    it("clicks create course and fills the form to create a course", () => {
        cy.getBySel("createCourseButton").click();
        cy.getBySel("createCourseDialogTitle").type(
            `${courseToBeCreated?.title}`
        );
        cy.getBySel("createCourseDialogDescription").type(
            `${courseToBeCreated?.description}`
        );
        cy.getBySel("createCourseDialogSubmit").click();

        cy.wait("@gqlCreateCourseMutation");

        cy.get<Cypress.WaitXHR>("@gqlCreateCourseMutation").then(
            ({ response }) => {
                const { body } = response;
                const data = body["data"];
                createdCourse = data?.createCourse;
            }
        );
        cy.on("url:changed", (url) => {
            if (url !== Cypress.config().baseUrl) {
                expect(url).to.equal(
                    `${Cypress.config().baseUrl}course/${createdCourse?.id}`
                );
            }
        });
    });
});
