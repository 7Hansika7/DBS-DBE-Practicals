/**
 * BEACON 3D - Campus Security & Admin Moderation Portal
 * Manages physical custody locker assignments, moderation queues, dispute verification, and audit logs.
 */

import { stateManager, CAMPUS_BUILDINGS } from './data.js';
import { audioEngine } from './audioEngine.js';

export class AdminPortalController {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.activeTab = 'lockers'; // 'lockers' | 'moderation' | 'analytics'
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    const stats = stateManager.getStats();
    const items = stateManager.items;
    const vaultItems = items.filter(i => i.custody === 'security_locker');

    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Side: Security Portal Command Deck (BESIDE the 3D Vault) -->
        <div class="lg:col-span-7 xl:col-span-6 space-y-5">
          <!-- Admin Header Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 glass-panel hud-box p-4 rounded-2xl border border-white/10">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-white">Campus Security Command</h3>
                  <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    OFFICER ACCESS
                  </span>
                </div>
                <p class="text-[11px] text-slate-400">Physical custody verification & locker assignment.</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 font-mono">
              <button id="admin-export-csv" class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1 transition-all">
                <svg class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>CSV</span>
              </button>
              <button id="admin-reset-data" class="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-[11px] font-semibold border border-red-500/30 transition-all flex items-center gap-1">
                <svg class="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>Reset</span>
              </button>
            </div>
          </div>

          <!-- Telemetry Cards -->
          <div class="grid grid-cols-3 gap-2 text-center font-mono">
            <div class="p-3 rounded-xl glass-panel border border-white/10">
              <span class="text-[10px] text-slate-400 block mb-0.5">In Vault</span>
              <span class="text-xl font-bold text-cyan-400 font-mono">${stats.inVault}</span>
            </div>
            <div class="p-3 rounded-xl glass-panel border border-white/10">
              <span class="text-[10px] text-slate-400 block mb-0.5">Reunited</span>
              <span class="text-xl font-bold text-purple-400 font-mono">${stats.totalReunited}</span>
            </div>
            <div class="p-3 rounded-xl glass-panel border border-white/10">
              <span class="text-[10px] text-slate-400 block mb-0.5">Value Saved</span>
              <span class="text-sm font-bold text-emerald-400 font-mono leading-tight">\$${stats.totalValuationEstimate.toLocaleString()}</span>
            </div>
          </div>

          <!-- Admin Navigation Tabs -->
          <div class="flex border-b border-white/10 gap-4 text-xs font-semibold font-mono">
            <button class="admin-tab-btn pb-2 border-b-2 transition-all ${this.activeTab === 'lockers' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'}" data-tab="lockers">
              Lockers (${vaultItems.length})
            </button>
            <button class="admin-tab-btn pb-2 border-b-2 transition-all ${this.activeTab === 'moderation' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'}" data-tab="moderation">
              Moderation (${items.length})
            </button>
          </div>

          <!-- Tab Contents -->
          ${this.activeTab === 'lockers' ? this.renderLockersTab(vaultItems, items) : this.renderModerationTab(items)}
        </div>

        <!-- Right Side: 100% OPEN FOR 3D SECURITY VAULT -->
        <div class="hidden lg:block lg:col-span-5 xl:col-span-6 pointer-events-none sticky top-28 h-[550px]">
          <!-- The 3D motorized vault door renders right beside the table! -->
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderLockersTab(vaultItems, allItems) {
    const unassignedFound = allItems.filter(i => i.type === 'found' && i.custody !== 'security_locker' && i.status !== 'reunited');

    return `
      <div class="space-y-6">
        <!-- Quick Locker Ingestion Bar -->
        <div class="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <div>
              <h5 class="text-xs font-bold text-white">Log Item into Physical Locker</h5>
              <p class="text-[11px] text-slate-400">Assign a physical security safe box ID to newly surrendered items.</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <select id="admin-assign-item-select" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500">
              ${unassignedFound.length === 0 ? '<option>No unassigned found items</option>' : unassignedFound.map(i => `<option value="${i.id}">${i.title}</option>`).join('')}
            </select>
            <input id="admin-locker-input" type="text" placeholder="Locker ID (e.g. Locker B-14)" class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs w-36 focus:outline-none focus:border-cyan-500" />
            <button id="admin-btn-assign" class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md">
              Secure in Locker
            </button>
          </div>
        </div>

        <!-- Lockers Inventory Table -->
        <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/10">
              <tr>
                <th class="p-4">Locker ID</th>
                <th class="p-4">Item Name</th>
                <th class="p-4">Location Found</th>
                <th class="p-4">Date Logged</th>
                <th class="p-4">Security Officer</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${vaultItems.length === 0 ? `
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-400">No items currently stored in campus lockers.</td>
                </tr>
              ` : vaultItems.map(item => {
                const bldg = CAMPUS_BUILDINGS.find(b => b.id === item.buildingId);
                return `
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-4 font-mono font-bold text-cyan-300">${item.lockerId || 'Locker X-01'}</td>
                    <td class="p-4 font-bold text-white">${item.title}</td>
                    <td class="p-4 text-slate-300">${bldg?.name || 'Campus'}</td>
                    <td class="p-4 text-slate-400 font-mono">${new Date(item.date).toLocaleDateString()}</td>
                    <td class="p-4 text-slate-300">Officer Daniels</td>
                    <td class="p-4 text-right">
                      <button class="btn-release-locker px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all" data-id="${item.id}">
                        Verify & Release
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderModerationTab(items) {
    return `
      <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/10">
            <tr>
              <th class="p-4">Type</th>
              <th class="p-4">Title & Details</th>
              <th class="p-4">Category</th>
              <th class="p-4">Status</th>
              <th class="p-4">Reporter</th>
              <th class="p-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${items.map(item => `
              <tr class="hover:bg-white/5 transition-colors">
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'lost' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                    ${item.type}
                  </span>
                </td>
                <td class="p-4">
                  <div class="font-bold text-white">${item.title}</div>
                  <div class="text-[11px] text-slate-400 truncate max-w-xs">${item.description}</div>
                </td>
                <td class="p-4 text-slate-300 capitalize">${item.category}</td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono ${item.status === 'reunited' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-300'}">
                    ${item.status}
                  </span>
                </td>
                <td class="p-4 text-slate-300">${item.reporter?.name || 'Student'}</td>
                <td class="p-4 text-right space-x-1">
                  <button class="btn-admin-flag px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] transition-all" data-id="${item.id}">
                    Flag
                  </button>
                  <button class="btn-admin-delete px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] transition-all" data-id="${item.id}">
                    Remove
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  attachEvents() {
    // Tab switching
    this.container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioEngine.playClick();
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Locker Assignment button
    const assignBtn = document.getElementById('admin-btn-assign');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        const itemSelect = document.getElementById('admin-assign-item-select');
        const lockerInput = document.getElementById('admin-locker-input');
        const itemId = itemSelect?.value;
        const lockerId = lockerInput?.value.trim() || 'Locker ' + String.fromCharCode(65 + Math.floor(Math.random() * 4)) + '-' + Math.floor(10 + Math.random() * 80);

        if (itemId) {
          audioEngine.playChime();
          stateManager.assignLocker(itemId, lockerId);
          this.render();
          if (this.options.onStateChange) this.options.onStateChange();
        }
      });
    }

    // Release locker button
    this.container.querySelectorAll('.btn-release-locker').forEach(btn => {
      btn.addEventListener('click', () => {
        audioEngine.playChime();
        const itemId = btn.getAttribute('data-id');
        stateManager.updateItemStatus(itemId, 'reunited', {
          reunitedDate: new Date().toISOString(),
          reunitedBy: 'Desk Officer'
        });
        stateManager.addNotification({
          title: 'Item Claimed & Released from Locker',
          message: 'Campus Security verified student credentials and handed over the item.',
          type: 'success',
          itemId
        });
        this.render();
        if (this.options.onStateChange) this.options.onStateChange();
      });
    });

    // Export CSV
    const exportBtn = document.getElementById('admin-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        audioEngine.playClick();
        this.exportCSV();
      });
    }

    // Reset Demo Data
    const resetBtn = document.getElementById('admin-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset system data to original demo dataset?')) {
          audioEngine.playChime();
          stateManager.resetToDefaults();
          this.render();
          if (this.options.onStateChange) this.options.onStateChange();
        }
      });
    }
  }

  exportCSV() {
    const items = stateManager.items;
    const headers = ['ID', 'Type', 'Title', 'Category', 'Status', 'Building', 'Location', 'Date', 'Reporter', 'Locker'];
    const rows = items.map(i => [
      i.id,
      i.type,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.status,
      i.buildingId,
      `"${(i.specificLocation || '').replace(/"/g, '""')}"`,
      i.date,
      `"${(i.reporter?.name || '').replace(/"/g, '""')}"`,
      i.lockerId || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_lost_found_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
