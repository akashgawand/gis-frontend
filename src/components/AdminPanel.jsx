import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './AdminPanel.css';

const AdminPanel = () => {
    const { user, hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    // Users state
    const [users, setUsers] = useState([]);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '', email: '', password: '', roleId: '', departmentId: ''
    });

    // Roles state
    const [roles, setRoles] = useState([]);
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });

    // Departments state
    const [departments, setDepartments] = useState([]);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });

    // Permissions (static display from roles)
    const permissionsMatrix = {
        'Admin': ['Create', 'Read', 'Update', 'Delete'],
        'Dept. HOD': ['Create', 'Read', 'Update'],
        'Surveyor': ['Create', 'Read'],
        'QC': ['Read', 'Update', 'Delete']
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [usersRes, rolesRes, deptsRes] = await Promise.all([
                usersAPI.getAll(),
                rolesAPI.getAll(),
                departmentsAPI.getAll()
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading data. Please check your login.');
        }
    };

    // ===== USERS MANAGEMENT =====
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await usersAPI.update(editingUser.id, {
                    username: userForm.username,
                    email: userForm.email,
                    roleId: userForm.roleId,
                    departmentId: userForm.departmentId
                });
                alert('User updated successfully!');
            } else {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(userForm)
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message);
                }
                alert('User created successfully!');
            }
            setShowUserForm(false);
            setEditingUser(null);
            setUserForm({ username: '', email: '', password: '', roleId: '', departmentId: '' });
            loadAllData();
        } catch (error) {
            alert(error.message || 'Error saving user');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            email: user.email,
            password: '',
            roleId: user.role_id || '',
            departmentId: user.department_id || ''
        });
        setShowUserForm(true);
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await usersAPI.delete(id);
            alert('User deleted!');
            loadAllData();
        } catch (error) {
            alert('Error deleting user');
            console.error(error);
        }
    };

    // ===== ROLES MANAGEMENT =====
    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            await rolesAPI.create(roleForm);
            alert('Role created successfully!');
            setShowRoleForm(false);
            setRoleForm({ name: '', description: '' });
            loadAllData();
        } catch (error) {
            alert('Error creating role');
            console.error(error);

        }
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm('Delete this role? Users with this role will be affected.')) return;
        try {
            await rolesAPI.delete(id);
            alert('Role deleted!');
            loadAllData();
        } catch (error) {
            alert('Error deleting role');
            console.error(error);

        }
    };

    // ===== DEPARTMENTS MANAGEMENT =====
    const handleDeptSubmit = async (e) => {
        e.preventDefault();
        try {
            await departmentsAPI.create(deptForm);
            alert('Department created successfully!');
            setShowDeptForm(false);
            setDeptForm({ name: '', description: '' });
            loadAllData();
        } catch (error) {
            alert('Error creating department');
            console.error(error);

        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await departmentsAPI.delete(id);
            alert('Department deleted!');
            loadAllData();
        } catch (error) {
            alert('Error deleting department');
            console.error(error);

        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Admin Panel - User & Role Management</h1>
                <p>Logged in as: <strong>{user?.username}</strong> ({user?.role})</p>
            </div>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={activeTab === 'roles' ? 'active' : ''}
                    onClick={() => setActiveTab('roles')}
                >
                    Roles
                </button>
                <button
                    className={activeTab === 'permissions' ? 'active' : ''}
                    onClick={() => setActiveTab('permissions')}
                >
                    Permissions
                </button>
                <button
                    className={activeTab === 'departments' ? 'active' : ''}
                    onClick={() => setActiveTab('departments')}
                >
                    Departments
                </button>
            </div>

            <div className="admin-content">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="section">
                        <div className="section-header">
                            <h2>Users Management</h2>
                            {hasPermission('create') && (
                                <button onClick={() => setShowUserForm(true)} className="btn-primary">
                                    + Add User
                                </button>
                            )}
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td><span className="badge badge-role">{user.role || 'No role'}</span></td>
                                        <td>{user.department || 'N/A'}</td>
                                        <td className="actions">
                                            {hasPermission('update') && (
                                                <button onClick={() => handleEditUser(user)} className="btn-edit">
                                                    Edit
                                                </button>
                                            )}
                                            {hasPermission('delete') && (
                                                <button onClick={() => handleDeleteUser(user.id)} className="btn-danger">
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ROLES TAB */}
                {activeTab === 'roles' && (
                    <div className="section">
                        <div className="section-header">
                            <h2>Roles Management</h2>
                            {hasPermission('create') && (
                                <button onClick={() => setShowRoleForm(true)} className="btn-primary">
                                    + Add Role
                                </button>
                            )}
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Role Name</th>
                                    <th>Description</th>
                                    <th>Permissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td>{role.id}</td>
                                        <td><strong>{role.name}</strong></td>
                                        <td>{role.description}</td>
                                        <td>
                                            {role.permissions?.filter(p => p).map(perm => (
                                                <span key={perm} className="badge badge-perm">{perm}</span>
                                            ))}
                                        </td>
                                        <td className="actions">
                                            {hasPermission('delete') && role.id > 4 && (
                                                <button onClick={() => handleDeleteRole(role.id)} className="btn-danger">
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PERMISSIONS TAB */}
                {activeTab === 'permissions' && (
                    <div className="section">
                        <h2>Permissions Matrix</h2>
                        <p className="info-text">View role-based permissions as defined in the system</p>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Create</th>
                                    <th>Read</th>
                                    <th>Update</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(permissionsMatrix).map(([role, perms]) => (
                                    <tr key={role}>
                                        <td><strong>{role}</strong></td>
                                        <td>{perms.includes('Create') ? '✅' : '❌'}</td>
                                        <td>{perms.includes('Read') ? '✅' : '❌'}</td>
                                        <td>{perms.includes('Update') ? '✅' : '❌'}</td>
                                        <td>{perms.includes('Delete') ? '✅' : '❌'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DEPARTMENTS TAB */}
                {activeTab === 'departments' && (
                    <div className="section">
                        <div className="section-header">
                            <h2>Departments Management</h2>
                            {hasPermission('create') && (
                                <button onClick={() => setShowDeptForm(true)} className="btn-primary">
                                    + Add Department
                                </button>
                            )}
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Department Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td>{dept.id}</td>
                                        <td><strong>{dept.name}</strong></td>
                                        <td>{dept.description || 'N/A'}</td>
                                        <td className="actions">
                                            {hasPermission('delete') && (
                                                <button onClick={() => handleDeleteDept(dept.id)} className="btn-danger">
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* USER FORM MODAL */}
            {showUserForm && (
                <div className="modal-overlay" onClick={() => { setShowUserForm(false); setEditingUser(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={handleUserSubmit}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={userForm.username}
                                onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={userForm.email}
                                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                required
                            />
                            {!editingUser && (
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    required
                                />
                            )}
                            <select
                                value={userForm.roleId}
                                onChange={e => setUserForm({ ...userForm, roleId: e.target.value })}
                                required
                            >
                                <option value="">Select Role *</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                            <select
                                value={userForm.departmentId}
                                onChange={e => setUserForm({ ...userForm, departmentId: e.target.value })}
                            >
                                <option value="">Select Department (optional)</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingUser ? 'Update' : 'Create'} User
                                </button>
                                <button type="button" onClick={() => { setShowUserForm(false); setEditingUser(null); }} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ROLE FORM MODAL */}
            {showRoleForm && (
                <div className="modal-overlay" onClick={() => setShowRoleForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Add New Role</h3>
                        <form onSubmit={handleRoleSubmit}>
                            <input
                                type="text"
                                placeholder="Role Name"
                                value={roleForm.name}
                                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={roleForm.description}
                                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                                rows="3"
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Create Role</button>
                                <button type="button" onClick={() => setShowRoleForm(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DEPARTMENT FORM MODAL */}
            {showDeptForm && (
                <div className="modal-overlay" onClick={() => setShowDeptForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Add New Department</h3>
                        <form onSubmit={handleDeptSubmit}>
                            <input
                                type="text"
                                placeholder="Department Name"
                                value={deptForm.name}
                                onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={deptForm.description}
                                onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                                rows="3"
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Create Department</button>
                                <button type="button" onClick={() => setShowDeptForm(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
