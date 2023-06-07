/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        getBySel(
            dataTestAttribute: string,
            args?: any
        ): Chainable<Element | JQuery<HTMLElement>>;
        getBySelLike(
            dataTestPrefixAttribute: string,
            args?: any
        ): Chainable<Element | JQuery<HTMLElement>>;

        /**
         * Logs-in user by using API request
         */
        loginByApi(user: { emailAddress: string }): void;
        logOut(): void;

        dropFile(fileName): Chainable<Element | JQuery<HTMLElement>>;
    }
}
