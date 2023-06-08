import { Typography } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { patterns } from "core";
import { useEffect, useState } from "react";
import { Loading } from "ui/Loading";
import { useNavigation } from "ui/route/Navigation";
import { AdminLayout } from "../../features/admin/layout/AdminLayout";

export function AdminLoginAsUserPage() {
    const router = useNavigation();
    const { loginAsUser } = useAuthContext();
    const [error, setError] = useState("");

    useEffect(() => {
        const sysAdmin = router.query["sysAdmin"] === "true";
        const emailAddress = (router.query["emailAddress"] as string) || "";
        if (!emailAddress.match(patterns.email)) {
            setError("Invalid email address");
            return;
        }
        loginAsUser(emailAddress, sysAdmin);
    }, []);

    return (
        <AdminLayout selected="general">
            {error ? <Typography>{error}</Typography> : <Loading />}
        </AdminLayout>
    );
}
