import { useAuthContext } from "context/AuthProvider";
import { RoleType } from "core";
import { HomeStaff } from "features/home/staff/components/HomeStaff";
import { HomeStudent } from "features/home/student/components/HomeStudent";

export function Home() {
    const { me } = useAuthContext();

    if (me?.organizationRole === RoleType.organizationStudent) {
        return <HomeStudent />;
    } else {
        return <HomeStaff />;
    }
}
