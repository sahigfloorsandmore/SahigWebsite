"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogOut, Download, RefreshCw, Phone, Mail, Clock, CheckCircle, FileText, ChevronDown, Plus, Trash2, X, Activity, Settings, Newspaper, Edit, Link2, Image as ImageIcon } from "lucide-react";
import "./admin.css";

export default function AdminLeads() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("leads"); // leads, portfolio, blog
  
  // Leads Portal States
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All"); // All, New, Contacted, Completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Settings Management States
  const [recipientEmails, setRecipientEmails] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Portfolio Management States
  const [portfolio, setPortfolio] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    description: "",
    imageUrl: ""
  });
  const [projectFile, setProjectFile] = useState(null);
  const [addingProject, setAddingProject] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState("");

  // Categories Settings States
  const [categories, setCategories] = useState([]);
  const [newCategoryText, setNewCategoryText] = useState("");
  const [savingCategories, setSavingCategories] = useState(false);

  // Blog Management States
  const [blog, setBlog] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: ""
  });
  const [editingPost, setEditingPost] = useState(null);
  const [addingPost, setAddingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  // Webhook and Sync Settings States
  const [webhookSecret, setWebhookSecret] = useState("");
  const [instagramWebhook, setInstagramWebhook] = useState("");
  const [linkedinWebhook, setLinkedinWebhook] = useState("");
  const [savingSyncSettings, setSavingSyncSettings] = useState(false);
  const [syncSettingsSuccess, setSyncSettingsSuccess] = useState("");

  useEffect(() => {
    const savedPassword = sessionStorage.getItem("adminPassword");
    if (savedPassword) {
      fetchDashboardData(savedPassword);
    }
  }, []);

  const fetchDashboardData = async (pw) => {
    setLoading(true);
    setError("");
    try {
      // Fetch leads
      const res = await fetch("/api/leads", {
        method: "GET",
        headers: { "x-admin-password": pw }
      });

      if (res.ok) {
        const leadsData = await res.json();
        const sortedLeads = leadsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeads(sortedLeads);
        setFilteredLeads(sortedLeads);
        setIsAuthenticated(true);
        sessionStorage.setItem("adminPassword", pw);

        // Fetch lead email routing and sync settings
        const settingsRes = await fetch("/api/settings", {
          method: "GET",
          headers: { "x-admin-password": pw }
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setRecipientEmails(settingsData.recipientEmails || "");
          setWebhookSecret(settingsData.webhookSecret || "");
          setInstagramWebhook(settingsData.instagramWebhook || "");
          setLinkedinWebhook(settingsData.linkedinWebhook || "");
        }

        // Fetch portfolio projects
        const portfolioRes = await fetch("/api/portfolio");
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          const sortedPortfolio = portfolioData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPortfolio(sortedPortfolio);
        }

        // Fetch project categories configuration
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) {
            setNewProject((prev) => ({ ...prev, category: catData[0] }));
          }
        }

        // Fetch blog articles database
        const blogRes = await fetch("/api/blog");
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          setBlog(blogData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } else {
        sessionStorage.removeItem("adminPassword");
        setAuthError("Invalid admin password. Access denied.");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError("Failed to fetch dashboard records.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!password) {
      setAuthError("Password is required.");
      return;
    }
    fetchDashboardData(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setPassword("");
    setLeads([]);
    setPortfolio([]);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess("");
    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify({ recipientEmails })
      });

      if (res.ok) {
        setSettingsSuccess("Lead routing settings updated successfully!");
        setTimeout(() => setSettingsSuccess(""), 4000);
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      alert("Error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });

      if (res.ok) {
        setLeads((prevLeads) => {
          const updated = prevLeads.map((l) => 
            l.id === leadId ? { ...l, status: newStatus } : l
          );
          applyFilter(updated, activeFilter);
          return updated;
        });
      } else {
        alert("Failed to update status on server.");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(leads, filter);
  };

  const applyFilter = (allLeads, filter) => {
    if (filter === "All") {
      setFilteredLeads(allLeads);
    } else {
      setFilteredLeads(allLeads.filter((l) => l.status === filter));
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["ID", "Date", "Name", "Email", "Phone", "Service Needed", "Contact Preference", "Details", "Status"];
    const csvRows = [headers.join(",")];
    
    leads.forEach((lead) => {
      const row = [
        lead.id,
        new Date(lead.createdAt).toLocaleDateString(),
        `"${lead.name.replace(/"/g, '""')}"`,
        lead.email,
        lead.phone,
        `"${lead.service.replace(/"/g, '""')}"`,
        lead.contactMethod,
        `"${(lead.message || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        lead.status
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sahig_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Portfolio CRUD Logic
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setAddingProject(true);
    setProjectSuccess("");

    const pw = sessionStorage.getItem("adminPassword");
    const formData = new FormData();
    formData.append("title", newProject.title);
    formData.append("category", newProject.category);
    formData.append("description", newProject.description);

    if (projectFile) {
      formData.append("imageFile", projectFile);
    } else if (newProject.imageUrl) {
      formData.append("imageUrl", newProject.imageUrl);
    } else {
      alert("Please upload an image file or enter an image URL.");
      setAddingProject(false);
      return;
    }

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "x-admin-password": pw
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setPortfolio((prev) => [data.project, ...prev]);
        setNewProject({ title: "", category: "Flooring", description: "", imageUrl: "" });
        setProjectFile(null);
        
        // Reset file input element
        const fileInput = document.getElementById("projectFileInput");
        if (fileInput) fileInput.value = "";

        setProjectSuccess("Project added successfully!");
        setTimeout(() => setProjectSuccess(""), 4000);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create project.");
      }
    } catch (err) {
      console.error("Create project error:", err);
      alert("Error saving project data.");
    } finally {
      setAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? This will delete the data record and its local image file.")) return;

    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch(`/api/portfolio?id=${projectId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": pw
        }
      });

      if (res.ok) {
        setPortfolio((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert("Failed to delete project.");
      }
    } catch (err) {
      console.error("Delete project error:", err);
      alert("Error deleting project.");
    }
  };

  // Categories CRUD Methods
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryText.trim()) return;
    const catClean = newCategoryText.trim();
    if (categories.includes(catClean)) {
      alert("Category already exists.");
      return;
    }

    const updatedCategories = [...categories, catClean];
    await saveCategories(updatedCategories);
    setNewCategoryText("");
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (!confirm(`Are you sure you want to delete the category "${catToDelete}"? Projects already assigned to this category will not be deleted, but the filter tab will disappear.`)) return;
    
    const updatedCategories = categories.filter((c) => c !== catToDelete);
    await saveCategories(updatedCategories);
  };

  const saveCategories = async (updatedList) => {
    setSavingCategories(true);
    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify({ categories: updatedList })
      });

      if (res.ok) {
        setCategories(updatedList);
        if (updatedList.length > 0 && !updatedList.includes(newProject.category)) {
          setNewProject((prev) => ({ ...prev, category: updatedList[0] }));
        }
      } else {
        alert("Failed to save categories list.");
      }
    } catch (err) {
      console.error("Save categories error:", err);
      alert("Connection error saving categories.");
    } finally {
      setSavingCategories(false);
    }
  };

  // Blog CRUD Operations
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setAddingPost(true);
    setPostSuccess("");

    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        const data = await res.json();
        setBlog((prev) => [data.post, ...prev]);
        setNewPost({ title: "", excerpt: "", content: "", image: "" });
        setPostSuccess("Blog post published successfully!");
        setTimeout(() => setPostSuccess(""), 4000);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to publish post.");
      }
    } catch (err) {
      console.error("Create post error:", err);
      alert("Connection error. Failed to publish.");
    } finally {
      setAddingPost(false);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/blog", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify(editingPost)
      });

      if (res.ok) {
        const data = await res.json();
        setBlog((prev) => prev.map((p) => p.id === editingPost.id ? data.post : p));
        setEditingPost(null);
        alert("Blog post updated successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update post.");
      }
    } catch (err) {
      console.error("Update post error:", err);
      alert("Error saving updates.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch(`/api/blog?id=${postId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": pw
        }
      });

      if (res.ok) {
        setBlog((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Error deleting blog post.");
    }
  };

  const handleSaveSyncSettings = async (e) => {
    e.preventDefault();
    setSavingSyncSettings(true);
    setSyncSettingsSuccess("");
    const pw = sessionStorage.getItem("adminPassword");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw
        },
        body: JSON.stringify({ instagramWebhook, linkedinWebhook })
      });

      if (res.ok) {
        setSyncSettingsSuccess("Social integration webhooks saved successfully!");
        setTimeout(() => setSyncSettingsSuccess(""), 4000);
      } else {
        alert("Failed to save social integration webhooks.");
      }
    } catch (err) {
      console.error("Save sync settings error:", err);
      alert("Error saving integration settings.");
    } finally {
      setSavingSyncSettings(false);
    }
  };

  // Stat computations
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const contactedLeads = leads.filter((l) => l.status === "Contacted").length;
  const ongoingLeads = leads.filter((l) => l.status === "Ongoing").length;
  const completedLeads = leads.filter((l) => l.status === "Completed").length;

  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <motion.div 
          className="lock-card glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lock-icon-wrapper">
            <Lock size={28} />
          </div>
          <h2>Admin Dashboard</h2>
          <p>Please enter the administrator password to view project leads.</p>
          
          <form onSubmit={handleLogin}>
            <div className="admin-input-group">
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
              />
            </div>
            
            {authError && <div className="auth-error-msg">{authError}</div>}
            
            <button type="submit" className="btn login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="admin-brand">
          <img src="/images/branding/logo.png" alt="Sahig Logo" className="admin-logo-img" />
          <h1>Sahig <span>Leads Portal</span></h1>
        </div>
        
        {/* Unified admin tab selector */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-nav-tab ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Leads Manager
          </button>
          <button 
            className={`admin-nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio Manager
          </button>
          <button 
            className={`admin-nav-tab ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Blog Manager
          </button>
        </div>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      {activeTab === "leads" && (
        // TAB 1: LEADS MANAGEMENT
        <motion.div
          key="leads-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Stats Cards */}
          <div className="admin-stats-row">
            <div className="stat-card glass-panel">
              <div className="stat-info">
                <h3>Total Leads</h3>
                <span className="stat-number">{totalLeads}</span>
              </div>
              <div className="stat-icon gray"><FileText size={20} /></div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-info">
                <h3>New Submissions</h3>
                <span className="stat-number color-accent">{newLeads}</span>
              </div>
              <div className="stat-icon accent"><Clock size={20} /></div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-info">
                <h3>Contacted</h3>
                <span className="stat-number color-blue">{contactedLeads}</span>
              </div>
              <div className="stat-icon blue"><Phone size={20} /></div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-info">
                <h3>Ongoing</h3>
                <span className="stat-number color-yellow">{ongoingLeads}</span>
              </div>
              <div className="stat-icon yellow"><Activity size={20} /></div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-info">
                <h3>Completed</h3>
                <span className="stat-number color-green">{completedLeads}</span>
              </div>
              <div className="stat-icon green"><CheckCircle size={20} /></div>
            </div>
          </div>

          {/* Settings Routing Panel */}
          <motion.div 
            className="admin-settings-card glass-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3>Lead Routing Settings</h3>
            <form onSubmit={handleSaveSettings} className="settings-form">
              <div className="settings-field-group">
                <div className="settings-input-wrapper">
                  <label htmlFor="recipientEmails">Recipient Emails (comma separated)</label>
                  <input 
                    type="text" 
                    id="recipientEmails" 
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    placeholder="admin@sahig.ca, partner@sahig.ca"
                    className="settings-input-field"
                  />
                </div>
                <button type="submit" className="btn btn-settings-save" disabled={savingSettings}>
                  {savingSettings ? "Saving..." : "Save Route Settings"}
                </button>
              </div>
              <span className="settings-field-helper">New estimate requests will be dispatched to all addresses listed here.</span>
              {settingsSuccess && <div className="settings-success-alert">{settingsSuccess}</div>}
            </form>
          </motion.div>

          {/* Leads Controls */}
          <div className="admin-controls-card glass-panel">
            <div className="controls-left">
              <div className="filter-tabs">
                {["All", "New", "Contacted", "Ongoing", "Completed"].map((filter) => (
                  <button 
                    key={filter}
                    className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-right">
              <button 
                onClick={() => fetchDashboardData(sessionStorage.getItem("adminPassword"))} 
                className="btn-control-icon"
                disabled={loading}
                title="Refresh Data"
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} />
              </button>
              <button onClick={handleExportCSV} className="btn-export">
                <Download size={15} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="table-wrapper glass-panel">
            {loading && leads.length === 0 ? (
              <div className="table-state-message">Loading leads database...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="table-state-message">No leads found matching the filter.</div>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client Details</th>
                    <th>Service Requested</th>
                    <th>Preference</th>
                    <th className="details-col">Project Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="date-cell">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td>
                        <div className="client-info">
                          <strong>{lead.name}</strong>
                          <span className="info-row"><Mail size={12} /> {lead.email}</span>
                          <span className="info-row"><Phone size={12} /> {lead.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className="service-badge">{lead.service}</span>
                      </td>
                      <td className="pref-cell">{lead.contactMethod}</td>
                      <td className="details-cell" title={lead.message}>
                        <p>{lead.message || "No project details provided."}</p>
                      </td>
                      <td>
                        <div className="status-dropdown-wrapper">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`status-select ${lead.status.toLowerCase()}`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <ChevronDown size={12} className="select-arrow" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "portfolio" && (
        // TAB 2: PORTFOLIO MANAGEMENT
        <motion.div
          key="portfolio-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="admin-portfolio-panel-layout"
        >
          <div className="portfolio-mgr-grid">
            
            <div className="portfolio-mgr-left-col">
              {/* Project Creator Form */}
              <div className="portfolio-form-card glass-panel">
                <h3>Add New Portfolio Project</h3>
                <form onSubmit={handleCreateProject} className="project-form">
                  <div className="form-group">
                    <label htmlFor="projectTitle">Project Title</label>
                    <input 
                      type="text" 
                      id="projectTitle" 
                      required 
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Oakridge Engineered Hardwood"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectCategory">Category</label>
                    <select 
                      id="projectCategory" 
                      value={newProject.category}
                      onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectDesc">Project Description</label>
                    <textarea 
                      id="projectDesc" 
                      required 
                      rows="4"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe materials, details, constraints, location..."
                      className="form-textarea"
                    ></textarea>
                  </div>

                  {/* Media Choice Block */}
                  <div className="form-group">
                    <label>Project Image Asset</label>
                    <div className="file-upload-block">
                      <input 
                        type="file" 
                        id="projectFileInput" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProjectFile(e.target.files[0]);
                            setNewProject(prev => ({ ...prev, imageUrl: "" }));
                          }
                        }}
                        className="settings-input-field"
                      />
                      <span className="file-upload-or">-- OR USE FALLBACK LINK --</span>
                      <input 
                        type="text" 
                        placeholder="Paste image path (e.g. /images/services/tile.png)" 
                        value={newProject.imageUrl}
                        disabled={projectFile !== null}
                        onChange={(e) => setNewProject(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-project-add" disabled={addingProject}>
                    {addingProject ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Add to Gallery</span>
                      </>
                    )}
                  </button>

                  {projectSuccess && <div className="settings-success-alert">{projectSuccess}</div>}
                </form>
              </div>

              {/* Categories Configuration Card */}
              <div className="portfolio-form-card glass-panel" style={{ marginTop: '30px' }}>
                <h3>Manage Project Categories</h3>
                
                <form onSubmit={handleAddCategory} className="settings-form">
                  <div className="settings-field-group" style={{ alignItems: 'flex-end' }}>
                    <div className="settings-input-wrapper">
                      <label htmlFor="newCategoryText">New Category Name</label>
                      <input 
                        type="text" 
                        id="newCategoryText" 
                        value={newCategoryText}
                        onChange={(e) => setNewCategoryText(e.target.value)}
                        placeholder="e.g. Commercial Woodwork"
                        className="settings-input-field"
                      />
                    </div>
                    <button type="submit" className="btn btn-settings-save" disabled={savingCategories}>
                      {savingCategories ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>

                <div className="admin-categories-list" style={{ marginTop: '20px' }}>
                  <label className="admin-sub-label" style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>Current Categories</label>
                  {categories.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#555' }}>No categories created.</p>
                  ) : (
                    <div className="category-tags-management">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="category-tag-edit">
                          <span>{cat}</span>
                          <button type="button" onClick={() => handleDeleteCategory(cat)} className="btn-tag-delete">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Projects Manager */}
            <div className="portfolio-list-card glass-panel">
              <h3>Current Projects ({portfolio.length})</h3>
              
              {portfolio.length === 0 ? (
                <div className="portfolio-list-empty">No projects have been added yet.</div>
              ) : (
                <div className="portfolio-list-scroll">
                  <table className="portfolio-table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Project Details</th>
                        <th>Category</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((proj) => (
                        <tr key={proj.id}>
                          <td>
                            <div className="portfolio-thumbnail">
                              {proj.image ? (
                                <img src={proj.image} alt={proj.title} />
                              ) : (
                                <ImageIcon size={20} className="placeholder-icon" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="portfolio-list-details">
                              <strong>{proj.title}</strong>
                              <p>{proj.description}</p>
                            </div>
                          </td>
                          <td>
                            <span className="service-badge">{proj.category}</span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteProject(proj.id)} 
                              className="btn-delete-project"
                              title="Delete Project"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === "blog" && (
        <motion.div
          key="blog-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="admin-portfolio-panel-layout"
        >
          <div className="portfolio-mgr-grid">
            <div className="portfolio-mgr-left-col">
              
              {/* Webhook Sync & Cross-Posting Settings */}
              <div className="portfolio-form-card glass-panel" style={{ marginBottom: "30px" }}>
                <h3>Social Media Integration Settings</h3>
                <div className="settings-form">
                  <div className="form-group" style={{ marginBottom: "15px" }}>
                    <label>Your Incoming Webhook Sync URL</label>
                    <div className="webhook-copy-wrapper" style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/blog?secret=${webhookSecret}` : `/api/webhooks/blog?secret=${webhookSecret}`}
                        className="form-input" 
                        style={{ fontFamily: "monospace", fontSize: "0.78rem", background: "rgba(0,0,0,0.2)" }} 
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                    <span className="settings-field-helper">Send Facebook Page post payloads to this URL to sync them automatically.</span>
                  </div>

                  <form onSubmit={handleSaveSyncSettings}>
                    <div className="form-group">
                      <label htmlFor="instagramWebhook">Outgoing Instagram Webhook URL</label>
                      <input 
                        type="text" 
                        id="instagramWebhook" 
                        value={instagramWebhook}
                        onChange={(e) => setInstagramWebhook(e.target.value)}
                        placeholder="e.g. https://hooks.zapier.com/hooks/catch/..."
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: "15px" }}>
                      <label htmlFor="linkedinWebhook">Outgoing LinkedIn Webhook URL</label>
                      <input 
                        type="text" 
                        id="linkedinWebhook" 
                        value={linkedinWebhook}
                        onChange={(e) => setLinkedinWebhook(e.target.value)}
                        placeholder="e.g. https://hooks.zapier.com/hooks/catch/..."
                        className="form-input"
                      />
                    </div>
                    <button type="submit" className="btn btn-settings-save" style={{ marginTop: "15px", width: "100%" }} disabled={savingSyncSettings}>
                      {savingSyncSettings ? "Saving..." : "Save Cross-Posting Settings"}
                    </button>
                    {syncSettingsSuccess && <div className="settings-success-alert">{syncSettingsSuccess}</div>}
                  </form>
                </div>
              </div>

              {/* Creator / Editor Card Toggle */}
              {editingPost ? (
                <div className="portfolio-form-card glass-panel">
                  <h3 style={{ color: "var(--color-accent)" }}>Edit Blog Post</h3>
                  <form onSubmit={handleUpdatePost} className="project-form">
                    <div className="form-group">
                      <label>Title</label>
                      <input 
                        type="text" 
                        required 
                        value={editingPost.title}
                        onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Image Path / URL</label>
                      <input 
                        type="text" 
                        required 
                        value={editingPost.image}
                        onChange={(e) => setEditingPost(prev => ({ ...prev, image: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea 
                        required 
                        rows="8"
                        value={editingPost.content}
                        onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                        className="form-textarea"
                      ></textarea>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className="btn btn-project-add" style={{ flex: 1 }}>
                        Save Changes
                      </button>
                      <button type="button" className="btn-logout" style={{ flex: 1, borderRadius: "8px", padding: "14px" }} onClick={() => setEditingPost(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="portfolio-form-card glass-panel">
                  <h3>Create Manual Blog Post</h3>
                  <form onSubmit={handleCreatePost} className="project-form">
                    <div className="form-group">
                      <label htmlFor="postTitle">Post Title</label>
                      <input 
                        type="text" 
                        id="postTitle" 
                        required 
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Flooring Trends in 2026"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postImage">Cover Image Path / URL</label>
                      <input 
                        type="text" 
                        id="postImage" 
                        value={newPost.image}
                        onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="e.g. /images/services/tile.png"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postContent">Content Body</label>
                      <textarea 
                        id="postContent" 
                        required 
                        rows="6"
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write article content..."
                        className="form-textarea"
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-project-add" disabled={addingPost}>
                      {addingPost ? "Publishing..." : "Publish Post"}
                    </button>
                    {postSuccess && <div className="settings-success-alert">{postSuccess}</div>}
                  </form>
                </div>
              )}

            </div>

            {/* Current Blog Articles List */}
            <div className="portfolio-list-card glass-panel">
              <h3>Current Blog Updates ({blog.length})</h3>
              {blog.length === 0 ? (
                <div className="portfolio-list-empty">No blog posts available.</div>
              ) : (
                <div className="portfolio-list-scroll">
                  <table className="portfolio-table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Post Details</th>
                        <th>Source</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blog.map((post) => (
                        <tr key={post.id}>
                          <td>
                            <div className="portfolio-thumbnail">
                              <img src={post.image || "/images/services/tile.png"} alt={post.title} />
                            </div>
                          </td>
                          <td>
                            <div className="portfolio-list-details">
                              <strong>{post.title}</strong>
                              <span style={{ fontSize: "0.75rem", color: "#666", display: "block", marginBottom: "4px" }}>
                                {new Date(post.date).toLocaleDateString()}
                              </span>
                              <p>{post.excerpt}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`service-badge ${post.source.toLowerCase()}`} style={{ textTransform: "capitalize" }}>
                              {post.source}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button 
                                onClick={() => setEditingPost(post)} 
                                className="btn-delete-project"
                                style={{ borderColor: "rgba(100, 181, 246, 0.2)", color: "#64b5f6" }}
                                title="Edit Title/Content"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)} 
                                className="btn-delete-project"
                                title="Delete Post"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
