import "server-only";
import { cookies } from "next/headers";

export async function getPlatformData<T>(endpoint:string): Promise<T | null> {
 const token=(await cookies()).get("talora_token")?.value;
 const apiUrl=process.env.API_URL;
 if(!token || !apiUrl) return null;
 try {
  const response=await fetch(`${apiUrl}${endpoint.startsWith('/')?endpoint:`/${endpoint}`}`,{headers:{Accept:'application/json',Authorization:`Bearer ${token}`},cache:'no-store'});
  if(!response.ok) return null;
  const payload=(await response.json()) as {data?:T};
  return payload.data ?? null;
 } catch { return null; }
}
