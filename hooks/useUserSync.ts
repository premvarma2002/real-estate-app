import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useSupabase } from "./useSupabase";

export const useUserSync = ()=>{
    const {user}=useUser();
    const setIsAdmin = useUserStore((state) => state.setIsAdmin);

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

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found, which is expected for new users
      console.error("useUserSync: select error", error);
      return;
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