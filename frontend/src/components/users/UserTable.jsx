import { Crown, Shield, ShieldOff } from "lucide-react";
import { formatDate, getInitials } from "../../utils/formatters";

const UserTable = ({
  loading,
  filteredUsers,
  setSelectedUser,
  setPromoteModalOpen,
  setDemoteModalOpen,
}) => {
  return (
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
              <div className="spinner border-primary mx-auto"></div>
            </td>
          </tr>
        ) : filteredUsers.length === 0 ? (
          <tr>
            <td
              colSpan="6"
              className="table-cell text-center text-muted-foreground py-8"
            >
              No users found
            </td>
          </tr>
        ) : (
          filteredUsers.map((user) => (
            <tr key={user.id} className="table-row-hover">
              <td className="table-cell">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted-foreground rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div>
                    <p className="font-medium ">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                  <span className="badge badge-info">User</span>
                )}
              </td>
              <td className="table-cell text-sm text-muted-foreground">
                {formatDate(user.createdAt)}
              </td>
              <td className="table-cell text-sm text-muted-foreground">
                {user.promotedBy ? (
                  <div>
                    <p>By Admin</p>
                    <p className="text-xs">{formatDate(user.promotedAt)}</p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="table-cell">
                {user.role === "USER" ? (
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
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setDemoteModalOpen(true);
                    }}
                    className="btn btn-sm btn-outline"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Demote to user
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default UserTable;
