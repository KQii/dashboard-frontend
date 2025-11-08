import { useState, useEffect } from "react";
import { Users, MoreVertical } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { Table } from "../components/container/Table";
import { AuditLogModal } from "../components/container/AuditLogModal";
import { Modal } from "../components/common/Modal";
import { Account, AuditLog, TableColumn } from "../types";
import { supabase } from "../services/supabase";
import { format } from "date-fns";

export function AdministrationPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "user" | "viewer">("user");

  useEffect(() => {
    loadAccounts();
    loadAuditLogs();
  }, []);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      setAccounts((data || []) as Account[]);
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      setAuditLogs((data || []) as AuditLog[]);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  const handleViewAuditLog = (accountId: string) => {
    setSelectedUserId(accountId);
    setShowAuditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedAccount) return;

    try {
      await supabase
        .from("accounts")
        .update({ role: newRole })
        .eq("id", selectedAccount.id);

      setShowRoleModal(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const accountsColumns: TableColumn<Account>[] = [
    {
      key: "name",
      label: "Name",
      width: "20%",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      width: "25%",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      width: "15%",
      render: (role) => {
        const colors = {
          admin: "bg-red-100 text-red-800",
          user: "bg-blue-100 text-blue-800",
          viewer: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[role]}`}
          >
            {role.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (status) => {
        const colors = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          suspended: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}
          >
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "last_login",
      label: "Last Login",
      width: "15%",
      render: (value) => (value ? format(new Date(value), "PPp") : "Never"),
    },
    {
      key: "created_at",
      label: "Created",
      width: "10%",
      render: (value) => format(new Date(value), "PP"),
    },
  ];

  return (
    <PageLayout title="Administration">
      <div className="mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total Accounts
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {accounts.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-cyan-600 opacity-20" />
          </div>
        </div>

        <Table<Account>
          data={accounts}
          columns={accountsColumns}
          isLoading={isLoadingAccounts}
          title="User Accounts"
          pageSize={10}
          rowActions={(account) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedAccount(account);
                  setNewRole(account.role);
                  setShowRoleModal(true);
                }}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
          onRowClick={(account) => handleViewAuditLog(account.id)}
        />
      </div>

      <AuditLogModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId || ""}
        logs={auditLogs}
        isLoading={isLoadingAuditLogs}
      />

      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedAccount(null);
        }}
        title="Update User Role"
        size="sm"
      >
        {selectedAccount && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">User</p>
              <p className="text-gray-900 font-semibold">
                {selectedAccount.name}
              </p>
              <p className="text-sm text-gray-500">{selectedAccount.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Assign Role
              </label>
              <div className="space-y-2">
                {(["admin", "user", "viewer"] as const).map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={newRole === role}
                      onChange={() => setNewRole(role)}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="font-medium text-gray-900 capitalize">
                      {role}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedAccount(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                Update Role
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
