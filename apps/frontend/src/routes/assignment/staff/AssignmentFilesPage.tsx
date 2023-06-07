import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
    Button,
    CircularProgress,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { ImageCropDialog } from "components/image/ImageCropDialog";
import {
    useAssignment,
    useDeleteAssignmentFile,
    useUploadAssignmentFile,
} from "features/assignment/staff/api/Assignment.data";
import { EditAssignmentFileDialog } from "features/assignment/staff/file/EditAssignmentFileDialog";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { File } from "interface/File.interface";
import PdfIcon from "mdi-material-ui/FilePdfBox";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Crop } from "react-image-crop";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { Loading } from "ui/Loading";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
export interface AssignmentFilesTabProps {
    assignment: Assignment;
}

export const AssignmentFilesPage = (props: AssignmentFilesTabProps) => {
    const { assignment } = props;
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [imageCropDialogOpen, setImageCropDialogOpen] = useState(false);
    const [editFileOpen, setEditFileOpen] = useState(false);
    const [confirmDeleteFileOpen, setConfirmDeleteFileOpen] = useState(false);
    const [uploadAssignmentFileMutation] = useUploadAssignmentFile();
    const [deleteAssignmentFileMutation] = useDeleteAssignmentFile();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [file, setFile] = useState<Blob | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, loading } = useAssignment(id);
    const [uploading, setUploading] = useState(false);
    const { showSuccessToast, showErrorToast } = useToast();

    useEffect(() => {
        if (!file) {
            return;
        }
        // open the image cropping dialog if the file is an image
        if (file.type === "image/jpeg" || file.type === "image/png") {
            setImageCropDialogOpen(true);
        } else {
            // upload the file immediately
            handlePickFile();
        }
    }, [file]);

    if (loading || !data) {
        return <Loading />;
    }

    const module = assignment?.module;
    const course = module?.course;
    const files = assignment.files || [];

    const handlePickFile = async (crop?: Crop) => {
        setImageCropDialogOpen(false);
        if (!file) {
            return;
        }
        setUploading(true);
        try {
            await uploadAssignmentFileMutation({
                variables: {
                    id: assignment.id,
                    input: {
                        file: file,
                        cropX: crop?.x,
                        cropY: crop?.y,
                        cropWidth: crop?.width,
                        cropHeight: crop?.height,
                    },
                },
            });
            showSuccessToast(t("uploadComplete"));
        } catch (error) {
            console.log(error);
            showErrorToast(t("uploadError"));
        }
        setUploading(false);
    };

    const handleCancelChangeImage = () => {
        setImageCropDialogOpen(false);
        setFile(undefined);
    };

    const handleClickEditFile = async (f: File) => {
        setSelectedFile(f);
        setEditFileOpen(true);
    };

    const handleClickDeleteFile = async (f: File) => {
        setSelectedFile(f);
        setConfirmDeleteFileOpen(true);
    };

    const handleDeleteFile = async () => {
        if (!selectedFile) {
            return;
        }
        await deleteAssignmentFileMutation({
            variables: {
                id: assignment.id,
                fileId: selectedFile.id,
            },
        });
        setConfirmDeleteFileOpen(false);
        showSuccessToast(t("fileDeleted"));
    };

    const handleChangeFile = async (event) => {
        if (event.target.files.length <= 0) {
            return; // no files were selected
        }
        // store the file locally
        setFile(event.target.files[0]);
    };

    const openFilePicker = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
        }
    };

    const renderFileIcon = (f: File) => {
        if (f.thumbnail) {
            return (
                <img
                    src={f.thumbnail}
                    style={{ maxWidth: 30, display: "inline-block" }}
                />
            );
        } else if (f.mimetype === "application/pdf") {
            return <PdfIcon />;
        } else {
            return <FileIcon />;
        }
    };

    return (
        <AssignmentLayout selected="files" assignment={assignment}>
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("files")} />
                </Grid>

                {/* Images */}
                {(uploading || files.length > 0) && (
                    <Grid item xs={12}>
                        <Paper>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {t("extension")}
                                        </TableCell>
                                        <TableCell style={{ width: "100%" }}>
                                            {t("label")}
                                        </TableCell>
                                        {!course?.archived && (
                                            <TableCell align="right">
                                                {t("actions")}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {files.map((f, index) => (
                                        <TableRow key={`image_${f.id}`}>
                                            <TableCell
                                                size="small"
                                                padding="checkbox"
                                            >
                                                {renderFileIcon(f)}
                                            </TableCell>
                                            <TableCell
                                                style={{ whiteSpace: "nowrap" }}
                                                data-cy="assignmentFileExtension"
                                            >
                                                {f.extension || ""}
                                            </TableCell>
                                            <TableCell
                                                style={{ width: "100%" }}
                                                data-cy="assignmentFileLabel"
                                            >
                                                {f.label || ""}
                                            </TableCell>
                                            {!course?.archived && (
                                                <TableCell align="right">
                                                    <div
                                                        style={{
                                                            minWidth: 100,
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={() =>
                                                                handleClickEditFile(
                                                                    f
                                                                )
                                                            }
                                                            size="large"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() =>
                                                                handleClickDeleteFile(
                                                                    f
                                                                )
                                                            }
                                                            size="large"
                                                            data-cy="assignmentFileDeleteButton"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    {uploading && (
                                        <TableRow>
                                            <TableCell
                                                size="small"
                                                padding="checkbox"
                                            >
                                                <CircularProgress
                                                    style={{ margin: 10 }}
                                                    color="secondary"
                                                    size={30}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {t("uploading")}
                                            </TableCell>
                                            <TableCell align="right" />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}
                {!course?.archived && (
                    <Grid item>
                        <Button
                            color="primary"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openFilePicker}
                            data-cy="assignmentFilesUploadButton"
                        >
                            {t("uploadFile")}
                        </Button>
                    </Grid>
                )}
            </Grid>
            {/* File picker input */}
            <input
                hidden
                type="file"
                ref={inputRef}
                onChange={handleChangeFile}
                data-cy="assignmentFilesInput"
            />
            {/* image crop dialog */}
            <ImageCropDialog
                open={imageCropDialogOpen}
                onClose={handlePickFile}
                onCancel={handleCancelChangeImage}
                image={file}
            />
            <EditAssignmentFileDialog
                assignmentId={assignment.id}
                file={selectedFile}
                open={editFileOpen}
                onClose={() => setEditFileOpen(false)}
            />
            {/* Delete file confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteFileOpen}
                title={t("confirmDeleteFileTitle")}
                message={t("confirmDeleteFileMessage", {
                    fileName: (selectedFile && selectedFile.label) || "",
                })}
                onCancel={() => setConfirmDeleteFileOpen(false)}
                onContinue={handleDeleteFile}
            />
        </AssignmentLayout>
    );
};
