import axios, { AxiosError, AxiosResponse } from "axios";
import { config } from "config";
import { extractErrorCode, ServerError } from "core";
import { useMe } from "features/auth/hooks/Auth.data";
import { User } from "interface/User.interface";
import React, { createContext, useContext } from "react";
import { Loading } from "ui/Loading";

export interface LoginData {
    emailAddress: string;
    password: string;
}

export interface AuthContextData {
    me: User | null;
    loginAsUser: (
        emailAddress: string,
        sysAdmin?: boolean,
        next?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    refetch: () => Promise<void>;
}

// tslint:disable-next-line variable-name
export const AuthContext = createContext<AuthContextData>({
    me: null,
    loginAsUser: async (
        emailAddress: string,
        sysAdmin?: boolean,
        next?: string
    ) => {
        return;
    },
    logout: async () => {
        return;
    },
    refetch: async () => {
        return;
    },
});

export interface AuthProviderProps {
    children: React.ReactNode;
}

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider(props: AuthProviderProps) {
    const { data, error, loading, refetch } = useMe();

    const loginAsUser = async (
        emailAddress: string,
        sysAdmin?: boolean,
        next: string = ""
    ) => {
        // perform the login-as-user mutation
        await axios({
            method: "POST",
            data: {
                emailAddress,
                sysAdmin,
            },
            withCredentials: true,
            url: config.backend + "/loginAs",
            headers: { "Content-Type": "application/json" },
        })
            .then((res: AxiosResponse) => {
                if (res?.data?.success) {
                    window.location.href = window.location.origin + next;
                }
            })
            .catch((error: AxiosError) => {
                console.log(error);
            });
    };

    const logout = async () => {
        await axios({
            method: "POST",
            withCredentials: true,
            url: config.backend + "/logout",
            headers: { "Content-Type": "application/json" },
        });

        // reload the page
        window.location.href = window.location.origin;
    };

    if (error) {
        console.log(error);
        const errorCode = extractErrorCode(error);
        if (errorCode === ServerError.LicenseExpired) {
            return (
                <p>
                    Your organization&apos;s license for Quarterfall has
                    expired. Please contact your organization&apos;s IT
                    department.
                </p>
            );
        } else {
            return (
                <p>
                    Something went wrong in processing your request. Please
                    contact your organization&apos;s IT department.
                </p>
            );
        }
    }

    if (loading || !data) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider
            value={{
                me: data.me || null,
                loginAsUser,
                logout,
                refetch: async () => {
                    await refetch();
                },
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}
