import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Shield,
  UserPlus,
  Search,
  Crown,
  ShieldOff,
} from "lucide-react";
import { usersAPI } from "../utils/api";
import { formatDate, getInitials } from "../utils/formatters";
import { toast } from "sonner";
import StatsCard from "../components/users/StatsCard";
import UserTable from "../components/users/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalOpen, setDemoteModalOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

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
      setIsChangingStatus(true);
      await usersAPI.promoteToAdmin(selectedUser.id);
      toast.success(`${selectedUser.email} has been promoted to admin!`);
      setPromoteModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error(error.response?.data?.error || "Failed to promote user");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDemote = async () => {
    try {
      setIsChangingStatus(true);
      await usersAPI.demoteToUser(selectedUser.id);
      toast.success(`${selectedUser.email} has been demoted to user!`);
      setDemoteModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error("Error demoting user:", error);
      toast.error(error.response?.data?.error || "Failed to demote user");
    } finally {
      setIsChangingStatus(false);
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
      <div>
        <h1 className="text-3xl font-bold ">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users and administrator access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={UsersIcon}
          color="#2b7fff"
          loading={loading}
        />

        <StatsCard
          title="Administrators"
          value={stats?.adminCount}
          icon={Shield}
          color="#ad46ff"
          loading={loading}
        />

        <StatsCard
          title="Customers"
          value={stats?.customerCount}
          icon={UsersIcon}
          color="#00c951"
          loading={loading}
        />

        <StatsCard
          title="New (30 days)"
          value={stats?.recentSignUps}
          icon={UserPlus}
          color="#ff6900"
          loading={loading}
        />
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-50">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground not-md:hidden" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" input pr-10"
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

      <div className="card">
        <div className="overflow-x-auto">
          <UserTable
            loading={loading}
            filteredUsers={filteredUsers}
            setSelectedUser={setSelectedUser}
            setPromoteModalOpen={setPromoteModalOpen}
            setDemoteModalOpen={setDemoteModalOpen}
          />
        </div>
      </div>

      {/* Promote Modal */}
      {promoteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-secondary-foreground/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold ">Promote to Administrator</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                User Details:
              </p>
              <p className="font-semibold">{selectedUser.email}</p>
              <p className="text-sm text-muted-foreground">
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
              <button
                onClick={handlePromote}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChangingStatus}
              >
                <Shield className="w-4 h-4" />
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demote Modal */}
      {demoteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-secondary-foreground/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold ">Demote to User</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                User Details:
              </p>
              <p className="font-semibold">{selectedUser.email}</p>
              <p className="text-sm text-muted-foreground">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>

            <div className="alert alert-warning mb-4">
              <p className="text-sm">
                <strong>Warning:</strong> This action will remove administrator
                privileges from this user. They will no longer have access to
                the admin dashboard, inventory management, or the ability to
                promote other users.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDemoteModalOpen(false);
                  setSelectedUser(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDemote}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChangingStatus}
              >
                <Shield className="w-4 h-4" />
                Confirm Demotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
