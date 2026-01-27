import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Shield,
  UserPlus,
  Search,
  Crown,
} from "lucide-react";
import { usersAPI } from "../utils/api";
import { formatDate, getInitials } from "../utils/formatters";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;

      const [usersRes, statsRes] = await Promise.all([
        usersAPI.getAllUsers(params),
        usersAPI.getUserStats(),
      ]);

      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    try {
      await usersAPI.promoteToAdmin(selectedUser.id);
      alert(`${selectedUser.email} has been promoted to admin!`);
      setPromoteModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error("Error promoting user:", error);
      alert(error.response?.data?.error || "Failed to promote user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-2">
          Manage users and administrator access
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
            <UsersIcon className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.totalUsers || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">
              Administrators
            </h3>
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.adminCount || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Customers</h3>
            <UsersIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.customerCount || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">
              New (30 days)
            </h3>
            <UserPlus className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.recentSignUps || 0}
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="alert alert-info">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Admin Account Security</p>
            <p className="text-sm">
              Admin accounts cannot be created through public sign-up. Only
              existing administrators can promote customer accounts to admin
              status. This ensures proper access control and security.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="CUSTOMER">Customers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Joined Date</th>
                <th className="table-header-cell">Promoted By</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-cell text-center py-8">
                    <div className="spinner border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-cell text-center text-slate-500 py-8"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row-hover">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : "N/A"}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell">
                      {user.role === "ADMIN" ? (
                        <span className="badge badge-danger flex items-center gap-1 w-fit">
                          <Crown className="w-3 h-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="badge badge-info">Customer</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="table-cell text-sm text-slate-600">
                      {user.promotedBy ? (
                        <div>
                          <p>By Admin</p>
                          <p className="text-xs">
                            {formatDate(user.promotedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.role === "CUSTOMER" ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setPromoteModalOpen(true);
                          }}
                          className="btn btn-sm btn-outline"
                        >
                          <Shield className="w-4 h-4" />
                          Promote to Admin
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Current Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote Modal */}
      {promoteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Promote to Administrator
              </h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-600 mb-2">User Details:</p>
              <p className="font-semibold text-slate-900">
                {selectedUser.email}
              </p>
              <p className="text-sm text-slate-600">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>

            <div className="alert alert-warning mb-4">
              <p className="text-sm">
                <strong>Warning:</strong> This action will grant administrator
                privileges to this user. They will have full access to the admin
                dashboard, inventory management, and user promotion.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setPromoteModalOpen(false);
                  setSelectedUser(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={handlePromote} className="btn btn-primary">
                <Shield className="w-4 h-4" />
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
