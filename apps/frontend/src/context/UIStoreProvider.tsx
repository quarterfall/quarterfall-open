import React, { createContext, useContext } from "react";
import { useLocalStorage } from "ui/hooks/LocalStorage";
import { useAuthContext } from "./AuthProvider";

export interface Filters {
    orderBy: string;
    order: string;
}

export interface CourseFilters extends Filters {
    allCourses: boolean;
    hideArchived: boolean;
}

export interface UIContextData {
    // the current course in the dashboard
    courseId: string;
    setCourseId: (value: string) => void;

    // whether to show dark mode
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;

    // Show preview in editor
    showPreview: boolean;
    setShowPreview: (value: boolean) => void;

    //Save last visited tab on home
    courseFilters: CourseFilters;
    setCourseFilters: (value: CourseFilters) => void;
}

// tslint:disable-next-line variable-name
export const UIStoreContext = createContext<UIContextData>({
    courseId: "",
    setCourseId: (_: string) => void 0,
    darkMode: false,
    setDarkMode: (_: boolean) => void 0,
    showPreview: true,
    setShowPreview: (_: boolean) => void 0,
    courseFilters: {
        orderBy: "",
        order: "",
        allCourses: false,
        hideArchived: false,
    },
    setCourseFilters: (_: {
        orderBy: "";
        order: "";
        allCourses: false;
        hideArchived: false;
    }) => void 0,
});

export interface UIStoreProviderProps {
    children: React.ReactNode;
}

export const useStore = () => useContext(UIStoreContext);

export function UIStoreProvider(props: UIStoreProviderProps) {
    const [courseId, setCourseId] = useLocalStorage("courseId");
    const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
    const [showPreview, setShowPreview] = useLocalStorage("showPreview", true);

    const [courseFilters, setCourseFilters] = useLocalStorage<CourseFilters>(
        "courseFilters",
        {
            orderBy: "title",
            order: "asc",
            allCourses: false,
            hideArchived: false,
        }
    );

    const { me } = useAuthContext();

    if (me) {
        // check whether a course is currently selected
        const courses = me.courses || [];
        if (!courseId && courses.length > 0) {
            setCourseId(courses[0].id);
        }
    }

    return (
        <UIStoreContext.Provider
            value={{
                courseId,
                setCourseId,
                darkMode,
                setDarkMode,
                showPreview,
                setShowPreview,
                courseFilters,
                setCourseFilters,
            }}
        >
            {props.children}
        </UIStoreContext.Provider>
    );
}
