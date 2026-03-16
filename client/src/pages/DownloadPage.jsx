import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exportDocx, exportPdf, exportEmail } from '../services/api';
import toast from 'react-hot-toast';
import {
  FileText, FileDown, Mail, ArrowLeft, Sparkles,
  Loader2, CheckCircle2, Download,
} from 'lucide-react';

export default function DownloadPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);
  
  if (!token) return null;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDocx = async () => {
    setLoadingDocx(true);
    try {
      const response = await exportDocx(resumeId);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Resume.docx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('DOCX downloaded!');
    } catch (err) {
      toast.error('Failed to generate DOCX');
    } finally {
      setLoadingDocx(false);
    }
  };

  const handlePdf = async () => {
    setLoadingPdf(true);
    try {
      const response = await exportPdf(resumeId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleEmail = async () => {
    setLoadingEmail(true);
    try {
      await exportEmail(resumeId, user.email);
      setEmailSent(true);
      toast.success(`Resume sent to ${user.email}`);
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            id="back-to-editor-btn"
            onClick={() => navigate(`/editor/${resumeId}`)}
            className="text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-dark-100">Export Resume</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-dark-50 mb-2">
              Export Your Resume
            </h1>
            <p className="text-dark-400">
              Download your AI-optimized resume or send it to your email
            </p>
          </div>

          <div className="space-y-4">
            {/* DOCX Download */}
            <button
              id="download-docx-btn"
              onClick={handleDocx}
              disabled={loadingDocx}
              className="glass-card w-full p-6 flex items-center gap-5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {loadingDocx ? (
                  <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
                ) : (
                  <FileText className="w-7 h-7 text-blue-400" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-100 text-lg">Download DOCX</h3>
                <p className="text-dark-400 text-sm">Editable Word document format</p>
              </div>
              <FileDown className="w-5 h-5 text-dark-500 ml-auto group-hover:text-blue-400 transition-colors" />
            </button>

            {/* PDF Download */}
            <button
              id="download-pdf-btn"
              onClick={handlePdf}
              disabled={loadingPdf}
              className="glass-card w-full p-6 flex items-center gap-5 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {loadingPdf ? (
                  <Loader2 className="w-7 h-7 text-red-400 animate-spin" />
                ) : (
                  <FileText className="w-7 h-7 text-red-400" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-100 text-lg">Download PDF</h3>
                <p className="text-dark-400 text-sm">Print-ready, ATS-friendly format</p>
              </div>
              <FileDown className="w-5 h-5 text-dark-500 ml-auto group-hover:text-red-400 transition-colors" />
            </button>

            {/* Email */}
            <button
              id="email-resume-btn"
              onClick={handleEmail}
              disabled={loadingEmail || emailSent}
              className="glass-card w-full p-6 flex items-center gap-5 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {loadingEmail ? (
                  <Loader2 className="w-7 h-7 text-green-400 animate-spin" />
                ) : emailSent ? (
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                ) : (
                  <Mail className="w-7 h-7 text-green-400" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-100 text-lg">
                  {emailSent ? 'Email Sent!' : 'Email to Me'}
                </h3>
                <p className="text-dark-400 text-sm">
                  {emailSent
                    ? `Sent to ${user.email}`
                    : `Send DOCX & PDF to ${user.email || 'your email'}`}
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
