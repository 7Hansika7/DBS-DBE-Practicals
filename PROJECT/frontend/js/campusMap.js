/**
 * BEACON 3D - Campus Radar & Heatmap Controller
 * Visualizes campus buildings, loss/found density, security desk locations, and syncs with 3D camera.
 */

import { CAMPUS_BUILDINGS, stateManager } from './data.js';
import { audioEngine } from './audioEngine.js';

export class CampusMapController {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.activeBuildingId = 'bldg-lib';
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    const items = stateManager.items;

    // Compute building stats
    const bldgStats = CAMPUS_BUILDINGS.map(b => {
      const lost = items.filter(i => i.buildingId === b.id && i.type === 'lost' && i.status !== 'reunited').length;
      const found = items.filter(i => i.buildingId === b.id && i.type === 'found' && i.status !== 'reunited').length;
      const reunited = items.filter(i => i.buildingId === b.id && i.status === 'reunited').length;
      return {
        ...b,
        lost,
        found,
        reunited,
        total: lost + found + reunited
      };
    });

    const activeBldg = bldgStats.find(b => b.id === this.activeBuildingId) || bldgStats[0];

    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Side: Campus Sectors & Selected Inspector (Cols 1-5, BESIDE the 3D Map) -->
        <div class="lg:col-span-6 xl:col-span-5 space-y-4">
          <!-- Building Selector Chips -->
          <div class="glass-panel hud-box p-4 rounded-2xl border border-white/10 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-mono uppercase tracking-wider text-cyan-400">Campus Sectors</h4>
              <span class="text-[10px] text-slate-400">6 Zones Monitored</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              ${bldgStats.map(b => {
                const isActive = b.id === this.activeBuildingId;
                return `
                  <button class="campus-zone-card text-left p-2.5 rounded-xl border transition-all ${isActive ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'}" data-id="${b.id}">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-mono font-bold text-xs ${isActive ? 'text-cyan-300' : 'text-slate-300'}">${b.code}</span>
                      <span class="text-[10px] ${b.lost > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}">${b.lost} Lost</span>
                    </div>
                    <div class="text-[11px] font-bold text-white truncate leading-tight">${b.name.split('&')[0]}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Building Radar Detail Inspector -->
          <div class="glass-panel hud-box p-5 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="px-2 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                    ${activeBldg.code}
                  </span>
                  <span class="text-[11px] text-amber-400 font-mono font-medium">[${activeBldg.riskLevel.toUpperCase()}]</span>
                </div>
                <h3 class="text-base font-bold text-white">${activeBldg.name}</h3>
              </div>

              <button id="btn-sync-3d-focus" class="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-bold shadow-md flex items-center gap-1.5 transition-all flex-shrink-0 font-mono">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                <span>Focus 3D</span>
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div class="p-2 rounded-lg bg-white/5 border border-white/5">
                <span class="text-sm font-bold text-amber-400 block">${activeBldg.lost}</span>
                <span class="text-[10px] text-slate-400">Active Lost</span>
              </div>
              <div class="p-2 rounded-lg bg-white/5 border border-white/5">
                <span class="text-sm font-bold text-emerald-400 block">${activeBldg.found}</span>
                <span class="text-[10px] text-slate-400">Found</span>
              </div>
              <div class="p-2 rounded-lg bg-white/5 border border-white/5">
                <span class="text-sm font-bold text-purple-400 block">${activeBldg.reunited}</span>
                <span class="text-[10px] text-slate-400">Reunited</span>
              </div>
            </div>

            <!-- Official Security Desk -->
            <div class="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-2.5 text-xs">
              <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h5 class="font-bold text-white text-[11px]">Safe Exchange Desk:</h5>
                <p class="text-cyan-300 font-medium text-[11px]">${activeBldg.securityDesk}</p>
              </div>
            </div>

            <!-- Action -->
            <div class="flex justify-end">
              <button id="btn-filter-feed-by-bldg" class="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all text-center">
                Filter Live Feed for ${activeBldg.code} Items →
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: 100% OPEN FOR 3D CAMPUS ISLAND -->
        <div class="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none sticky top-28 h-[550px]">
          <!-- The 3D campus island renders right beside the selector! -->
        </div>
      </div>
    `;

    // Attach click events
    this.container.querySelectorAll('.campus-zone-card').forEach(card => {
      card.addEventListener('click', () => {
        audioEngine.playClick();
        this.activeBuildingId = card.getAttribute('data-id');
        this.render();

        if (this.options.onBuildingSelected) {
          this.options.onBuildingSelected(this.activeBuildingId);
        }
      });
    });

    const focus3DBtn = document.getElementById('btn-sync-3d-focus');
    if (focus3DBtn && this.options.onFocus3D) {
      focus3DBtn.addEventListener('click', () => {
        audioEngine.playScan();
        this.options.onFocus3D(this.activeBuildingId);
      });
    }

    const filterFeedBtn = document.getElementById('btn-filter-feed-by-bldg');
    if (filterFeedBtn && this.options.onFilterFeed) {
      filterFeedBtn.addEventListener('click', () => {
        audioEngine.playClick();
        this.options.onFilterFeed(this.activeBuildingId);
      });
    }
  }
}
