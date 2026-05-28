import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiX } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminCustomers = () => {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setUsers(r.data.users || []))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = async (id, current) => {
    try {
      await axios.put(`${API}/users/${id}`, { isActive: !current }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((us) => us.map((u) => u._id === id ? { ...u, isActive: !current } : u));
      toast.success('Customer updated');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div className="admin-page-title">
        <h1>Customers</h1>
        <p>{users.length} registered users</p>
      </div>

      <div className="admin-search-bar" style={{ marginBottom: '1rem' }}>
        <FiSearch size={16}/>
        <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        {search && <button onClick={() => setSearch('')}><FiX size={14}/></button>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr><th>Customer</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="td-product">
                      <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--navy)',color:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.9rem',flexShrink:0 }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span style={{fontWeight:600}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--textm)'}}>{u.email}</td>
                  <td>
                    <span className={`status-pill ${u.role === 'admin' ? 'featured' : 'normal'}`}>{u.role}</span>
                  </td>
                  <td style={{color:'var(--textl)',fontSize:'0.82rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{ color: u.isActive ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize:'0.82rem' }}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className={`td-btn ${u.isActive ? 'del' : 'edit'}`} onClick={() => toggleActive(u._id, u.isActive)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? '🚫' : '✅'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
