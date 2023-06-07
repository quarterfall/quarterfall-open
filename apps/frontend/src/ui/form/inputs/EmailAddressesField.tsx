import { Chip, TextField, TextFieldProps, Typography } from "@mui/material";
import { isEmail } from "core";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type EmailAddressesFieldProps = TextFieldProps & {
    maxChips?: number;
    field?: any;
};

export function EmailAddressesField(props: EmailAddressesFieldProps) {
    const {
        variant = "outlined",
        helperText,
        maxChips = 3,
        field,
        ...rest
    } = props;
    const [emailAddressesStr, setEmailAddressesStr] = useState<string>(
        (field.value || []).join(", ").toLowerCase()
    );

    const { t } = useTranslation();

    const handleEmailAddressesChange = (evt) => {
        // parse the email address string
        let matches = (
            evt.target.value.toLowerCase().match(/([^,:; \n\r]+)/g) || []
        ).map((match) => match.trim());

        // filter out empty values and values that are not valid email addresses
        matches = matches.filter((match) => isEmail(match));

        // remove duplicates
        matches = Array.from(new Set(matches));

        // call the onChange handler with the set of unique email addresses

        field.onChange({ target: { value: matches } });
        setEmailAddressesStr(evt.target.value);
    };

    const handleEmailAddressDelete = (tag: string) => {
        // remove the email address to delete from the email address array
        const newEmailAddresses = field.value?.filter((e) => e !== tag);

        // call the onChange handler with the set of unique email addresses
        field.onChange({ target: { value: newEmailAddresses } });
        setEmailAddressesStr(newEmailAddresses.join(", ").toLowerCase());
    };

    const emailAddressSubset = field.value?.slice(0, maxChips) || [];

    return (
        <>
            <TextField
                variant={variant}
                helperText={helperText}
                value={emailAddressesStr}
                onChange={handleEmailAddressesChange}
                {...rest}
            />

            {/* Display real-time email address chips */}
            {emailAddressSubset.map((emailAddress) => (
                <Chip
                    sx={{ margin: 0.5 }}
                    key={emailAddress}
                    label={emailAddress}
                    onDelete={() => handleEmailAddressDelete(emailAddress)}
                />
            ))}

            {emailAddressSubset.length < (field.value || []).length && (
                <Typography variant="body2" display="inline">
                    {t("andXMore", {
                        x:
                            (field.value?.length || 0) -
                            emailAddressSubset.length,
                    })}
                </Typography>
            )}
        </>
    );
}
