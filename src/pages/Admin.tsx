import React, { useState, useEffect } from 'react';
import { 
  Trash2, ShieldCheck, Copy, Check, ExternalLink, Plus, Bookmark, X, Edit2, 
  Upload, Clock, Building2, Mail, User, ArrowUpRight, ChevronRight, Eye, 
  EyeOff, Filter, Sparkles, Lock, Shield, LogOut, Key, AlertCircle, BookmarkCheck, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { KitSubmission, KitToken, StudioScreenshot, KitViewLog, PricingPreset, VideoIdea } from '../types';

const DEFAULT_PRESETS: PricingPreset[] = [
  { id: 'standard', name: 'Standard Rate', description: 'Default rates', dedicatedPrice: 1200, integratedPrice: 600, commercialUsagePrice: 350, expiryDays: '14', isCustom: false },
  { id: 'discounted', name: 'Discounted (15%)', description: 'For long term partners', dedicatedPrice: 1020, integratedPrice: 510, commercialUsagePrice: 350, expiryDays: '14', isCustom: false },
  { id: 'premium', name: 'Premium Rush', description: 'Fast turnaround', dedicatedPrice: 1500, integratedPrice: 800, commercialUsagePrice: 500, expiryDays: '7', isCustom: false }
];

export function Admin() {
  const {
    user,
    isAdmin,
    loading: authLoading,
    authError,
    loginAdmin,
    signOut,
    getAuthToken,
    clearAuthError,
  } = useAuth();

  // Login Gate UI States - Strictly Username and Password
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  
  // Data States
  const [tokens, setTokens] = useState<KitToken[]>([]);
  const [screenshots, setScreenshots] = useState<StudioScreenshot[]>([]);
  const [logs, setLogs] = useState<KitViewLog[]>([]);
  const [submissions, setSubmissions] = useState<KitSubmission[]>([]);
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);

  // Video Ideas Form States
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoIsBooked, setVideoIsBooked] = useState(false);
  const [isAddingVideoIdea, setIsAddingVideoIdea] = useState(false);

  // UI States
  const [activeTab, setActiveTab] = useState<'tokens'|'proofs'|'ideas'|'logs'|'submissions'>('tokens');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Form States
  const [modalBrandName, setModalBrandName] = useState('');
  const [modalCompany, setModalCompany] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalExpiryDays, setModalExpiryDays] = useState('14');
  const [modalCustomDate, setModalCustomDate] = useState('');
  const [modalDedicatedPrice, setModalDedicatedPrice] = useState<number>(1200);
  const [modalIntegratedPrice, setModalIntegratedPrice] = useState<number>(600);
  const [modalCommercialUsagePrice, setModalCommercialUsagePrice] = useState<number>(350);

  // Presets State
  const [presets, setPresets] = useState<PricingPreset[]>(() => {
    try {
      const saved = localStorage.getItem('amidia_pricing_presets');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return DEFAULT_PRESETS;
  });
  const [activePresetId, setActivePresetId] = useState<string | null>('standard');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetDraft, setPresetDraft] = useState<Partial<PricingPreset>>({});

  // Extraction State
  const [showExtractEmailModal, setShowExtractEmailModal] = useState(false);
  const [extractEmailText, setExtractEmailText] = useState('');
  const [isExtractingEmail, setIsExtractingEmail] = useState(false);

    // Screenshot states
  const [screenshotCategory, setScreenshotCategory] = useState<'demographics' | 'geography' | 'retention' | 'general'>('demographics');
  const [screenshotLabel, setScreenshotLabel] = useState('');
  const [screenshotImgUrl, setScreenshotImgUrl] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Unused state that might be referenced
  const [selectedSubmission, setSelectedSubmission] = useState<KitSubmission | null>(null);
  const [isDeletingToken, setIsDeletingToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

      const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotImgUrl) return;
    setIsUploadingScreenshot(true);
    setActionError(null);
    try {
      const token = await getAuthToken();
      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const res = await fetch('/api/admin/screenshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          label: screenshotLabel || 'YouTube Studio Analytics Proof',
          imageUrl: screenshotImgUrl,
          category: screenshotCategory,
          monthYear: currentMonthYear,
        })
      });
      if (!res.ok) throw new Error('Failed to upload proof');
      setActionSuccess('Proof uploaded successfully.');
      setScreenshotLabel('');
      setScreenshotImgUrl('');
      fetchData();
    } catch(err: any) {
      setActionError(err.message || 'Error uploading proof');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const fetchData = async () => {
    const token = await getAuthToken();
    if (!token) return;
    try {
      const [tokRes, scrRes, logRes, subRes, ideasRes] = await Promise.all([
        fetch('/api/admin/tokens', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/screenshots', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/submissions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/video-ideas', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tokRes.ok) setTokens((await tokRes.json()).tokens);
      if (scrRes.ok) setScreenshots((await scrRes.json()).screenshots);
      if (logRes.ok) setLogs((await logRes.json()).logs);
      if (subRes.ok) setSubmissions((await subRes.json()).submissions);
      if (ideasRes && ideasRes.ok) {
        const ideasData = await ideasRes.json();
        const loadedIdeas = ideasData.ideas || [];
        setVideoIdeas(loadedIdeas);
        try {
          localStorage.setItem('amidia_video_ideas', JSON.stringify(loadedIdeas));
        } catch(e) {}
      }
    } catch(e) {}
  };

  const handleOpenPresetModal = (preset?: PricingPreset) => {
    if (preset) {
      setEditingPresetId(preset.id);
      setPresetDraft(preset);
    } else {
      setEditingPresetId(null);
      setPresetDraft({ name: '', dedicatedPrice: 1000, integratedPrice: 500, commercialUsagePrice: 350, expiryDays: '14' });
    }
    setShowPresetModal(true);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetDraft.name?.trim()) return;
    let updated = [...presets];
    let appliedPreset: PricingPreset;
    
    if (editingPresetId) {
      updated = updated.map(p => p.id === editingPresetId ? { ...p, ...presetDraft, description: 'Custom preset' } as PricingPreset : p);
      appliedPreset = updated.find(p => p.id === editingPresetId)!;
    } else {
      appliedPreset = {
        id: 'preset_' + Date.now(),
        name: presetDraft.name.trim(),
        description: 'Custom preset',
        dedicatedPrice: presetDraft.dedicatedPrice || 0,
        integratedPrice: presetDraft.integratedPrice || 0,
        commercialUsagePrice: presetDraft.commercialUsagePrice || 0,
        expiryDays: presetDraft.expiryDays || '14',
        isCustom: true
      };
      updated = [...updated, appliedPreset];
    }
    setPresets(updated);
    applyPreset(appliedPreset);
    try {
      localStorage.setItem('amidia_pricing_presets', JSON.stringify(updated));
    } catch(e) {}
    setShowPresetModal(false);
    setActionSuccess(`Preset "${appliedPreset.name}" saved!`);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    if (activePresetId === id && updated.length > 0) applyPreset(updated[0]);
    else if (activePresetId === id) {
      setActivePresetId(null);
      setModalDedicatedPrice(0);
      setModalIntegratedPrice(0);
      setModalCommercialUsagePrice(0);
      setModalExpiryDays('14');
    }
    try {
      localStorage.setItem('amidia_pricing_presets', JSON.stringify(updated));
    } catch(e) {}
  };

  const applyPreset = (preset: PricingPreset) => {
    setActivePresetId(preset.id);
    setModalDedicatedPrice(preset.dedicatedPrice);
    setModalIntegratedPrice(preset.integratedPrice);
    setModalCommercialUsagePrice(preset.commercialUsagePrice);
    setModalExpiryDays(preset.expiryDays);
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setGeneratedLink('');
    setIsGeneratingToken(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          brandName: modalBrandName,
          company: modalCompany,
          email: modalEmail,
          expiryDays: modalExpiryDays === 'custom' ? undefined : modalExpiryDays,
          customExpiryDate: modalExpiryDays === 'custom' ? modalCustomDate : undefined,
          dedicatedPrice: modalDedicatedPrice,
          integratedPrice: modalIntegratedPrice,
          commercialUsagePrice: modalCommercialUsagePrice
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate token');
      const issuedToken = typeof data.token === 'string' ? data.token : data.token?.token;
      if (!issuedToken) throw new Error('Server did not return a valid access token');
      setGeneratedLink(`${window.location.origin}/kit/${issuedToken}`);
      setActionSuccess('Media kit access token created successfully.');
      setModalBrandName('');
      setModalCompany('');
      setModalEmail('');
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    setIsDeletingToken(tokenId);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/delete-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tokenId })
      });
      if (!res.ok) throw new Error('Failed to delete');
      setActionSuccess('Token deleted.');
      fetchData();
    } catch(e) {
      setActionError('Error deleting token.');
    } finally {
      setIsDeletingToken(null);
    }
  };

  const handleExtractEmailText = async () => {
    if (!extractEmailText.trim()) return;
    setIsExtractingEmail(true);
    setActionError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/extract-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emailText: extractEmailText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract');
      if (data.contactName) setModalBrandName(data.contactName);
      if (data.companyName) setModalCompany(data.companyName);
      setShowExtractEmailModal(false);
      setExtractEmailText('');
      setActionSuccess('Extracted contact info successfully!');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsExtractingEmail(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch {
      setActionError('Could not copy automatically. Please select and copy the link manually.');
    }
  };

  const handleDeleteScreenshot = async (id: string) => {
    if (!confirm('Delete this proof?')) return;
    try {
      const token = await getAuthToken();
      await fetch(`/api/admin/screenshots/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch(e) {}
  };

  const handleAddVideoIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;
    setIsAddingVideoIdea(true);
    setActionError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/video-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: videoTitle.trim(),
          description: videoDescription.trim(),
          isBooked: videoIsBooked,
        }),
      });
      if (!res.ok) throw new Error('Failed to add video idea');
      setActionSuccess('Video idea added successfully.');
      setVideoTitle('');
      setVideoDescription('');
      setVideoIsBooked(false);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Error adding video idea');
    } finally {
      setIsAddingVideoIdea(false);
    }
  };

  const handleToggleBooked = async (id: string, currentStatus?: boolean) => {
    try {
      const token = await getAuthToken();
      const newStatus = !Boolean(currentStatus);
      setVideoIdeas((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isBooked: newStatus } : item))
      );
      const res = await fetch(`/api/admin/video-ideas/${id}/toggle-booked`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBooked: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update booked status');
      setActionSuccess(newStatus ? 'Video idea booked by sponsor! Live media kit updated.' : 'Video idea marked as open for sponsors.');
      fetchData();
    } catch (e: any) {
      setActionError(e.message || 'Error updating booked status');
      fetchData();
    }
  };

  const handleDeleteVideoIdea = async (id: string) => {
    if (!confirm('Remove this video idea?')) return;
    try {
      const token = await getAuthToken();
      await fetch(`/api/admin/video-ideas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionSuccess('Video idea removed.');
      fetchData();
    } catch (e) {
      setActionError('Error removing video idea.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-neutral-50">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-xl">
            <ShieldCheck className="w-7 h-7 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Verifying Security Session</h3>
            <p className="text-xs text-neutral-500 mt-1">Checking administrator access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-100/70 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-white text-[11px] font-black tracking-wider uppercase">
              <Lock className="w-3 h-3 text-amber-400" />
              ADMIN SECURITY ACCESS
            </div>
            <h1 className="text-2xl font-black text-neutral-950 tracking-tight">System Login</h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter your administrator username and password to unlock the management console.
            </p>
          </div>

          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-red-700 font-medium leading-relaxed">
                {authError}
              </div>
              <button onClick={clearAuthError} className="text-red-400 hover:text-red-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmittingLogin(true);
              try {
                const res = await loginAdmin(loginUsername, loginPassword);
                if (res.success) {
                  fetchData();
                }
              } finally {
                setIsSubmittingLogin(false);
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoFocus
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmittingLogin ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              <span>Unlock Console</span>
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secure Authentication
            </span>
            <span>Brute-force protected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Modals */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editingPresetId ? 'Edit Preset' : 'New Preset'}</h3>
              <button onClick={() => setShowPresetModal(false)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSavePreset} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700">Preset Name</label>
                <input required type="text" value={presetDraft.name || ''} onChange={e => setPresetDraft({...presetDraft, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700">Dedicated Price ($)</label>
                  <input required type="number" value={presetDraft.dedicatedPrice || 0} onChange={e => setPresetDraft({...presetDraft, dedicatedPrice: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700">Integrated Price ($)</label>
                  <input required type="number" value={presetDraft.integratedPrice || 0} onChange={e => setPresetDraft({...presetDraft, integratedPrice: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700">Add-on Price ($)</label>
                  <input required type="number" value={presetDraft.commercialUsagePrice || 0} onChange={e => setPresetDraft({...presetDraft, commercialUsagePrice: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700">Expiry (Days)</label>
                  <input required type="number" value={presetDraft.expiryDays || '14'} onChange={e => setPresetDraft({...presetDraft, expiryDays: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-neutral-950 text-white rounded-xl font-bold hover:bg-neutral-800">
                Save Preset
              </button>
            </form>
          </div>
        </div>
      )}

      {showExtractEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Extract Contact Info</h3>
              <button onClick={() => setShowExtractEmailModal(false)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200"><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-4">
              <textarea 
                rows={5}
                placeholder="Paste the email text here..."
                value={extractEmailText}
                onChange={e => setExtractEmailText(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm font-mono"
              />
              <button onClick={handleExtractEmailText} disabled={isExtractingEmail || !extractEmailText.trim()} className="w-full py-3 bg-neutral-950 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                {isExtractingEmail ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                Extract with AI
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 2xl:py-12 space-y-6 2xl:space-y-8">
        {/* Active Security Bar */}
        <div className="bg-neutral-950 text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white">AUTHENTICATED CONSOLE</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Administrator Session Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Logged in as: <strong className="text-neutral-100 font-semibold">{user?.username || 'admin'}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">Management Console</h1>
          <div className="flex flex-wrap gap-1 sm:gap-2 bg-neutral-200/50 p-1 rounded-xl w-full sm:w-auto">
            {[
              { key: 'tokens', label: 'Tokens' },
              { key: 'proofs', label: 'Proofs' },
              { key: 'ideas', label: 'Video Ideas' },
              { key: 'logs', label: 'Logs' },
              { key: 'submissions', label: 'Inquiries' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 sm:flex-initial text-center px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white shadow-sm text-neutral-950'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {actionSuccess && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200">{actionSuccess}</div>}
        {actionError && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-200">{actionError}</div>}

        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleGenerateToken} className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-950">Create Media Kit Access Token</h2>
                    <p className="text-xs text-neutral-500">Generate a secure, time-limited link for a specific sponsor.</p>
                  </div>
                  <button type="button" onClick={() => setShowExtractEmailModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-colors w-full sm:w-auto">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Autofill via Email Text</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Contact / Person Name</label>
                    <input type="text" required value={modalBrandName} onChange={e => setModalBrandName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Company Name</label>
                    <input type="text" value={modalCompany} onChange={e => setModalCompany(e.target.value)} placeholder="e.g. Notion" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Contact Email</label>
                  <input type="email" value={modalEmail} onChange={e => setModalEmail(e.target.value)} placeholder="sarah@notion.so" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white transition-colors" />
                </div>


                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-neutral-950" />
                          Rate & Deal Presets
                        </span>
                        <span className="text-[10px] text-neutral-600 font-mono bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
                          1-Click Apply
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Select a pricing tier to instantly auto-fill rates for this token.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPresetModal()}
                      className="text-[11px] font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer self-start sm:self-auto border border-neutral-200/70"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Preset</span>
                    </button>
                  </div>

                  {/* Preset Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {presets.map((p) => {
                      const isSelected = activePresetId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => applyPreset(p)}
                          className={`relative p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between select-none ${
                            isSelected
                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                              : 'bg-white hover:bg-neutral-50/90 text-neutral-800 border-neutral-200/90'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate block">
                                {p.name}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                              )}
                            </div>

                            <div className={`text-[11px] font-mono font-medium ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                              ${p.dedicatedPrice >= 1000 ? `${(p.dedicatedPrice / 1000).toFixed(p.dedicatedPrice % 1000 === 0 ? 0 : 1)}k` : p.dedicatedPrice} <span className="text-[10px] opacity-70">Ded</span> • ${p.integratedPrice >= 1000 ? `${(p.integratedPrice / 1000).toFixed(p.integratedPrice % 1000 === 0 ? 0 : 1)}k` : p.integratedPrice} <span className="text-[10px] opacity-70">Int</span>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between">
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                              {p.expiryDays}d link
                            </span>

                            {true && (
                              <div className="flex items-center gap-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPresetModal(p);
                                  }}
                                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'hover:bg-neutral-800 text-white'
                                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                  }`}
                                  title="Edit custom preset"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteCustomPreset(p.id, e)}
                                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'hover:bg-neutral-800 text-red-300 hover:text-red-400'
                                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                                  }`}
                                  title="Delete custom preset"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[11px] text-neutral-500">
                    Sponsors simply click the link to inspect full rate card and monthly Studio proofs.
                  </span>

                  <button
                    type="submit"
                    disabled={isGeneratingToken || !modalBrandName}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingToken ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Generate Sponsor Link</span>
                  </button>
                </div>
              </form>

              {/* Display Generated Link */}
              {generatedLink && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-neutral-700 block">
                    Generated Media Kit URL:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-mono text-neutral-900"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(generatedLink)}
                        className="flex-1 sm:flex-initial justify-center px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List of Active Tokens */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">Active &amp; Expired Tokens</h3>
              {tokens.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 shadow-xs">
                  <p className="text-xs">No tokens created yet. Generate one above to grant private access.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {tokens.map((tok) => {
                    const isRevoked = tok.revoked;
                    const expTime = tok.expiresAt ? new Date(tok.expiresAt).getTime() : 0;
                    const isExpired = expTime > 0 && expTime < Date.now();
                    const isActive = !isRevoked && !isExpired;

                    return (
                      <div
                        key={tok.id || tok.token}
                        className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-950">
                              {tok.brandName || tok.company || 'Unnamed Brand'}
                            </span>
                            {isActive ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                Active
                              </span>
                            ) : isRevoked ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                                Revoked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold border border-neutral-200">
                                Expired
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="font-mono">Token: {tok.token.slice(0, 10)}...</span>
                            <span>•</span>
                            <span>
                              Expires:{' '}
                              {tok.expiresAt ? new Date(tok.expiresAt).toLocaleDateString() : 'Never'}
                            </span>
                            <span>•</span>
                            <span className="font-mono font-medium text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] border border-neutral-200">
                              Dedicated: ${tok.dedicatedPrice || 1200}
                            </span>
                            <span className="font-mono font-medium text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] border border-neutral-200">
                              Integrated: ${tok.integratedPrice || 600}
                            </span>
                            {tok.commercialUsagePrice !== undefined && (
                              <span className="font-mono font-medium text-neutral-600 bg-neutral-100/70 px-1.5 py-0.5 rounded text-[10px]">
                                Add-on: +${tok.commercialUsagePrice}
                              </span>
                            )}
                            {tok.email && (
                              <>
                                <span>•</span>
                                <span>{tok.email}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto self-end sm:self-center">
                          {isActive && (
                            <button
                              onClick={() => copyToClipboard(`${window.location.origin}/kit/${tok.token}`)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-800 flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-200 font-medium"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </button>
                          )}

                          <a
                            href={`/kit/${tok.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-800 flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-200 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Preview</span>
                          </a>

                          <button
                            onClick={() => handleDeleteToken(tok.token)}
                            disabled={isDeletingToken === tok.token}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer border border-red-200 disabled:opacity-50"
                          >
                            {isDeletingToken === tok.token ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Studio Proofs */}
        {activeTab === 'proofs' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">YouTube Studio Proofs</h2>
                <p className="text-xs text-neutral-500">
                  Real, unedited screenshots showing Studio UI, demographics, and viewer retention. The display period automatically updates to the current month and year so you never need to re-upload proofs monthly.
                </p>
              </div>
            </div>

            {/* Upload Box */}
            <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-neutral-950" />
                <span>Add Studio Proof Screenshot</span>
              </h3>

              <form onSubmit={handleAddScreenshot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Category Tag
                    </label>
                    <select
                      value={screenshotCategory}
                      onChange={(e) => setScreenshotCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                    >
                      <option value="demographics">Audience Demographics (Age &amp; Gender)</option>
                      <option value="devices">Device Type (Computer, Mobile, TV)</option>
                      <option value="geography">Top Geography (India, US, Bangladesh)</option>
                      <option value="reach">Audience Reach &amp; Growth (288.9K, New Viewers)</option>
                      <option value="retention">Content Performance &amp; CTR (3:14, 6.6% CTR)</option>
                      <option value="general">Overview Dashboard Proof</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Display Timing (Automatic)
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-center justify-between font-medium">
                      <span>Dynamic Month &amp; Year:</span>
                      <span className="font-bold text-neutral-950 font-mono bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Screenshot Label / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={screenshotLabel}
                    onChange={(e) => setScreenshotLabel(e.target.value)}
                    placeholder="e.g. YouTube Studio Audience Tab — Top Countries &amp; Age Brackets"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      File Upload (Direct Screenshot)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-950 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Or Paste Image URL
                    </label>
                    <input
                      type="url"
                      value={screenshotImgUrl}
                      onChange={(e) => setScreenshotImgUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase block mb-1.5">
                    Quick Insert Stored Channel Proofs:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Age & Gender', url: '/age-gender.jpeg', cat: 'demographics', label: 'YouTube Studio Age & Gender Demographics' },
                      { name: 'Top Geography', url: '/geography.jpeg', cat: 'geography', label: 'YouTube Studio Top Geography & Countries' },
                      { name: 'Monthly Audience', url: '/monthly-audience.jpeg', cat: 'reach', label: 'Monthly Audience Reach & Growth' },
                      { name: 'Average View Duration (AVD)', url: '/avd.jpeg', cat: 'retention', label: 'Average View Duration (AVD) & Retention' },
                      { name: 'Click-Through Rate (CTR)', url: '/cta.jpeg', cat: 'retention', label: 'Click-Through Rate (CTR) & Engagement' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          setScreenshotImgUrl(preset.url);
                          setScreenshotLabel(preset.label);
                          setScreenshotCategory(preset.cat as any);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {screenshotImgUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] text-neutral-500 uppercase font-bold mb-2">Preview:</p>
                    <div className="max-h-60 overflow-hidden rounded-2xl border border-neutral-200">
                      <img src={screenshotImgUrl} alt="Preview" className="w-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    disabled={isUploadingScreenshot || !screenshotImgUrl}
                    className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isUploadingScreenshot ? 'Saving...' : 'Publish Studio Proof'}
                  </button>
                </div>
              </form>
            </div>

            {/* Published Screenshots Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-950">Published Studio Proofs</h3>
              {screenshots.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 shadow-xs">
                  <p className="text-xs">No screenshots uploaded yet. Add your latest YouTube Studio demographics to showcase to brands.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {screenshots.map((s) => (
                    <div key={s.id} className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden group shadow-xs">
                      <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                        <img src={s.imageUrl} alt={s.label} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-bold text-white border border-neutral-800">
                          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-950">{s.label}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteScreenshot(s.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Video Ideas */}
        {activeTab === 'ideas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">Video Ideas &amp; Topics</h2>
                <p className="text-xs text-neutral-500">
                  Add video concepts currently in progress or planned. Potential sponsors viewing the gated media kit can sponsor specific videos.
                </p>
              </div>
            </div>

            {/* Add Video Idea Form */}
            <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-950 mb-4">Add New Video Idea</h3>
              <form onSubmit={handleAddVideoIdea} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Building a Production Microservice Architecture in Go"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Brief Description
                  </label>
                  <textarea
                    rows={3}
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="e.g. Deep dive into distributed tracing, concurrency patterns, and real-world deployment on Kubernetes."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700 select-none">
                    <input
                      type="checkbox"
                      checked={videoIsBooked}
                      onChange={(e) => setVideoIsBooked(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 w-4 h-4 cursor-pointer"
                    />
                    <span>Mark as already booked by a sponsor</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isAddingVideoIdea || !videoTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingVideoIdea ? 'Saving...' : 'Add Video Idea'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Video Ideas List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-950">Active Video Pipeline ({videoIdeas.length})</h3>
                <span className="text-[11px] text-neutral-500">Live in Gated Media Kit</span>
              </div>

              {videoIdeas.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 shadow-xs">
                  <p className="text-xs">No video ideas added yet. Add your upcoming video concepts above so sponsors can scope sponsorships.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videoIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs transition-all ${
                        idea.isBooked
                          ? 'bg-amber-50/40 border-amber-200/90'
                          : 'bg-white border-neutral-200/90 hover:border-sky-300'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {idea.isBooked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              🔒 Booked
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                              Open for Sponsorship
                            </span>
                          )}
                          {idea.createdAt && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(idea.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className={`text-sm font-bold ${idea.isBooked ? 'text-neutral-900' : 'text-neutral-950'}`}>
                          {idea.title}
                        </h4>
                        {idea.description && (
                          <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                            {idea.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleToggleBooked(idea.id, idea.isBooked)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            idea.isBooked
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                          }`}
                          title={idea.isBooked ? 'Click to release / unbook this idea' : 'Click to book this idea'}
                        >
                          {idea.isBooked ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-amber-700" />
                              <span>Booked (Click to unbook)</span>
                            </>
                          ) : (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-sky-400" />
                              <span>Book Idea</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideoIdea(idea.id)}
                          className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          title="Delete video idea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Telemetry Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">Brand Access Telemetry</h2>
                <p className="text-xs text-neutral-500">
                  Real-time log recording every instance a gated media kit URL was opened.
                </p>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-500 shadow-xs">
                <Eye className="w-10 h-10 mx-auto mb-3 opacity-30 text-neutral-950" />
                <p className="text-sm font-semibold text-neutral-700">No view records logged yet</p>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-700">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500">
                      <tr>
                        <th className="py-3 px-4">Brand / Company</th>
                        <th className="py-3 px-4">Opened At</th>
                        <th className="py-3 px-4">Token Preview</th>
                        <th className="py-3 px-4">Device / User Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      {logs.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-sans font-bold text-neutral-950">
                            {log.brandName || log.company || 'Direct Token Access'}
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {log.openedAt?._seconds
                              ? new Date(log.openedAt._seconds * 1000).toLocaleString()
                              : new Date(log.openedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-neutral-500">
                            {log.token ? `/kit/${log.token.slice(0, 8)}...` : '—'}
                          </td>
                          <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={log.userAgent}>
                            {log.userAgent || 'Standard Browser'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Inquiries */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">Direct Inquiries</h2>
                <p className="text-xs text-neutral-500">
                  Received sponsor inquiries and requests.
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-500 shadow-xs">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30 text-neutral-950" />
                <p className="text-sm font-semibold text-neutral-700">No brand inquiries yet</p>
                <p className="text-xs text-neutral-400 mt-1">Prospective sponsors reach out directly via sajid@amidia.in.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-950 text-sm">
                        {sub.name} • {sub.company}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-mono">{sub.email}</p>
                    <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      {sub.promotionGoal}
                    </p>
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setModalBrandName(sub.company || sub.name);
                          setModalCompany(sub.company || sub.name);
                          setModalEmail(sub.email);
                          setActiveTab('tokens');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Create Token for {sub.company || sub.name}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
