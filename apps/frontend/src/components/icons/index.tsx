import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import MandatoryAssignment from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import OptionalAssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import CategoryIcon from "@mui/icons-material/Category";
import CheckBoxesQuestionIcon from "@mui/icons-material/CheckBox";
import Close from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CodeIcon from "@mui/icons-material/Code";
import DomainIcon from "@mui/icons-material/Domain";
import StudentsIconBase from "@mui/icons-material/GroupWork";
import {
    default as LocalLibraryIcon,
    default as StudyMaterialIcon,
} from "@mui/icons-material/LocalLibrary";
import OptionalStudyMaterialIcon from "@mui/icons-material/LocalLibraryOutlined";
import MultipleChoiceQuestionIcon from "@mui/icons-material/RadioButtonChecked";
import SchoolIcon from "@mui/icons-material/School";
import Security from "@mui/icons-material/Security";
import SettingsIconBase from "@mui/icons-material/Settings";
import DatabaseQuestionIcon from "@mui/icons-material/Storage";
import TextIcon from "@mui/icons-material/Subject";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { BlockType } from "core";
import { Assignment } from "interface/Assignment.interface";

export const CourseIcon = SchoolIcon;
export const ModuleIcon = CategoryIcon;
export const StudentsIcon = StudentsIconBase;
export const LibraryIcon = LocalLibraryIcon;
export const OrganizationIcon = DomainIcon;
export const SettingsIcon = SettingsIconBase;
export const CloseIcon = Close;
export const SecurityIcon = Security;
export const StudentIcon = AssignmentIndIcon;
export const MandatoryAssignmentIcon = MandatoryAssignment;

export const AssignmentIcon = (
    props: SvgIconProps & { assignment?: Partial<Assignment> }
) => {
    const { assignment, ...rest } = props;
    if (assignment?.isStudyMaterial) {
        return assignment?.isOptional ? (
            <OptionalStudyMaterialIcon {...rest} />
        ) : (
            <StudyMaterialIcon {...rest} />
        );
    } else {
        return assignment?.isOptional ? (
            <OptionalAssignmentIcon {...rest} />
        ) : (
            <MandatoryAssignmentIcon {...rest} />
        );
    }
};

export function BlockIcon(
    props: SvgIconProps & {
        type: BlockType;
        multipleCorrect?: boolean;
    }
) {
    const { type, multipleCorrect, ...rest } = props;
    switch (type) {
        case BlockType.OpenQuestion:
            return <AllInclusiveIcon {...rest} />;
        case BlockType.MultipleChoiceQuestion:
            if (!multipleCorrect) {
                return <MultipleChoiceQuestionIcon {...rest} />;
            } else {
                return <CheckBoxesQuestionIcon {...rest} />;
            }
        case BlockType.Text:
            return <TextIcon {...rest} />;
        case BlockType.CodeQuestion:
            return <CodeIcon {...rest} />;
        case BlockType.DatabaseQuestion:
            return <DatabaseQuestionIcon {...rest} />;
        case BlockType.FileUploadQuestion:
            return <CloudUploadIcon {...rest} />;
        default:
            return null;
    }
}
