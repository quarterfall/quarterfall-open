import { Card, CardContent, CardHeader } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface AssignmentIntroductionCardProps {
    assignment: Assignment;
    hideTitle?: boolean;
}
export function AssignmentIntroductionCard(
    props: AssignmentIntroductionCardProps
) {
    const { assignment, hideTitle = false } = props;
    const { t } = useTranslation();

    return (
        <Card>
            {!hideTitle && <CardHeader title={t("introduction")} />}
            <CardContent>
                <Markdown files={assignment.files}>
                    {assignment?.introduction}
                </Markdown>
            </CardContent>
        </Card>
    );
}
