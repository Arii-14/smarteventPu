import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, CheckCircle, XCircle, AlertTriangle, RefreshCw, User } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';

// Attempt to extract token from QR data (could be URL or raw token)
function extractToken(qrData) {
  try {
    const url = new URL(qrData);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || qrData;
  } catch {
    return qrData.trim();
  }
}

const SCAN_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  SUCCESS: 'success',
  ALREADY: 'already',
  ERROR: 'error',
};

export default function QRScannerModal({ eventId, eventTitle, onClose }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cooldownRef = useRef(false);

  // Get cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then(devs => {
      setCameras(devs);
      if (devs.length > 0) setSelectedCamera(devs[devs.length - 1].id); // Prefer back camera
    }).catch(err => {
      console.error('Camera access error:', err);
    });
    return () => stopScanner();
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (selectedCamera && scanState === SCAN_STATES.IDLE) {
      startScanner();
    }
    return () => stopScanner();
  }, [selectedCamera]);

  const startScanner = async () => {
    if (!scannerRef.current || !selectedCamera) return;
    try {
      stopScanner();
      html5QrRef.current = new Html5Qrcode('qr-reader');
      await html5QrRef.current.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScanSuccess,
        () => {} // ignore decode errors silently
      );
      setScanState(SCAN_STATES.SCANNING);
    } catch (err) {
      console.error('Scanner start error:', err);
    }
  };

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    stopScanner();
    setIsLoading(true);
    setScanState(SCAN_STATES.SCANNING);

    const token = extractToken(decodedText);

    try {
      const { data } = await api.post(`/events/${eventId}/scan`, { qr_token: token });
      setResult({ ...data, token });
      setScanState(SCAN_STATES.SUCCESS);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses QR Code.';
      const isAlready = err.response?.status === 409;
      setResult({
        message: msg,
        participant: err.response?.data?.participant,
        token
      });
      setScanState(isAlready ? SCAN_STATES.ALREADY : SCAN_STATES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    cooldownRef.current = false;
    setResult(null);
    setScanState(SCAN_STATES.IDLE);
    setTimeout(() => startScanner(), 300);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      style={{ animation: 'fadeInBackdrop 0.2s ease forwards' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Scan QR Kehadiran</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Selector */}
        {cameras.length > 1 && (
          <div className="px-6 pt-4">
            <select
              value={selectedCamera || ''}
              onChange={e => { stopScanner(); setSelectedCamera(e.target.value); setScanState(SCAN_STATES.IDLE); }}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>{cam.label || cam.id}</option>
              ))}
            </select>
          </div>
        )}

        {/* Scanner / Result Area */}
        <div className="p-6">

          {/* QR Reader Element – hidden when showing result */}
          <div
            id="qr-reader"
            ref={scannerRef}
            className={`rounded-2xl overflow-hidden border border-white/10 ${(scanState === SCAN_STATES.SUCCESS || scanState === SCAN_STATES.ERROR || scanState === SCAN_STATES.ALREADY) ? 'hidden' : 'block'}`}
            style={{ width: '100%' }}
          />

          {/* Scanning Overlay */}
          {scanState === SCAN_STATES.SCANNING && isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full border-[3px] border-violet-500/30 border-t-violet-500 animate-spin" />
              <p className="text-sm text-slate-400">Memproses QR Code...</p>
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {scanState === SCAN_STATES.SUCCESS && result && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle size={36} className="text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">Kehadiran Dicatat!</p>
                <p className="text-sm text-slate-400 mt-1">{result.message}</p>
              </div>
              {result.participant && (
                <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                  {result.participant.photo ? (
                    <img
                      src={result.participant.photo.startsWith('http') ? result.participant.photo : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${result.participant.photo}`}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
                      alt=""
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(result.participant.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{result.participant.name || '—'}</p>
                    {result.participant.nim && <p className="text-xs text-slate-400 mt-0.5">NIM: {result.participant.nim}</p>}
                    {result.participant.email && <p className="text-xs text-slate-500 mt-0.5">{result.participant.email}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ALREADY PRESENT ─── */}
          {scanState === SCAN_STATES.ALREADY && result && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle size={32} className="text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-400">Sudah Hadir</p>
                <p className="text-sm text-slate-400 mt-1">{result.message}</p>
              </div>
              {result.participant && (
                <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {getInitials(result.participant.name)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{result.participant.name || '—'}</p>
                    {result.participant.nim && <p className="text-xs text-slate-400 mt-0.5">NIM: {result.participant.nim}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ERROR ─── */}
          {scanState === SCAN_STATES.ERROR && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center">
                <XCircle size={32} className="text-rose-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-rose-400">QR Tidak Valid</p>
                <p className="text-sm text-slate-400 mt-1">{result?.message || 'QR Code tidak dikenali atau tidak terdaftar.'}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(scanState === SCAN_STATES.SUCCESS || scanState === SCAN_STATES.ERROR || scanState === SCAN_STATES.ALREADY) && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw size={16} />
                Scan Berikutnya
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all"
              >
                Selesai
              </button>
            </div>
          )}

          {/* Guide text while idle/scanning */}
          {(scanState === SCAN_STATES.IDLE || (scanState === SCAN_STATES.SCANNING && !isLoading)) && (
            <p className="text-center text-xs text-slate-500 mt-4">
              Arahkan kamera ke QR Code peserta untuk mencatat kehadiran
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
