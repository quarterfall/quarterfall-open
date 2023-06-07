import { useRouter } from "next/router";

export function useParams<T>(): T {
    const router = useRouter();
    return (router.query as unknown) as T;
}
