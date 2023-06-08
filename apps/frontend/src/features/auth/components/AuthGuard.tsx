import { useAuthContext } from "context/AuthProvider";
import { UpdateUserDialog } from "features/user/UpdateUserDialog";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { apolloClient } from "services/apolloClient";
import { Loading } from "ui/Loading";
import { meQuery } from "../hooks/Auth.data";

export interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard(props: AuthGuardProps) {
    const { children } = props;
    const { me } = useAuthContext();
    const router = useRouter();

    // If there is a user that doesn't have their name filled in for some reason, we open a dialog to fill that in
    const userHasNoName = !me?.firstName && !me?.lastName;
    const [updateUserDialogOpen, setUpdateUserDialogOpen] =
        useState(userHasNoName);

    useEffect(() => {
        if (!me) {
            let path = `/auth/login?next=${encodeURIComponent(router.asPath)}`;
            // Redirect the user if not logged in
            router.push(path);
        } else if (router.locale !== me?.language) {
            // Redirect the user to the right locale
            router.push(router.pathname, router.asPath, {
                locale:
                    router.locales?.indexOf(me?.language) >= 0
                        ? me?.language
                        : router.defaultLocale,
            });
        } else if (
            !me?.organizations.length ||
            !me?.organization?.permissions?.length
        ) {
            apolloClient.refetchQueries({
                include: [meQuery],
            });
        }
    }, []);

    if (!me) {
        return <Loading />;
    }

    return (
        <>
            {children}
            <UpdateUserDialog
                open={updateUserDialogOpen}
                onClose={() => setUpdateUserDialogOpen(false)}
            />
        </>
    );
}
