import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { User } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { UserCheck, Shield } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading registered platform users..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">User Registry ({users.length})</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          Real user accounts stored in PostgreSQL with role assignments.
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users found" description="No user records exist in the database." />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Campaigns</th>
                  <th className="p-4">Contributions</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-cloud-50/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ice-100 border border-ice-200 text-ice-700 flex items-center justify-center font-bold overflow-hidden shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-cloud-900 block">{u.name}</span>
                        {u.bio && (
                          <span className="text-[11px] text-cloud-800/60 block line-clamp-1 max-w-xs">
                            {u.bio}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-cloud-800 font-medium">{u.email}</td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${
                          u.role === 'ADMIN'
                            ? 'bg-lavender-100 text-lavender-800'
                            : 'bg-cloud-100 text-cloud-800'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-cloud-900">
                      {u._count?.campaigns ?? 0}
                    </td>

                    <td className="p-4 font-bold text-cloud-900">
                      {u._count?.contributions ?? 0}
                    </td>

                    <td className="p-4 text-cloud-800/70">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4 text-right">
                      {u.role === 'USER' ? (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Elevate "${u.name}" to Administrator?`)) {
                              await adminApi.updateUserRole(u.id, 'ADMIN');
                              fetchUsers();
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-lavender-700 hover:bg-lavender-50 border border-lavender-200 rounded-lg transition"
                        >
                          Promote to Admin
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Revoke admin privileges for "${u.name}"?`)) {
                              await adminApi.updateUserRole(u.id, 'USER');
                              fetchUsers();
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-cloud-600 hover:bg-cloud-100 border border-cloud-200 rounded-lg transition"
                        >
                          Demote to User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
