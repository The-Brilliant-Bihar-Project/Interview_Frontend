import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, CheckCircle, Clock, XCircle,
  Search, Filter, Download, Eye, Edit, Trash2,
  RefreshCw, BarChart3, UserCheck, Mail, Phone,
  Calendar, ChevronLeft, ChevronRight, ArrowUpDown,
  Shield, LogOut, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';

const MockAdminDashboard = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [showStats, setShowStats] = useState(true);
  
  // ✅ State for Image Preview
  const [previewImg, setPreviewImg] = useState(null);

  const itemsPerPage = 10;

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  /* ================= FETCH ================= */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (examFilter !== 'all') params.examType = examFilter;

      const [appsRes, statsRes] = await Promise.all([
        adminApi.getApplications(params),
        adminApi.getStats()
      ]);

      setApplications(appsRes.data.applications || []);
      setStats(statsRes.data || {});

    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, examFilter]);

  /* ================= AUTO FETCH ================= */

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= RESET PAGE ON FILTER ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, examFilter]);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteApplication(id);
      setShowDeleteModal(false);
      fetchData();
    } catch {
      alert("Delete failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateApplicationStatus(id, newStatus);
      fetchData();
    } catch {
      alert("Status update failed");
    }
  };

  const handleEdit = async () => {
    try {
      await adminApi.updateApplication(selectedApp._id, editForm);
      setShowEditModal(false);
      fetchData();
    } catch {
      alert("Update failed");
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await adminApi.exportApplications(format);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const openDeleteModal = (app) => {
    setAppToDelete(app);
    setShowDeleteModal(true);
  };

  const openEditModal = (app) => {
    setSelectedApp(app);
    setEditForm({ ...app });
    setShowEditModal(true);
  };

  /* ================= STATUS BADGE ================= */

  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye },
      scheduled: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Calendar },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /* ================= PAGINATION ================= */

  const totalApps = stats.totalApplications || 0;
  const totalPages = Math.max(1, Math.ceil(totalApps / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalApps);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Interview Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all candidate applications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications || 0}</p>
                </div>
                <Users className="w-12 h-12 text-blue-100 bg-blue-500 p-2 rounded-lg" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingCount || 0}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-100 bg-yellow-500 p-2 rounded-lg" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Scheduled</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.scheduledCount || 0}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-100 bg-purple-500 p-2 rounded-lg" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedCount || 0}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-100 bg-green-500 p-2 rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Exams</option>
                <option value="upsc">UPSC</option>
                <option value="bpsc">BPSC</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <BarChart3 className="w-4 h-4" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No applications found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Candidate
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Exam Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            
                            {/* ✅ Candidate Photo with Fallback and Click-to-Preview */}
                            {app.photoUrl ? (
                              <img
                                src={app.photoUrl}
                                alt={app.name}
                                onClick={() => setPreviewImg(app.photoUrl)}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 cursor-pointer hover:scale-105 transition shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900">{app.name}</p>
                              <p className="text-xs text-gray-500">
                                ID: {app._id?.substring(0, 8)}
                              </p>
                            </div>

                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{app.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{app.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                              {app.examType?.toUpperCase()}
                            </span>
                            <div className="text-sm text-gray-600">
                              {app.prelimsMarks && <span>Prelims: {app.prelimsMarks}</span>}
                              {app.mainsMarks && <span className="ml-2">Mains: {app.mainsMarks}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge status={app.status} />
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(app.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(app)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(app)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-semibold">{startIndex}</span> to{' '}
                  <span className="font-semibold">{endIndex}</span> of{' '}
                  <span className="font-semibold">{stats.totalApplications || 0}</span> applications
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-semibold">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ✅ Image Preview Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain transform transition-transform scale-100"
            alt="Preview"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself if you want to allow right click/save
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Application</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <strong>{appToDelete.name}</strong>'s application?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(appToDelete._id)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Application</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prelims Marks</label>
                <input
                  type="number"
                  value={editForm.prelimsMarks || ''}
                  onChange={(e) => setEditForm({...editForm, prelimsMarks: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mains Marks</label>
                <input
                  type="number"
                  value={editForm.mainsMarks || ''}
                  onChange={(e) => setEditForm({...editForm, mainsMarks: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Add any notes about this candidate..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockAdminDashboard;