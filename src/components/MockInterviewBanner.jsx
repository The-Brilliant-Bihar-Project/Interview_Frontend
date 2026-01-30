import React, { useState, useEffect } from 'react';
import api from "../services/api";
import { ArrowRight, UserCheck, Mic, Star, X, Upload, CheckCircle2, FileText } from 'lucide-react';

const MockInterviewBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    examType: "",
    prelimsMarks: "",
    mainsMarks: ""
  });

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
  }, [isModalOpen]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setSelectedImage(null);
      setFile(null);
      setForm({ name: "", phone: "", email: "", examType: "", prelimsMarks: "", mainsMarks: "" });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setSelectedImage(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("photo", file);

      await api.post("/applications", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Application submitted successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {/* --- BANNER PART --- */}
      <div className="relative w-full bg-gradient-to-r from-sky-50 via-white to-blue-50 rounded-2xl overflow-hidden shadow-xl shadow-blue-900/5 border border-blue-100 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/60 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-10 lg:p-12 gap-8">
          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Mic className="w-3 h-3 text-blue-600" />
              <span>Interview Guidance Program 2026</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">UPSC & BPSC Interview</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-xl leading-relaxed mb-6 mx-auto md:mx-0">
              Face the board with confidence. Get personalized feedback from retired civil servants and subject matter experts.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <UserCheck className="w-3 h-3 text-blue-600" /> Expert Panel
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <Star className="w-3 h-3 text-blue-600" /> Detailed Feedback
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 z-10 w-full md:w-auto">
            <button onClick={toggleModal} className="w-full group/btn cursor-pointer relative flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-blue-200">
              <span className="relative z-10">APPLY NOW</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-1" />
            </button>
            <p className="text-center text-slate-500 text-[10px] mt-3 font-medium">Limited slots available for this week</p>
          </div>
        </div>
      </div>

      {/* --- MOBILE OPTIMIZED MODAL --- */}
      <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={toggleModal}></div>
        
        <div className={`bg-white w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto relative transition-all duration-500 transform ${isModalOpen ? 'translate-y-0' : 'translate-y-full sm:scale-95'}`}>
          
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="bg-blue-600 p-1.5 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">Candidate Details</h3>
            </div>
            <button onClick={toggleModal} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-5 sm:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Form Fields */}
              <div className="lg:col-span-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} type="text" required placeholder="Enter your full name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} type="tel" required placeholder="10-digit mobile" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email *</label>
                    <input name="email" value={form.email} onChange={handleChange} type="email" required placeholder="email@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Examination *</label>
                    <select name="examType" value={form.examType} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                      <option value="">Select Exam</option>
                      <option value="upsc">UPSC (Civil Services)</option>
                      <option value="bpsc">BPSC (State Services)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prelims</label>
                      <input name="prelimsMarks" value={form.prelimsMarks} onChange={handleChange} type="text" placeholder="Marks" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mains</label>
                      <input name="mainsMarks" value={form.mainsMarks} onChange={handleChange} type="text" placeholder="Marks" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Upload Photo *</label>
                  <label className="group relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                    <Upload className="w-6 h-6 text-blue-500 mb-1" />
                    <p className="text-[10px] font-semibold text-slate-600">Click to upload photo</p>
                    <input type="file" required className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-4 flex flex-col items-center justify-start">
                <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center gap-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</h4>
                  <div className="relative w-32 h-40 sm:w-40 sm:h-52 bg-white rounded-lg border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {selectedImage ? (
                      <img src={selectedImage} alt="Candidate" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center">
                        <UserCheck className="w-10 h-10 opacity-20" />
                        <p className="text-[10px] italic">No photo</p>
                      </div>
                    )}
                  </div>
                  {selectedImage && (
                    <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase">
                       <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky/Fixed-bottom Style Button for Mobile */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-slate-400 text-center sm:text-left">
                Ensure all details match your official documents.
              </p>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg ${isSubmitting ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white active:scale-95'}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default MockInterviewBanner;