"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";

async function requireAdmin() {
  const serverClient = await getSupabaseServer();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) throw new Error("Email and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  if (!userId) throw new Error("User ID is required.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}
