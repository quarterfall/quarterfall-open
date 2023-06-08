import { usePublicAssignment } from "features/assignment/student/Assignment.data";
import { AssignmentStudentViewPage } from "routes/assignment/student/AssignmentStudentViewPage";
import { Loading } from "ui/Loading";

export interface AssignmentAnonymousPageProps {
    publicKey: string;
}

export function AssignmentAnonymousPage(props: AssignmentAnonymousPageProps) {
    const { publicKey } = props;

    const { data: assignmentData, loading: assignmentLoading } =
        usePublicAssignment(publicKey);

    if (assignmentLoading || !assignmentData) {
        return <Loading />;
    }
    const assignment = assignmentData.assignmentByKey;

    return (
        <AssignmentStudentViewPage
            assignment={assignment}
            publicKey={publicKey}
        />
    );
}
