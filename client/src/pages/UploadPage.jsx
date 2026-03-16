import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadResume } from '../services/api';
import toast from 'react-hot-toast';
import {
  Upload, FileText, FileType2, CheckCircle2,
  Sparkles, ArrowRight, Shield,
} from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check auth
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  if (!token) return null;

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');

    const formData = new FormData();
    formData.append('file', file);
    formData._onProgress = (p) => setProgress(p);

    setUploading(true);
    setProgress(0);

    try {
      const { data } = await uploadResume(formData);
      toast.success(data.message);
      navigate(`/editor/${data.data.resumeId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-primary-400" />;
    return file.name.endsWith('.pdf')
      ? <FileText className="w-12 h-12 text-red-400" />
      : <FileType2 className="w-12 h-12 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AI Resume Builder</span>
          </div>
          <button
            id="logout-btn"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="text-dark-400 hover:text-dark-200 text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-dark-50 mb-3">
              Upload Your Resume
            </h1>
            <p className="text-dark-400 text-lg">
              Drop your PDF or DOCX file and let AI do the magic ✨
            </p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            id="dropzone"
            className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 group
              ${isDragActive
                ? 'border-primary-400 bg-primary-500/5 scale-[1.02]'
                : file
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'hover:border-primary-500/50 hover:bg-primary-500/5'
              }`}
          >
            <input {...getInputProps()} id="file-input" />

            <div className="flex flex-col items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isDragActive
                  ? 'bg-primary-500/20 scale-110'
                  : file
                    ? 'bg-green-500/10'
                    : 'bg-dark-700/50 group-hover:bg-primary-500/10'
                }`}
              >
                {getFileIcon()}
              </div>

              {file ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">File selected</span>
                  </div>
                  <p className="text-dark-300">{file.name}</p>
                  <p className="text-dark-500 text-sm mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-dark-200 font-medium text-lg mb-1">
                    {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-dark-400 text-sm">
                    or click to browse — PDF, DOCX (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-6 glass-card p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-300">Parsing resume with AI...</span>
                <span className="text-primary-400 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            id="upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Parse with AI
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Info */}
          <div className="flex items-center justify-center gap-2 mt-6 text-dark-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Your data is processed securely and never shared</span>
          </div>
        </div>
      </main>
    </div>
  );
}
