import { gql, useMutation } from "@apollo/client";

export const useReportError = () =>
    useMutation(gql`
        mutation ReportError($input: SystemInput!) {
            reportError(input: $input)
        }
    `);
