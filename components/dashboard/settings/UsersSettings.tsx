import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X, Loader2, Edit2, Shield, Lock, CheckCircle, Clock, UserX, MoreVertical } from 'lucide-react';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastActive?: string;
}

type StatusFilter = 'all' | 'Active' | 'Pending' | 'Inactive';

interface Role {
  id: string;
  role: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
}

const AVAILABLE_PERMISSIONS = [
  'Full Access',
  'User Management',
  'Settings',
  'Billing',
  'View Reports',
  'Manage Team',
  'Edit Data',
  'Approve Requests',
  'View Data',
  'Create Records',
  'Edit Own Records',
  'View Data Only'
];

export const UsersSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [inviteData, setInviteData] = useState({ email: '', name: '', role: 'User' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  
  // Permission checks
  const isAdmin = api.auth.isAdmin();
  const canManageUsers = api.auth.hasPermission('User Management');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load roles for everyone (needed for dropdowns)
      const roleData = await api.teamMembers.getRoles();
      setRoles(roleData);
      
      // Only load team members if user has permission
      if (canManageUsers || isAdmin) {
        const members = await api.teamMembers.getAll();
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteData.email || !inviteData.name) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const newMember = await api.teamMembers.invite(inviteData);
      setTeamMembers([newMember, ...teamMembers]);
      setShowInviteModal(false);
      setInviteData({ email: '', name: '', role: 'User' });
    } catch (error: any) {
      alert(error.message || 'Failed to invite user');
    }
  };

  const handleUpdateMemberRole = async (id: string, role: string) => {
    try {
      await api.teamMembers.update(id, { role });
      setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role } : m));
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.teamMembers.remove(id);
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateMemberStatus = async (id: string, status: string) => {
    try {
      await api.teamMembers.update(id, { status });
      setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, status } : m));
      setActionMenuId(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Filter members by status
  const filteredMembers = statusFilter === 'all' 
    ? teamMembers 
    : teamMembers.filter(m => m.status === statusFilter);

  // Count by status
  const statusCounts = {
    all: teamMembers.length,
    Active: teamMembers.filter(m => m.status === 'Active').length,
    Pending: teamMembers.filter(m => m.status === 'Pending').length,
    Inactive: teamMembers.filter(m => m.status === 'Inactive').length
  };

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ name: role.role, description: role.description || '', permissions: role.permissions });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
    }
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name || roleForm.permissions.length === 0) {
      alert('Please enter a role name and select at least one permission');
      return;
    }
    try {
      if (editingRole) {
        const updated = await api.roles.update(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
        setRoles(roles.map(r => r.id === editingRole.id ? updated : r));
      } else {
        const created = await api.roles.create({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
        setRoles([...roles, created]);
      }
      setShowRoleModal(false);
    } catch (error: any) {
      alert(error.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.roles.delete(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete role');
    }
  };

  const togglePermission = (perm: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  // Show access denied if user doesn't have permission
  if (!canManageUsers && !isAdmin) {
    return (
      <div className="text-center py-12">
        <Lock size={48} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h3>
        <p className="text-slate-500">You don't have permission to manage users. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-brand-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Users & Permissions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Manage team members and access levels</p>
          </div>
        </div>
        {canManageUsers && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus size={18} className="mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'Active', 'Pending', 'Inactive'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              statusFilter === status
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-600'
            }`}
          >
            {status === 'Active' && <CheckCircle size={16} />}
            {status === 'Pending' && <Clock size={16} />}
            {status === 'Inactive' && <UserX size={16} />}
            {status === 'all' ? 'All' : status}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              statusFilter === status ? 'bg-white/20' : 'bg-slate-200 dark:bg-dark-600'
            }`}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Team Members Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Last Active</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMembers.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                {teamMembers.length === 0 ? 'No team members yet. Click "Invite User" to add one.' : `No ${statusFilter} members found.`}
              </td></tr>
            ) : filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{member.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <select value={member.role} onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-sm dark:text-white">
                    {roles.map(r => (
                      <option key={r.id} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                    member.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    member.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {member.status === 'Active' && <CheckCircle size={12} />}
                    {member.status === 'Pending' && <Clock size={12} />}
                    {member.status === 'Inactive' && <UserX size={12} />}
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{member.lastActive || 'Never'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block">
                    <button 
                      onClick={() => setActionMenuId(actionMenuId === member.id ? null : member.id)} 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {actionMenuId === member.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                        {member.status !== 'Active' && (
                          <button onClick={() => handleUpdateMemberStatus(member.id, 'Active')} className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                            <CheckCircle size={16} /> Activate
                          </button>
                        )}
                        {member.status !== 'Pending' && (
                          <button onClick={() => handleUpdateMemberStatus(member.id, 'Pending')} className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2">
                            <Clock size={16} /> Set Pending
                          </button>
                        )}
                        {member.status !== 'Inactive' && (
                          <button onClick={() => handleUpdateMemberStatus(member.id, 'Inactive')} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-dark-700 flex items-center gap-2">
                            <UserX size={16} /> Deactivate
                          </button>
                        )}
                        <hr className="my-1 border-slate-200 dark:border-slate-700" />
                        <button onClick={() => { handleRemoveMember(member.id); setActionMenuId(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions - Admin Only */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-brand-600" />
            Role Permissions
            {!isAdmin && <span className="text-xs text-slate-500 font-normal">(View Only)</span>}
          </h3>
          {isAdmin && (
            <Button size="sm" onClick={() => openRoleModal()}>
              <Plus size={16} className="mr-1" />
              Add Role
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">{role.role}</h4>
                  {role.isDefault && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded">Default</span>}
                </div>
                {role.description && <p className="text-sm text-slate-500 mb-2">{role.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm, j) => (
                    <span key={j} className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs rounded-full">{perm}</span>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openRoleModal(role)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  {!role.isDefault && (
                    <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
                <input type="text" value={inviteData.name} onChange={(e) => setInviteData({...inviteData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                <input type="email" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white" placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                <select value={inviteData.role} onChange={(e) => setInviteData({...inviteData, role: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white">
                  {roles.map(r => (
                    <option key={r.id} value={r.role}>{r.role}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleInviteUser}>Send Invite</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
              <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role Name *</label>
                <input 
                  type="text" 
                  value={roleForm.name} 
                  onChange={(e) => setRoleForm({...roleForm, name: e.target.value})} 
                  disabled={editingRole?.isDefault}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white disabled:bg-slate-100 disabled:cursor-not-allowed" 
                  placeholder="e.g., Sales Manager" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <input type="text" value={roleForm.description} onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-900 text-slate-900 dark:text-white" placeholder="Brief description of this role" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Permissions *</label>
                <div className="grid grid-cols-2 gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-dark-700 rounded">
                      <input 
                        type="checkbox" 
                        checked={roleForm.permissions.includes(perm)} 
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSaveRole}>{editingRole ? 'Update Role' : 'Create Role'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
