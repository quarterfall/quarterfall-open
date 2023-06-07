import "@testing-library/cypress/add-commands";

// @ts-check
///<reference path="../global.d.ts" />
export interface User {
    emailAddress: string;
}

Cypress.Commands.add("loginByApi", (user: User) => {
    const { emailAddress } = user;
    cy.request({
        url: `http://api.quarterfall.local:2500/login/magic/complete?token=${encodeURIComponent(
            emailAddress
        )}`,
        method: "GET",
    });
});
Cypress.Commands.add("logOut", () => {
    cy.request({
        url: `http://api.quarterfall.local:2500/logout`,
        method: "POST",
    });
});

Cypress.Commands.add("getBySel", (selector, ...args) => {
    return cy.get(`[data-cy="${selector}"]`, ...args);
});

Cypress.Commands.add("getBySelLike", (selector, ...args) => {
    return cy.get(`[data-cy*="${selector}"]`, ...args);
});
