import { useEffect } from "react";

export function useBackgroundImage(image: string = "") {
    useEffect(() => {
        if (image) {
            Object.assign(document.body.style, {
                backgroundImage: `url("${image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            });
        } else {
            document.body.style.backgroundImage = "";
        }
    });
}
