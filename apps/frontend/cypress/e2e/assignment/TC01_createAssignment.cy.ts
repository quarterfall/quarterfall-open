import { aliasMutation } from "../../utils/gql-test-utils";

describe("createAssignment", () => {
    // Define constants and variables

    const baseUrl = Cypress.config().baseUrl;
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const existingCourse = Cypress.env("existingCourse");
    const formativeAssignmentToBeCreated = Cypress.env(
        "formativeAssignmentToBeCreated"
    );
    const summativeAssignmentToBeCreated = Cypress.env(
        "summativeAssignmentToBeCreated"
    );
    let assignmentToBeCreated;

    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}/content`);
        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "CreateAssignment");
            }
        );
    });

    describe("formative assignment", () => {
        it("creates a formative assignment and navigates to the assignment page", () => {
            cy.getBySel("createAssignmentButton").should("exist").eq(1).click();
            cy.getBySel("createAssignmentDialogTitle").type(
                formativeAssignmentToBeCreated?.title
            );
            cy.getBySel("createAssignmentDialogSubmit").click();
            cy.wait("@gqlCreateAssignmentMutation");
            cy.get<Cypress.WaitXHR>("@gqlCreateAssignmentMutation").then(
                ({ response }) => {
                    const { body } = response;
                    const data = body["data"];
                    assignmentToBeCreated =
                        data.createAssignment.assignments[0];
                }
            );
            cy.on("url:changed", (url) => {
                if (url !== baseUrl) {
                    expect(url).to.equal(
                        `${baseUrl}assignment/${assignmentToBeCreated?.id}`
                    );
                }
            });

            cy.getBySel("assignmentSidebarHeaderTitle").should(
                "have.text",
                formativeAssignmentToBeCreated?.title
            );

            cy.getBySel("assignmentSidebarHeaderHasGradingChip").should(
                "not.exist"
            );
        });

        it("adds an introduction to the assignment", () => {
            cy.visit(`/assignment/${assignmentToBeCreated?.id}`);

            cy.getBySel("addIntroductionButton").click();

            cy.getBySel("assignmentIntroductionMarkdownField").type(
                "This is an introduction"
            );

            cy.get(".Markdown-root")
                .should("exist")
                .first()
                .children(".MuiTypography-root")
                .should("exist")
                .first()
                .should("have.text", "This is an introduction");
        });

        it("navigates to the files tab and uploads a file", () => {
            cy.visit(`/assignment/${assignmentToBeCreated?.id}/files`);
            cy.getBySel("assignmentSidebarFilesTab").click();
            cy.getBySel("assignmentFilesInput")
                .should("not.be.visible")
                .selectFile("./cypress/fixtures/markdown.md", { force: true });

            cy.getBySel("assignmentFileExtension")
                .should("exist")
                .eq(0)
                .should("have.text", ".md");

            cy.getBySel("assignmentFileLabel")
                .should("exist")
                .eq(0)
                .should("have.text", "markdown");
        });

        it("navigates to introduction tab and refers to the file there", () => {
            cy.visit(`/assignment/${assignmentToBeCreated?.id}/introduction`);

            const markdown = "\n```file\nlabel: markdown\n```";
            cy.getBySel("assignmentIntroductionMarkdownField")
                .children("'.MuiInputBase-root'")
                .clear()
                .type(markdown);
            cy.get(".Markdown-root")
                .should("exist")
                .first()
                .children(".MuiTypography-root")
                .should("exist")
                .first()
                .contains("This is a piece of markdown");
        });
    });

    describe.skip("summative assignment", () => {
        it("creates a summative assignment and navigates to the assignment page", () => {
            cy.getBySel("createAssignmentButton").should("exist").eq(1).click();
            cy.getBySel("createAssignmentDialogTitle").type(
                summativeAssignmentToBeCreated?.title
            );
            cy.getBySel("createAssignmentDialogSwitch").click();
            cy.getBySel("createAssignmentDialogSubmit").click();
            cy.wait("@gqlCreateAssignmentMutation");
            cy.get<Cypress.WaitXHR>("@gqlCreateAssignmentMutation").then(
                ({ response }) => {
                    const { body } = response;
                    const data = body["data"];
                    assignmentToBeCreated =
                        data.createAssignment.assignments[1];
                }
            );
            cy.on("url:changed", (url) => {
                if (url !== baseUrl) {
                    expect(url).to.equal(
                        `${baseUrl}assignment/${assignmentToBeCreated?.id}`
                    );
                }
            });

            cy.getBySel("assignmentSidebarHeaderTitle").should(
                "have.text",
                summativeAssignmentToBeCreated?.title
            );

            cy.getBySel("assignmentSidebarHeaderHasGradingChip").should(
                "exist"
            );
        });
    });
});
