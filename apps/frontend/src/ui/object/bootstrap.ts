import { ObjectViewer, registerObjectViewer } from "./ObjectViewer";
import { ObjectViewerButton } from "./ObjectViewerButton";
import { ObjectViewerChart } from "./ObjectViewerChart";
import { ObjectViewerDailymotion } from "./ObjectViewerDailymotion";
import { ObjectViewerFile } from "./ObjectViewerFile";
import { ObjectViewerGoogleDocs } from "./ObjectViewerGoogleDocs";
import { ObjectViewerGoogleSheets } from "./ObjectViewerGoogleSheets";
import { ObjectViewerGoogleSlides } from "./ObjectViewerGoogleSlides";
import { ObjectViewerIFrame } from "./ObjectViewerIFrame";
import { ObjectViewerImage } from "./ObjectViewerImage";
import { ObjectViewerList } from "./ObjectViewerList";
import { ObjectViewerPdf } from "./ObjectViewerPdf";
import { ObjectViewerRating } from "./ObjectViewerRating";
import { ObjectViewerSlideShare } from "./ObjectViewerSlideShare";
import { ObjectViewerTable } from "./ObjectViewerTable";
import { ObjectViewerText } from "./ObjectViewerText";
import { ObjectViewerType } from "./ObjectViewerType";
import { ObjectViewerVimeo } from "./ObjectViewerVimeo";
import { ObjectViewerYouTube } from "./ObjectViewerYouTube";

export function registerObjectViewers() {
    registerObjectViewer(ObjectViewerType.button, ObjectViewerButton);
    registerObjectViewer(ObjectViewerType.chart, ObjectViewerChart);
    registerObjectViewer(ObjectViewerType.dailymotion, ObjectViewerDailymotion);
    registerObjectViewer(ObjectViewerType.file, ObjectViewerFile);
    registerObjectViewer(ObjectViewerType.googledocs, ObjectViewerGoogleDocs);
    registerObjectViewer(
        ObjectViewerType.googlesheets,
        ObjectViewerGoogleSheets
    );
    registerObjectViewer(
        ObjectViewerType.googleslides,
        ObjectViewerGoogleSlides
    );
    registerObjectViewer(ObjectViewerType.iframe, ObjectViewerIFrame);
    registerObjectViewer(ObjectViewerType.image, ObjectViewerImage);
    registerObjectViewer(ObjectViewerType.list, ObjectViewerList);
    registerObjectViewer(ObjectViewerType.object, ObjectViewer);
    registerObjectViewer(ObjectViewerType.pdf, ObjectViewerPdf);
    registerObjectViewer(ObjectViewerType.rating, ObjectViewerRating);
    registerObjectViewer(ObjectViewerType.slideshare, ObjectViewerSlideShare);
    registerObjectViewer(ObjectViewerType.table, ObjectViewerTable);
    registerObjectViewer(ObjectViewerType.text, ObjectViewerText);
    registerObjectViewer(ObjectViewerType.vimeo, ObjectViewerVimeo);
    registerObjectViewer(ObjectViewerType.youtube, ObjectViewerYouTube);
}
