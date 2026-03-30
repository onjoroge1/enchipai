import { UsersTable } from "@/components/admin/users-table";

export default function UsersPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">User Management</h1>
        <p className="text-muted-foreground">Create accounts, assign roles, and manage access</p>
      </div>

      <UsersTable />
    </>
  );
}
