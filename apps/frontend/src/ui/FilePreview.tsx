import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
    darken,
    IconButton,
    lighten,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { File } from "interface/File.interface";
import PdfIcon from "mdi-material-ui/FilePdfBox";

interface FilePreviewProps {
    file: File;
    onEditFile?: (f: File) => void;
    onDeleteFile?: (f: File) => void;
    disabled?: boolean;
}

export const FilePreview = (props: FilePreviewProps) => {
    const { file, onEditFile, onDeleteFile, disabled } = props;

    const renderFileIcon = (f: File) => {
        if (f?.thumbnail) {
            return (
                <img
                    src={f.thumbnail}
                    style={{ maxWidth: 30, display: "inline-block" }}
                />
            );
        } else if (f?.mimetype === "application/pdf") {
            return <PdfIcon />;
        } else {
            return <FileIcon />;
        }
    };
    return (
        <Paper
            sx={{
                padding: 1,
                backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                        ? darken(theme.palette.background.paper, 0.04)
                        : lighten(theme.palette.background.paper, 0.04),
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    {renderFileIcon(file)}
                    <Typography>({file?.extension})</Typography>
                </Stack>

                <Typography>{file?.label}</Typography>
                <Stack direction="row" spacing={1}>
                    <IconButton
                        onClick={() => onEditFile(file)}
                        size="small"
                        disabled={disabled}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => onDeleteFile(file)}
                        size="small"
                        disabled={disabled}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </Paper>
    );
};
