import { supabase } from "./supabaseClient";

export type CustomerActivityType =
    | "LOGIN"
    | "LOGOUT"
    | "SESSION_ENDED"
    | "SEARCH"
    | "PRODUCT_VIEW"
    | "PRICE_VIEW"
    | "REGISTRATION"
    | "PASSWORD_RESET";

interface LogCustomerActivityOptions {
    actionType: CustomerActivityType;
    customerEmail?: string | null;
    details?: Record<string, unknown>;
}

export async function logCustomerActivity({
    actionType,
    customerEmail = null,
    details = {},
}: LogCustomerActivityOptions) {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.warn(
                "Unable to get current customer for activity log:",
                userError
            );

            return;
        }

        const { data: customerProfile, error: profileError } =
            await supabase
                .from("customer_profiles")
                .select("id, email, company_name")
                .eq("user_id", user.id)
                .maybeSingle();

        if (profileError) {
            console.warn(
                "Unable to get customer profile for activity log:",
                profileError
            );
        }

        const { error } = await supabase
            .from("customer_activity_logs")
            .insert({
                user_id: user.id,
                customer_profile_id: customerProfile?.id ?? null,
                company_name: customerProfile?.company_name ?? null,
                customer_email:
                    customerEmail ??
                    customerProfile?.email ??
                    user.email ??
                    null,
                action_type: actionType,
                action_details: details,
            });

        if (error) {
            console.error(
                "Customer activity log error:",
                error
            );
        }
    } catch (error) {
        console.error(
            "Customer activity logging exception:",
            error
        );
    }
}