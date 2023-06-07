import { ApolloProvider } from "@apollo/react-hooks";
import { CacheProvider } from "@emotion/react";
import "@fontsource/fira-mono";
import "@fontsource/poppins";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ScrollTopButton } from "components/layout/ScrollTopButton";
import { AuthProvider } from "context/AuthProvider";
import { LightDarkThemeProvider } from "context/theme/LightDarkThemeProvider";
import { UIStoreProvider } from "context/UIStoreProvider";
import { appWithTranslation } from "next-i18next";
import Head from "next/head";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallbackPage } from "routes/error/ErrorFallbackPage";
import { apolloClient } from "services/apolloClient";
import { createEmotionCache } from "services/createEmotionCache";
import { registerObjectViewers } from "ui/object/bootstrap";
import { ToastProvider } from "ui/ToastProvider";
import "../../../node_modules/katex/dist/katex.min.css";
import "../../../node_modules/react-image-crop/dist/ReactCrop.css";

const clientSideEmotionCache = createEmotionCache();

function App(props) {
    const {
        Component,
        pageProps,
        emotionCache = clientSideEmotionCache,
    } = props;
    const isMobile = useMediaQuery("(max-width:599px)");

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector("#jss-server-side");
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }

        // Register the object viewers
        registerObjectViewers();
    }, []);

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width"
                />
            </Head>
            <ApolloProvider client={apolloClient}>
                <CacheProvider value={emotionCache}>
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline enableColorScheme />
                    <AuthProvider>
                        <UIStoreProvider>
                            <LightDarkThemeProvider>
                                <ToastProvider>
                                    <ErrorBoundary
                                        fallbackRender={(fallbackProps) => {
                                            return (
                                                <ErrorFallbackPage
                                                    {...fallbackProps}
                                                />
                                            );
                                        }}
                                    >
                                        <Component {...pageProps} />
                                    </ErrorBoundary>
                                    {!isMobile && <ScrollTopButton />}
                                </ToastProvider>
                            </LightDarkThemeProvider>
                        </UIStoreProvider>
                    </AuthProvider>
                </CacheProvider>
            </ApolloProvider>
        </>
    );
}

export default appWithTranslation(App);
