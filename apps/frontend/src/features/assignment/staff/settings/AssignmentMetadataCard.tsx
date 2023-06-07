import InfoIcon from "@mui/icons-material/Info";
import ShareIcon from "@mui/icons-material/Share";
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { BlockType, Permission, PublicLicenseType } from "core";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import isEqual from "lodash/isEqual";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import CopyToClipboardButton from "ui/CopyToClipboardButton";
import { useAutosaveForm } from "ui/form/Autosave";
import { SelectController } from "ui/form/SelectController";
import { TextFieldController } from "ui/form/TextFieldController";
import { AssignmentKeywordField } from "./AssignmentKeywordField";

export const AssignmentMetadataCard = (props) => {
    const { assignment } = props;
    const { t } = useTranslation();
    const can = usePermission();
    const [updateAssignmentMutation] = useUpdateAssignment();
    const { showSuccessToast } = useToast();
    const { me } = useAuthContext();
    const module = assignment?.module;
    const course = module?.course;

    const canUpdate = can(Permission.updateCourse, course);

    // Public URL
    const assignmentPublicUrl = `${window.location.origin}/do/${assignment?.publicKey}`;
    const handleSendByEmail = () => {
        window.open(
            `mailto:?body=${t("assignment:emailLinkBody", {
                ...course,
                url: assignmentPublicUrl,
            })}&subject=${t("assignment:emailLinkSubject")}`
        );
    };

    const onSave = async (input) => {
        await updateAssignmentMutation({
            variables: {
                id: assignment.id,
                input,
            },
        });
        showSuccessToast();
    };

    const { control, reset } = useAutosaveForm({
        defaultValues: {
            ...assignment,
        },
        onSave,
    });

    // Due to an issue with array data not being passed correctly on change,
    // this is a workaround using watch (needed for the keywords here)
    const { control: keywordsControl, watch } = useForm({
        mode: "onChange",
        defaultValues: { keywords: [...assignment.keywords] },
    });

    const keywords = watch("keywords");

    useEffect(() => {
        if (!isEqual(keywords, assignment.keywords)) {
            onSave({ keywords });
        }
    }, [keywords]);

    useEffect(() => {
        reset(assignment);
    }, [assignment.id]);

    const hasFileQuestion =
        assignment.blocks.filter((b) => b.type === BlockType.FileUploadQuestion)
            .length > 0;

    const canShareAnonymousLink =
        canUpdate &&
        me?.organization?.allowAnonymousSubmissions &&
        !assignment?.hasGrading &&
        !hasFileQuestion;

    const publicLicenseTypes = [
        PublicLicenseType.none,
        PublicLicenseType.mit,
        PublicLicenseType.ccby,
    ];

    return (
        <Card>
            <CardHeader
                title={t("assignment:metadata")}
                avatar={
                    <ColoredAvatar>
                        <InfoIcon />
                    </ColoredAvatar>
                }
            />
            <CardContent>
                <form>
                    <Grid container spacing={2} direction="row">
                        <Grid item xs={12}>
                            <TextFieldController
                                required
                                name="title"
                                control={control}
                                variant="outlined"
                                fullWidth
                                disabled={!canUpdate}
                                label={t("title")}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <AssignmentKeywordField
                                name="keywords"
                                control={keywordsControl as any}
                                disabled={!canUpdate}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldController
                                name="author"
                                control={control}
                                variant="outlined"
                                fullWidth
                                disabled={!canUpdate}
                                label={t("author")}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldController
                                name="remarks"
                                control={control}
                                variant="outlined"
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={10}
                                disabled={!canUpdate}
                                label={t("remarks")}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectController
                                style={{ minWidth: 200 }}
                                displayEmpty
                                label={t("assignment:selectPublicLicenseType")}
                                name="license"
                                variant="outlined"
                                control={control}
                                disabled={!canUpdate}
                            >
                                {publicLicenseTypes.map((key) => {
                                    return (
                                        <MenuItem
                                            key={key}
                                            value={PublicLicenseType[key]}
                                        >
                                            {t(
                                                `assignment:publicLicenseType_${PublicLicenseType[key]}`
                                            )}
                                        </MenuItem>
                                    );
                                })}
                            </SelectController>
                        </Grid>
                        {canShareAnonymousLink && (
                            <Grid item xs={12}>
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    alignItems="center"
                                >
                                    <TextField
                                        disabled
                                        style={{ flexGrow: 1 }}
                                        value={assignmentPublicUrl || ""}
                                        variant="outlined"
                                        label={t("assignment:publicUrl")}
                                    />
                                    <CopyToClipboardButton
                                        text={assignmentPublicUrl}
                                        copyConfirmText={t(
                                            "assignment:urlCopiedToClipboardConfirmation"
                                        )}
                                        tooltipTitle={t("copyUrlToClipboard")}
                                    />
                                    <Tooltip
                                        title={t("assignment:sendLinkByEmail")}
                                    >
                                        <IconButton
                                            onClick={handleSendByEmail}
                                            size="large"
                                        >
                                            <ShareIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};
