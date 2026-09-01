import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiFileText, FiShield, FiActivity, FiLogOut } from 'react-icons/fi';

function Sidebar({ user, onLogout }) {
  const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST' || isAdmin;

  return (
    <div className="sidebar">
      <div className="logo">
        <h5>CreditRisk AI</h5>
        <small>Decisioning Platform</small>
      </div>

      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiGrid size={16} />
          Dashboard
        </NavLink>

        {isAnalyst && (
          <>
            <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiUsers size={16} />
              Customers
            </NavLink>
            <NavLink to="/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiFileText size={16} />
              Applications
            </NavLink>
          </>
        )}

        {isAdmin && (
          <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiShield size={16} />
            Audit Log
          </NavLink>
        )}

        <NavLink to="/system-health" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiActivity size={16} />
          System Health
        </NavLink>
      </nav>

      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, padding: '0 20px' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 10 }}>
          {user?.email}
          <br />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.role}</span>
        </div>
        <button
          onClick={onLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
