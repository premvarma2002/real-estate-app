import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: async (url, options = {}) => {
                const token = await getToken();
                const headers = new Headers(options?.headers);
                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }
                return fetch(url, { ...options, headers });
            },
        },
    });
}