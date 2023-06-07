import { aliasMutation } from "../../../utils/gql-test-utils";

describe("inviteSingleStudent", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseStudentCredentials = Cypress.env("users").courseStudent;
    const existingCourse = Cypress.env("existingCourse");

    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}`);
        cy.getBySel("courseSidebarStudentTab").click();

        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "AddCourseUsers");
            }
        );

        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "RemoveCourseUsers");
            }
        );
    });
    it("invites a student", () => {
        cy.getBySel("addStudentButton").click();
        cy.getBySel("addUserEmailField").type(
            courseStudentCredentials?.emailAddress
        );
        cy.getBySel("addUserSubmitButton").click();

        cy.wait("@gqlAddCourseUsersMutation");

        cy.getBySel("showInvitedStudentsChip").click();
        cy.findByText(courseStudentCredentials?.emailAddress).should("exist");
        cy.get(".SnackbarContent-root").should(
            "have.text",
            "Student(s) will be added to this course and will be visible within a few minutes."
        );
    });

    it("invites an existing student", () => {
        cy.getBySel("addStudentButton").click();
        cy.getBySel("addUserEmailField").type(
            courseStudentCredentials?.emailAddress
        );
        cy.getBySel("addUserSubmitButton").click();

        cy.wait("@gqlAddCourseUsersMutation");

        cy.getBySel("showInvitedStudentsChip").click();
        cy.findByText(courseStudentCredentials?.emailAddress).should(
            "have.length",
            1
        );
        cy.get(".SnackbarContent-root").should(
            "have.text",
            "Student(s) will be added to this course and will be visible within a few minutes."
        );
    });

    it("deletes invited student", () => {
        cy.getBySel("showInvitedStudentsChip").click();

        cy.findByText(courseStudentCredentials?.emailAddress)
            .should("exist")
            .parent()
            .findByRole("checkbox")
            .should("exist")
            .check();

        cy.getBySel("dataTableToolbar")
            .should("exist")
            .within(() => {
                cy.getBySel("dataTableToolbarDeleteButton").click();
            });
        cy.getBySel("confirmationDialogSubmit").click();
        cy.wait("@gqlRemoveCourseUsersMutation");

        cy.findByText(courseStudentCredentials?.emailAddress).should(
            "not.exist"
        );
    });
});

describe("inviteMultipleStudents", () => {
    const courseAdminCredentials = Cypress.env("users").courseAdmin;
    const courseStudentCredentials = Cypress.env("users").courseStudent;
    const courseViewerCredentials = Cypress.env("users").courseViewer;
    const courseSecondStudentCredentials = Cypress.env("users").courseStudent2;
    const existingCourse = Cypress.env("existingCourse");

    beforeEach(() => {
        cy.loginByApi(courseAdminCredentials);
        cy.visit(`/course/${existingCourse?.id}`);
        cy.getBySel("courseSidebarStudentTab").click();

        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "AddCourseUsers");
            }
        );

        cy.intercept(
            "POST",
            `http://api.quarterfall.local:2500/graphql`,
            (req) => {
                aliasMutation(req, "RemoveCourseUsers");
            }
        );
    });
    it("invites a list of students", () => {
        cy.getBySel("addStudentButton").click();
        cy.getBySel("addUserEmailField").type(
            `${courseStudentCredentials?.emailAddress}, ${courseSecondStudentCredentials?.emailAddress}`
        );
        cy.getBySel("addUserSubmitButton").click();

        cy.wait("@gqlAddCourseUsersMutation");

        cy.getBySel("showInvitedStudentsChip").click();
        cy.get(".SnackbarContent-root").should(
            "have.text",
            "Student(s) will be added to this course and will be visible within a few minutes."
        );
        cy.findByText(courseStudentCredentials?.emailAddress).should(
            "have.length",
            1
        );
        cy.findByText(courseSecondStudentCredentials?.emailAddress).should(
            "have.length",
            1
        );
    });

    it("invites a list of students with an existing student", () => {
        cy.getBySel("addStudentButton").click();
        cy.getBySel("addUserEmailField").type(
            `${courseStudentCredentials?.emailAddress}, ${courseViewerCredentials?.emailAddress}`
        );
        cy.getBySel("addUserSubmitButton").click();

        cy.wait("@gqlAddCourseUsersMutation");

        cy.getBySel("showInvitedStudentsChip").click();
        cy.findByText(courseStudentCredentials?.emailAddress).should(
            "have.length",
            1
        );
        cy.findByText(courseViewerCredentials?.emailAddress).should(
            "have.length",
            1
        );
        cy.get(".SnackbarContent-root").should(
            "have.text",
            "Student(s) will be added to this course and will be visible within a few minutes."
        );
    });

    it("deletes all students", () => {
        cy.getBySel("showInvitedStudentsChip").click();

        cy.findByText(courseStudentCredentials?.emailAddress)
            .should("exist")
            .parent()
            .findByRole("checkbox")
            .should("exist")
            .check();

        cy.findByText(courseViewerCredentials?.emailAddress)
            .should("exist")
            .parent()
            .findByRole("checkbox")
            .should("exist")
            .check();

        cy.findByText(courseSecondStudentCredentials?.emailAddress)
            .should("exist")
            .parent()
            .findByRole("checkbox")
            .should("exist")
            .check();

        cy.getBySel("dataTableToolbar")
            .should("exist")
            .within(() => {
                cy.getBySel("dataTableToolbarDeleteButton").click();
            });
        cy.getBySel("confirmationDialogSubmit").click();
        cy.wait("@gqlRemoveCourseUsersMutation");

        cy.findByText(courseStudentCredentials?.emailAddress).should(
            "not.exist"
        );
        cy.findByText(courseViewerCredentials?.emailAddress).should(
            "not.exist"
        );
    });
});
