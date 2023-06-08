import { Grid } from "@mui/material";
import {
    useDeleteSubmissionFile,
    useUploadSubmissionFile,
} from "features/assignment/student/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { File } from "interface/File.interface";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { FilePreview } from "ui/FilePreview";
import { useAutosaveForm } from "ui/form/Autosave";
import { FileUploadController } from "ui/form/FileUploadController";
import { TextFieldController } from "ui/form/TextFieldController";
import { EditSubmissionFileDialog } from "./EditSubmissionFileDialog";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
interface ViewBlockFileUploadQuestionProps {
    assignment: Assignment;
    block: Block;
    answer?: string[];
    showQuestionText?: boolean;
    debounce?: boolean;
    answerInputLabel?: string;
    onUpdateAnswer?: (answer: string[]) => void;
    readOnly?: boolean;
    isPreview?: boolean;
    setAnswerChanged?: (answerChanged: boolean) => void;
}

export function ViewBlockFileUploadQuestion(
    props: ViewBlockFileUploadQuestionProps
) {
    const { t } = useTranslation();
    const {
        assignment,
        block,
        showQuestionText,
        answer = [],
        debounce = true,
        onUpdateAnswer,
        isPreview,
        readOnly,
        setAnswerChanged,
    } = props;
    const [uploading, setUploading] = useState(false);
    const [confirmDeleteFileOpen, setConfirmDeleteFileOpen] = useState(false);
    const [confirmEditFileOpen, setConfirmEditFileOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Form for storing the answer
    const { control: commentControl, reset } = useAutosaveForm<{
        answer: string;
    }>({
        onSave: async (input) => {
            if (!debounce) {
                return;
            }
            onUpdateAnswer([input.answer || ""]);
        },
        onChange: async (input) => {
            if (debounce) {
                return;
            }
            onUpdateAnswer([input.answer || ""]);
        },
        defaultValues: {
            answer: answer?.length ? answer[0] : block.template || "",
        },
    });

    const { showSuccessToast, showErrorToast } = useToast();
    const [deleteSubmissionFileMutation] = useDeleteSubmissionFile();
    const [uploadSubmissionFileMutation] = useUploadSubmissionFile();

    const allowedFileTypes = block?.allowedFileExtensions || "";

    const onEditFile = async (f: File) => {
        setSelectedFile(f);
        setConfirmEditFileOpen(true);
    };

    const onDeleteFile = async (f: File) => {
        setSelectedFile(f);
        setConfirmDeleteFileOpen(true);
    };

    const handleDeleteFile = async () => {
        if (!selectedFile) {
            return;
        }
        await deleteSubmissionFileMutation({
            variables: {
                blockId: block?.id,
                fileId: selectedFile?.id,
            },
        });
        setAnswerChanged(true);
        setConfirmDeleteFileOpen(false);
        showSuccessToast(t("fileDeleted"));
    };

    // Form for uploading the file
    const { control: fileControl } = useAutosaveForm({
        onSave: async (input) => {
            setUploading(true);
            try {
                await uploadSubmissionFileMutation({
                    variables: {
                        blockId: block.id,
                        input: {
                            file: input.file[0],
                        },
                    },
                });
                setAnswerChanged(true);
                showSuccessToast(t("uploadComplete"));
            } catch (error) {
                console.log(error);
                showErrorToast(t("uploadError"));
            }
            setUploading(false);
        },
    });

    // if the block changes, reset the answer field
    useEffect(() => {
        reset({ answer: answer?.length ? answer[0] : block.template || "" });
    }, [block.id]);

    // if the template changes, update the answer field value
    useEffect(() => {
        if (!isPreview) {
            return;
        }
        reset({ answer: block.template || "" });
    }, [block.template]);

    return (
        <>
            <Grid container direction="column" spacing={3}>
                {/* Question text */}
                {block.text && showQuestionText && (
                    <Grid item style={{ maxWidth: "100%" }}>
                        <Markdown files={assignment.files}>
                            {block.text}
                        </Markdown>
                    </Grid>
                )}
                <Grid item>
                    {block?.files?.length > 0 ? (
                        block?.files?.map((f) => {
                            return (
                                <FilePreview
                                    key={f.id}
                                    file={f}
                                    onDeleteFile={onDeleteFile}
                                    onEditFile={onEditFile}
                                    disabled={readOnly}
                                />
                            );
                        })
                    ) : (
                        <FileUploadController
                            control={fileControl}
                            name="file"
                            label={t("assignment:dragAndDropFiles")}
                            maxFiles={1}
                            multiple={false}
                            allowedFileTypes={allowedFileTypes}
                            uploading={uploading}
                            disabled={readOnly}
                        />
                    )}
                </Grid>
                <Grid item>
                    <TextFieldController
                        fullWidth
                        label={t("assignment:studentComment")}
                        multiline
                        name="answer"
                        control={commentControl}
                        disabled={readOnly || uploading}
                    />
                </Grid>
            </Grid>
            <ConfirmationDialog
                open={confirmDeleteFileOpen}
                title={t("confirmDeleteFileTitle")}
                message={t("confirmDeleteFileMessage", {
                    fileName: (selectedFile && selectedFile?.label) || "",
                })}
                onCancel={() => setConfirmDeleteFileOpen(false)}
                onContinue={handleDeleteFile}
            />
            <EditSubmissionFileDialog
                block={block}
                file={selectedFile}
                open={confirmEditFileOpen}
                onClose={() => setConfirmEditFileOpen(false)}
            />
        </>
    );
}
