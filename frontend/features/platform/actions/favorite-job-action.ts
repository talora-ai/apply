"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function favoriteJobAction(formData:FormData):Promise<void>{
 const token=(await cookies()).get("talora_token")?.value; const apiUrl=process.env.API_URL; const id=Number(formData.get("job_id")); const favorite=formData.get("favorite")==="1";
 if(!token||!apiUrl||!Number.isInteger(id)||id<1)return;
 try{await fetch(`${apiUrl}/client/jobs/${id}/favorite`,{method:favorite?"DELETE":"POST",headers:{Accept:"application/json",Authorization:`Bearer ${token}`},cache:"no-store"});}catch{return}
 revalidatePath("/jobs/search");revalidatePath("/favorites");revalidatePath("/dashboard");
}
