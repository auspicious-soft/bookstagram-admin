// admin/page.tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/publisher/dashboard");
  return null;
}
