import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

// Admin is a private single-owner tool — keep it out of search indexes.
export const metadata: Metadata = {
  title: "ניהול האתר · סקין ביוטי קליניק",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
