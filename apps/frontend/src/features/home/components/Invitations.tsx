import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { Alert, Button, Stack } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import {
    useAcceptInvitation,
    useDeclineInvitation,
} from "features/course/api/Course.data";
import { useToast } from "hooks/useToast";
import { useTranslation } from "react-i18next";
export function Invitations() {
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const [acceptInvitationMutation] = useAcceptInvitation();
    const [declineInvitationMutation] = useDeclineInvitation();
    const { showSuccessToast } = useToast();

    const handleClickAcceptInvitation = async (id: string) => {
        await acceptInvitationMutation({
            variables: { id },
        });
        showSuccessToast(t("user:invitationAcceptedToast"));
    };

    const handleClickDeclineInvitation = async (id: string) => {
        await declineInvitationMutation({
            variables: { id },
        });
        showSuccessToast(t("user:invitationDeclinedToast"));
    };

    const invitations = me?.invitations || [];
    if (invitations.length === 0) {
        return null;
    }

    return (
        <Stack spacing={1} sx={{ marginBottom: (theme) => theme.spacing(1) }}>
            {invitations.map((invitation) => (
                <Alert
                    key={`invitation_${invitation.id}`}
                    severity="info"
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                startIcon={<ClearIcon />}
                                onClick={() =>
                                    handleClickDeclineInvitation(invitation.id)
                                }
                            >
                                {t("decline")}
                            </Button>
                            <Button
                                startIcon={<CheckIcon />}
                                color="primary"
                                variant="outlined"
                                onClick={() =>
                                    handleClickAcceptInvitation(invitation.id)
                                }
                            >
                                {t("accept")}
                            </Button>
                        </Stack>
                    }
                >
                    {t("user:invitationText", {
                        inviter: `${invitation?.inviter?.firstName} ${invitation?.inviter?.lastName}`,
                        course: invitation?.course?.title,
                    })}
                </Alert>
            ))}
        </Stack>
    );
}
