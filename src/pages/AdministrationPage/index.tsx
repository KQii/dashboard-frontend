import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { Users, CircleUser } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "../../components/layout/PageLayout";
import { Table } from "../../components/container/Table";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { StatCard } from "../../components/ui/StatCard";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { createUsersColumns } from "./usersColumn";
import { createRolesColumns } from "./rolesColumn";
import { createUsersFilterConfig } from "./filterConfigs";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useUpdateUserRole,
} from "../../features/users/useUsers";
import { useRoles } from "../../features/roles/useRoles";
import { User, Role } from "../../types/user.types";
import { useIsFetching } from "@tanstack/react-query";
import { useCreateUser } from "../../features/auth/useAuth";
import useTitle from "../../hooks/useTitle";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function AdministrationPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showConfirmDisableModal, setShowConfirmDisableModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");

  // Pagination and filtering state
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 5;
  const [userFilters, setUserFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [userSort, setUserSort] = useState<
    { column: string; direction: "asc" | "desc" }[]
  >([]);

  const [rolePage, setRolePage] = useState(1);
  const rolePageSize = 5;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  const { users: totalUsers, refetchUsers: refetchTotalUsers } = useUsers({
    page: 1,
    limit: 1000,
  });

  const { roles: totalRoles, refetchRoles: refetchTotalRoles } = useRoles({
    page: 1,
    limit: 10,
  });

  // Fetch users data
  const { users, pagination, isLoadingUsers, refetchUsers, usersUpdatedAt } =
    useUsers({
      filters: userFilters,
      sort: userSort,
      page: userPage,
      limit: userPageSize,
    });

  // Fetch roles data
  const {
    roles,
    pagination: rolesPagination,
    isLoadingRoles,
    refetchRoles,
  } = useRoles({
    page: rolePage,
    limit: rolePageSize,
  });

  const { updateStatus, isUpdatingStatus } = useUpdateUserStatus();
  const { updateRole } = useUpdateUserRole();
  const { deleteUser, isDeletingUser } = useDeleteUser();
  const { isCreating, createUser } = useCreateUser();

  const isFetchingAny = useIsFetching();
  const isRefreshing = isFetchingAny > 0;

  useTitle("Administration");

  // Update lastUpdated when data changes
  useEffect(() => {
    if (usersUpdatedAt) {
      setLastUpdated(new Date(usersUpdatedAt));
      setCountdown(30);
    }
  }, [usersUpdatedAt]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleDisableUser = useCallback((user: User) => {
    setUserToDisable(user);
    setShowConfirmDisableModal(true);
  }, []);

  const confirmDisableUser = () => {
    if (userToDisable) {
      updateStatus(
        { userId: userToDisable.id, isActive: false },
        {
          onSuccess: () => {
            setShowConfirmDisableModal(false);
            setUserToDisable(null);
          },
        }
      );
    }
  };

  const handleEnableUser = useCallback(
    (user: User) => {
      updateStatus({ userId: user.id, isActive: true });
    },
    [updateStatus]
  );

  const handleDeleteUser = useCallback((user: User) => {
    setUserToDelete(user);
    setShowConfirmDeleteModal(true);
  }, []);

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => {
          setShowConfirmDeleteModal(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleUpdateRole = () => {
    if (!selectedUser || !newRoleId) return;

    updateRole(
      { userId: selectedUser.id, roleId: newRoleId },
      {
        onSuccess: () => {
          setShowRoleModal(false);
          setSelectedUser(null);
          setNewRoleId("");
        },
      }
    );
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchUsers(),
      refetchRoles(),
      refetchTotalUsers(),
      refetchTotalRoles(),
    ]);
  };

  // Sort users to put current user first
  const sortedUsers = useMemo(() => {
    if (!users || !currentUser) return users;
    return [...users].sort((a, b) => {
      if (a.username === currentUser.name) return -1;
      if (b.username === currentUser.name) return 1;
      return 0;
    });
  }, [users, currentUser]);

  const usersColumns = useMemo(
    () =>
      createUsersColumns(
        handleViewUserDetail,
        handleDisableUser,
        handleEnableUser,
        userPage,
        userPageSize
      ),
    [userPage, userPageSize, handleDisableUser, handleEnableUser]
  );

  const rolesColumns = useMemo(
    () => createRolesColumns(rolePage, rolePageSize),
    [rolePage, rolePageSize]
  );

  return (
    <PageLayout
      pageTitle="Administration"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
    >
      {/* Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total User"
          value={totalUsers.length}
          subtitle={`(${totalUsers.filter((u) => u.is_active).length} active, ${
            totalUsers.filter((u) => !u.is_active).length
          } inactive)`}
          icon={Users}
          iconColor="text-cyan-600"
        />

        <StatCard
          label="Total Role"
          value={totalRoles.length}
          subtitle={`(${
            totalUsers.filter((u) => u.role.name === "admin").length
          } admin, ${
            totalUsers.filter((u) => u.role.name === "operator").length
          } operator)`}
          icon={CircleUser}
          iconColor="text-green-600"
        />

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-3">
              Admin Action
            </p>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              Create User
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Table<User>
          data={sortedUsers}
          columns={usersColumns}
          isLoading={isLoadingUsers}
          title="User Accounts"
          pageSize={userPageSize}
          getRowClassName={(user) =>
            currentUser && user.username === currentUser.name
              ? "!bg-cyan-50 hover:!bg-cyan-100 border-l-4 !border-l-cyan-500"
              : ""
          }
          useServerSide={true}
          onFilterChange={setUserFilters}
          onSortChange={setUserSort}
          onPageChange={setUserPage}
          onRefresh={refetchUsers}
          currentPage={userPage}
          totalCount={pagination?.total}
          totalPages={pagination?.totalPages}
          hasNextPage={pagination?.hasNextPage}
          hasPrevPage={pagination?.hasPrevPage}
          filterConfig={createUsersFilterConfig(totalRoles)}
        />
      </div>

      <div className="mb-8">
        <Table<Role>
          data={roles}
          columns={rolesColumns}
          isLoading={isLoadingRoles}
          title="Roles"
          pageSize={rolePageSize}
          useServerSide={true}
          onPageChange={setRolePage}
          onRefresh={refetchRoles}
          currentPage={rolePage}
          totalCount={rolesPagination?.total}
          totalPages={rolesPagination?.totalPages}
          hasNextPage={rolesPagination?.hasNextPage}
          hasPrevPage={rolesPagination?.hasPrevPage}
          showFilterButton={false}
        />
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal
          isOpen={showUserDetailModal}
          onClose={() => {
            setShowUserDetailModal(false);
            setSelectedUser(null);
          }}
          title="User Details"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="text-sm text-gray-900">
                <span className="mr-2">{selectedUser.id}</span>
                <span
                  className={`px-2 py-1 m-auto text-xs font-semibold rounded-md w-fit ${
                    selectedUser.is_verified
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedUser.is_verified ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Username</p>
                <p className="text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <RoleBadge role={selectedUser.role.name} className="mt-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <StatusBadge status={selectedUser.is_active} className="mt-1" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Created At</p>
              <p className="text-sm text-gray-900">
                {new Date(selectedUser.created_at).toLocaleString()}
                <span className="text-gray-500 ml-2">
                  (
                  {formatDistanceToNow(new Date(selectedUser.created_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Updated At</p>
              <p className="text-sm text-gray-900">
                {new Date(selectedUser.updated_at).toLocaleString()}
                <span className="text-gray-500 ml-2">
                  (
                  {formatDistanceToNow(new Date(selectedUser.updated_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </p>
            </div>
            {selectedUser.last_login && (
              <div>
                <p className="text-sm font-medium text-gray-700">Last Login</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.last_login).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedUser.last_login), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {selectedUser.role.name !== "admin" && (
                <button
                  onClick={() => {
                    handleDeleteUser(selectedUser);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 ml-auto text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedUser.role.name !== "admin" && (
                <button
                  onClick={() => {
                    setNewRoleId(selectedUser.role.id);
                    setShowRoleModal(true);
                    setShowUserDetailModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                >
                  Change Role
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete User */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        resourceName="this user"
        onConfirm={confirmDeleteUser}
        onCloseModal={() => {
          setShowConfirmDeleteModal(false);
          setUserToDelete(null);
        }}
        disabled={isDeletingUser}
        message="Are you sure you want to permanently delete this user?"
      />

      {/* Confirm Disable User */}
      <ConfirmModal
        isOpen={showConfirmDisableModal}
        title="Confirm Disable"
        variant="warning"
        resourceName="this user"
        onConfirm={confirmDisableUser}
        onCloseModal={() => {
          setShowConfirmDisableModal(false);
          setUserToDisable(null);
        }}
        disabled={isUpdatingStatus}
        message="Are you sure you want to disable this user?"
        confirmText="Disable"
      />

      {/* Role Update Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
          setNewRoleId("");
        }}
        title="Update User Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">User</p>
              <p className="text-gray-900 font-mono italic">
                {selectedUser.id}
              </p>
              <p className="text-gray-900 font-semibold">
                {selectedUser.username}
              </p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Assign Role
              </label>
              <div className="space-y-2">
                {totalRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.name}
                      checked={newRoleId === role.id}
                      onChange={() => setNewRoleId(role.id)}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="font-medium text-gray-900 capitalize">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRoleId("");
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

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        title="Create User"
        size="md"
      >
        <div className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-gray-700 font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => {
              if (!newUsername.trim()) {
                toast.error("Please enter an username");
                return;
              }
              if (!newEmail.trim()) {
                toast.error("Please enter an email");
                return;
              }

              createUser(
                {
                  username: newUsername,
                  email: newEmail,
                },
                {
                  onSuccess: () => {
                    // Close modal and reset form state on success
                    setShowCreateUserModal(false);
                    setNewEmail("");
                    setNewUsername("");
                  },
                }
              );
            }}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Sending email..." : "Send Activation Email"}
          </Button>
        </div>
      </Modal>
    </PageLayout>
  );
}
