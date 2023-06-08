import { useRouter } from "next/router";

export function useNavigation() {
    const router = useRouter();
    return {
        push: (url: string, as?: any, options?: any) => {
            router.push(url, as, options);
        },
        back: () => {
            router.back();
        },
        newTab: (url: string) => {
            if (
                router.locale !== router.defaultLocale &&
                !url.startsWith("http")
            ) {
                window.open(`/${router.locale}${url}`, "_blank");
            } else {
                window.open(url, "_blank");
            }
        },
        reload: () => {
            router.reload();
        },
        // This is required to reload pages without query params
        hardReload: () => {
            window.location.href = window.location.pathname;
        },
        asPath: router.asPath,
        pathname: router.pathname,
        query: router.query,
    };
}
