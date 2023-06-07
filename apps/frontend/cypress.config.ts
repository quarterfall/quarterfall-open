import { defineConfig } from "cypress";

export default defineConfig({
    viewportHeight: 900,
    viewportWidth: 1440,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    env: {
        users: {
            courseAdmin: {
                emailAddress: "cypress+teacher@quarterfall.com",
            },
            courseChecker: {
                emailAddress: "cypress+checker@quarterfall.com",
            },
            courseEditor: {
                emailAddress: "cypress+editor@quarterfall.com",
            },
            courseViewer: {
                emailAddress: "cypress+viewer@quarterfall.com",
            },
            courseStudent: {
                emailAddress: "cypress+student@quarterfall.com",
            },
            courseStudent2: {
                emailAddress: "cypress+student2@quarterfall.com",
            },
        },
        courseToBeCreated: {
            title: "Hello world!!",
            description: "This is a test course...",
        },
        existingCourse: {
            id: "6200fe2374f3641651071bcf",
            title: "ExistingCourse",
        },
        moduleToBeCreated: {
            title: "Welcome",
            description: "To Quarterfall",
        },
        formativeAssignmentToBeCreated: {
            title: "Formative assignment",
            hasGrading: false,
        },
        summativeAssignmentToBeCreated: {
            title: "Summative assignment",
            hasGrading: true,
        },
        existingAssignment: {
            id: "628deba78cdfe12b1a2d34a5",
        },
    },
    e2e: {
        baseUrl: "http://pro.quarterfall.local:2000/",
        experimentalStudio: true,
    },
});
