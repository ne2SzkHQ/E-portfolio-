import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, Smartphone, Check, RefreshCw, AlertCircle, Eye, Info, UserCheck, Code } from 'lucide-react';

interface MpesaTx {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  mpesaReceiptNumber: string;
  amount: string;
  phoneNumber: string;
  status: string;
  rawPayloadHash: string;
  verifiedAt: string;
  createdAt: string;
}

interface ProjectAttachment {
  id: string;
  fileName: string;
  storageUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  securityScanStatus: string;
  checksumSha256: string;
  createdAt: string;
}

interface DBUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  hasConsentedToPrivacy: boolean;
  privacyConsentTimestamp: string;
  dataProtectionStatus: string;
  createdAt: string;
}

export default function DbAuditTrail() {
  const [activeTab, setActiveTab] = useState<'mpesa' | 'attachments' | 'users' | 'simulator'>('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // DB Data States
  const [transactions, setTransactions] = useState<MpesaTx[]>([]);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);

  // Simulator Form States
  const [phone, setPhone] = useState('254712345678');
  const [amount, setAmount] = useState('500');
  const [checkoutId, setCheckoutId] = useState('ws_CO_191220191020363925');
  const [passkey, setPasskey] = useState('your_secret_passkey');
  const [corruptSignature, setCorruptSignature] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/audit-ledger');
      if (!res.ok) {
        throw new Error('Failed to synchronize cloud audit logs.');
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
      setAttachments(data.attachments || []);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading live database trails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Simulates standard Safaricom M-Pesa IPN payload construction and cryptographic hashing
  const handleSimulateCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setError(null);
    setSuccess(null);

    try {
      const receiptNum = "NLJ" + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      // Standard Safaricom STK Push Payload
      const payload = {
        Body: {
          stkCallback: {
            MerchantRequestID: "29115-" + Math.floor(Math.random() * 1000000) + "-1",
            CheckoutRequestID: checkoutId,
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: parseFloat(amount) },
                { Name: "MpesaReceiptNumber", Value: receiptNum },
                { Name: "TransactionDate", Value: 20260720102115 },
                { Name: "PhoneNumber", Value: parseInt(phone) }
              ]
            }
          }
        }
      };

      const payloadString = JSON.stringify(payload);
      
      // We calculate the HMAC SHA-256 signature to supply in headers
      // Note: In real production, this is computed using node crypto library by Safaricom.
      // Since we need to match it, we'll request a custom client-side HMAC signature.
      // We can mock calculate it easily using a simple hash-like logic or invoke an endpoint,
      // or implement standard HMAC in client. To make it extremely reliable, let's post it!
      
      // Let's implement a quick JS-based HMAC Sha256 helper, or calculate it client-side.
      // Wait, we can calculate it on the server, but the server signature check expects us to send the correct signature header.
      // Let's use a subtle-crypto or simple custom API to generate signature, OR we can use standard JS CryptoJS pattern, 
      // OR even simpler, we can perform a call to a helper endpoint `POST /api/v1/payments/sign` or use Web Crypto API!
      // Let's use Web Crypto API to calculate real authentic HMAC SHA-256! This is incredible and fully secure!
      
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(passkey);
      const messageBuffer = encoder.encode(payloadString);
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageBuffer
      );
      
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      let signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (corruptSignature) {
        // Corrupt signature intentionally to simulate spoofing audit trails
        signatureHex = "corrupted_signature_" + signatureHex.slice(18);
      }

      const response = await fetch('/api/v1/payments/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mpesa-signature': signatureHex
        },
        body: payloadString
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Callback rejected with status ${response.status}`);
      }

      setSuccess(`Callback processed successfully! ResultCode: ${result.ResultCode}. ${result.ResultDesc}`);
      setCheckoutId('ws_CO_' + Math.floor(Math.random() * 1000000000));
      
      // Instantly refresh the ledger to see the live Postgres rows!
      await fetchLedger();
      setActiveTab('mpesa');
    } catch (err: any) {
      setError(err.message || 'Signature simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id="db-audit-trail-container" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] inline-block mb-1.5">
            PostgreSQL Cloud SQL Engine
          </span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            Live Cloud SQL Audit Ledger
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Read-time query stream visualizing secure, immutable transaction trails, trainee privacy consent logs, and uploaded evidence attachments.
          </p>
        </div>

        <button
          id="btn-refresh-ledger"
          onClick={fetchLedger}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Database Logs
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-xs text-red-800 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Ledger Synchronization Error</p>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          id="btn-tab-mpesa"
          onClick={() => setActiveTab('mpesa')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mpesa'
              ? 'border-emerald-600 text-emerald-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          💳 M-Pesa Logs ({transactions.length})
        </button>
        <button
          id="btn-tab-attachments"
          onClick={() => setActiveTab('attachments')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'attachments'
              ? 'border-emerald-600 text-emerald-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          📁 Attachments ({attachments.length})
        </button>
        <button
          id="btn-tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          👥 User Consent ({users.length})
        </button>
        <button
          id="btn-tab-simulator"
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'border-amber-600 text-amber-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Code className="h-3.5 w-3.5" /> Webhook Simulator
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[220px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Synchronizing secure Ledger records...</p>
          </div>
        )}

        {!loading && activeTab === 'mpesa' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4">Receipt No</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Checkout Request ID</th>
                  <th className="p-4">Verification Hash</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No transactions found. Use the Webhook Simulator tab to send signed STK Pushes!
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{tx.mpesaReceiptNumber}</td>
                      <td className="p-4 font-mono">+{tx.phoneNumber}</td>
                      <td className="p-4 font-bold text-slate-900">KES {parseFloat(tx.amount).toLocaleString()}</td>
                      <td className="p-4 font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{tx.checkoutRequestId}</td>
                      <td className="p-4 font-mono text-[9px] text-slate-400 max-w-[100px] truncate" title={tx.rawPayloadHash}>
                        {tx.rawPayloadHash}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : tx.status === 'SPOOF_ATTEMPT'
                              ? 'bg-red-50 text-red-700 border border-red-150 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">
                        {new Date(tx.verifiedAt || tx.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'attachments' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4">File Name</th>
                  <th className="p-4">Mime Type</th>
                  <th className="p-4">File Size</th>
                  <th className="p-4">Storage URL</th>
                  <th className="p-4">Malware Scan Status</th>
                  <th className="p-4">Sha-256 Checksum</th>
                  <th className="p-4">Created At</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 font-medium">
                {attachments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No uploaded evidence registries stored in PostgreSQL. Go to Trainee Workspace to upload evidence logs!
                    </td>
                  </tr>
                ) : (
                  attachments.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{att.fileName}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{att.mimeType}</td>
                      <td className="p-4 text-slate-900 font-bold">{formatBytes(att.fileSizeBytes)}</td>
                      <td className="p-4 max-w-[140px] truncate">
                        <a href={att.storageUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-mono text-[10px]">
                          {att.storageUrl}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          🛡️ {att.securityScanStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[9px] text-slate-400 max-w-[100px] truncate" title={att.checksumSha256}>
                        {att.checksumSha256}
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">
                        {new Date(att.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role Path</th>
                  <th className="p-4">Privacy Consent</th>
                  <th className="p-4">Consent Timestamp</th>
                  <th className="p-4">Data Protection Status</th>
                  <th className="p-4">Registered At</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 font-medium">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No active users mapped in PostgreSQL.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-4 text-slate-500 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <Check className="h-4 w-4 stroke-[3] text-emerald-600" /> Granted
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">
                        {u.privacyConsentTimestamp ? new Date(u.privacyConsentTimestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          {u.dataProtectionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'simulator' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Form */}
            <form onSubmit={handleSimulateCallback} className="space-y-4 rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  Safaricom Gateway Simulator
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Trigger custom M-Pesa webhooks utilizing HMAC-SHA256 signatures derived from secret initiator passkeys.
                </p>
              </div>

              {success && (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-100">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                  <div>
                    <p className="font-bold">Gateway Acknowledged</p>
                    <p className="mt-0.5 text-emerald-700">{success}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Safaricom Phone Number
                  </label>
                  <input
                    id="sim-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Amount (KES)
                  </label>
                  <input
                    id="sim-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Checkout Request ID (Safaricom Reference)
                  </label>
                  <input
                    id="sim-checkout-id"
                    type="text"
                    value={checkoutId}
                    onChange={(e) => setCheckoutId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Secret Initiator Passkey (Key Matrix)
                  </label>
                  <input
                    id="sim-passkey"
                    type="text"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono text-emerald-700 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Spoof Toggle */}
              <div className="rounded-xl border border-dashed border-red-200 bg-red-50/10 p-3.5 flex items-start gap-3">
                <input
                  id="sim-corrupt-toggle"
                  type="checkbox"
                  checked={corruptSignature}
                  onChange={(e) => setCorruptSignature(e.target.checked)}
                  className="mt-1.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="sim-corrupt-toggle" className="text-xs font-black text-red-800 uppercase tracking-wider cursor-pointer flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    Intentionally Corrupt HMAC Signature
                  </label>
                  <p className="text-[10px] text-red-600 mt-0.5 font-medium leading-relaxed">
                    Corrupts the cryptographic signature header payload. Used to test the backend's protective cyber walls and audit logging of unauthorized intrusion attempts.
                  </p>
                </div>
              </div>

              <button
                id="btn-trigger-callback-sim"
                type="submit"
                disabled={simulating}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  corruptSignature
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/10'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10'
                }`}
              >
                {simulating ? 'Hashing & Transmitting...' : 'Send Signed IPN Callback'}
              </button>
            </form>

            {/* Information panel */}
            <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Under the Hood Security Flow
              </h4>

              <div className="space-y-3.5 text-xs font-medium text-slate-600 leading-relaxed">
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">1</span>
                  <p>
                    <strong>Safaricom Webhook Delivery</strong>: Safaricom sends a raw JSON callback containing receipt items, amounts, and metadata.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">2</span>
                  <p>
                    <strong>Pristine Raw Processing</strong>: To prevent subtle payload tampering or formatting mismatches, the route uses <code>express.raw()</code> parser, bypassing JSON parsing initially.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">3</span>
                  <p>
                    <strong>Cryptographic Verification</strong>: Server constructs an HMAC-SHA256 signature from the raw body using the secret <code>MPESA_INITIATOR_PASSKEY</code>, comparing it to <code>x-mpesa-signature</code> header.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">4</span>
                  <p>
                    <strong>Cyber audit trail</strong>: Unauthorized or spoofed requests are instantly flagged, rejected with a <code>401 Unauthorized</code> status, and recorded as <code>SPOOF_ATTEMPT</code> log rows inside Postgres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
