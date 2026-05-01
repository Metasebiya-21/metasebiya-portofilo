import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/admin-auth";
import ResumeBuilderClient from "@/components/ResumeBuilderClient";

export const metadata = {
  title: "Admin - Resume Builder",
};

export default async function AdminResumeBuilderPage() {
  await requireAdminPage();
  
  return (
    <AdminShell>
      <ResumeBuilderClient />
    </AdminShell>
  );
}
