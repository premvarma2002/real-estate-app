import { useUser, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useSupabase } from "./useSupabase";
import { useToast } from "@/lib/toast-context";

export const useUserSync = ()=>{
    const {user}=useUser();
    const { signOut } = useAuth();
    const setIsAdmin = useUserStore((state) => state.setIsAdmin);
    const { showToast } = useToast();

   const authSupabase = useSupabase()

   useEffect(()=>{
   if (!user) return;
   syncUser();
   },[user]);
    
  const syncUser = async () =>{
    const {data, error} = await authSupabase
    .from("users")
    .select("clerk_id,is_admin")
    .eq("clerk_id", user!.id)
    .single();

    if (error) {
      if (error.code === "PGRST303") {
        // JWT not yet valid — stale / clock-skew session, force sign-out
        console.warn("useUserSync: JWT not yet valid, signing out...");
        showToast(
          "error",
          "Session Expired",
          "Your session is no longer valid. Please sign in again."
        );
        await signOut();
        return;
      }

      if (error.code !== "PGRST116") {
        // PGRST116 = row not found, which is expected for new users
        console.error("useUserSync: select error", error);
        return;
      }
    }

     if (data) {
        // User Exists - just sync isAdmin to zustand
        setIsAdmin(data.is_admin ?? false);
          return;
     } 
      const {data:newUser, error:insertError} = await authSupabase.from("users").insert({
        clerk_id:user!.id,
        email:user?.emailAddresses[0].emailAddress,
        first_name: user!.firstName
      }).select("is_admin").single();

      if (insertError) {
        console.error("useUserSync: insert error", insertError);
        return;
      }

       if (newUser) {
          setIsAdmin(newUser.is_admin ?? false);
       }  

  }
   }