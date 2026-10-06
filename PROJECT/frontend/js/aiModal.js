/**
 * BEACON 3D - AI Neural Match Modal & Breakdown Visualizer
 * Shows real-time multi-modal match calculation, confidence breakdown gauges, and instant pairing actions.
 */

import { stateManager, CAMPUS_BUILDINGS } from './data.js';
import { aiMatchingEngine } from './aiEngine.js';
import { audioEngine } from './audioEngine.js';

export class AIModalController {
  constructor(modalId, options = {}) {
    this.modal = document.getElementById(modalId);
    this.options = options;
    this.currentItem = null;
  }

  init() {
    this.bindEvents();
  }

  open(itemId) {
    const item = stateManager.items.find(i => i.id === itemId);
    if (!item) return;

    this.currentItem = item;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    audioEngine.playScan();

    this.renderScanningState();

    // Simulate real-time neural computation delay
    setTimeout(() => {
      this.renderResults();
    }, 600);
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    audioEngine.playClick();
  }

  bindEvents() {
    const closeBtn = document.getElementById('ai-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
  }

  renderScanningState() {
    const content = document.getElementById('ai-modal-content');
    if (!content) return;

    content.innerHTML = `
      <div class="py-16 text-center space-y-4">
        <div class="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping"></div>
          <div class="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_#00f0ff]">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
          </div>
        </div>
        <h3 class="text-base font-bold text-white">Running Multi-Modal Neural Scan...</h3>
        <p class="text-xs text-slate-400 max-w-sm mx-auto font-mono">
          Extracting feature vectors, analyzing spatial-temporal coordinates, and correlating image tags across the campus network.
        </p>
      </div>
    `;
  }

  renderResults() {
    const content = document.getElementById('ai-modal-content');
    if (!content || !this.currentItem) return;

    const source = this.currentItem;
    const matches = aiMatchingEngine.findMatchesForItem(source, stateManager.items);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Target Item Header Card -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
            </div>
            <div>
              <span class="text-[10px] uppercase font-mono text-cyan-400">Source: ${source.type}</span>
              <h4 class="text-sm font-bold text-white">${source.title}</h4>
              <p class="text-xs text-slate-400 truncate max-w-xs">${source.specificLocation || 'Campus'}</p>
            </div>
          </div>
          <div class="text-right font-mono">
            <span class="text-[11px] text-slate-400 block">Candidate Pool</span>
            <span class="text-sm font-bold text-cyan-300">${matches.length} candidates</span>
          </div>
        </div>

        <!-- Matches List -->
        <div class="space-y-4">
          <h4 class="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Neural Similarity Rankings</span>
            <span class="text-cyan-400 text-[11px]">Sorted by Highest Probability</span>
          </h4>

          ${matches.length === 0 ? `
            <div class="p-8 text-center glass-panel rounded-xl border border-white/10">
              <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
              </div>
              <p class="text-xs text-slate-300 font-medium">No opposite reports logged in this category yet.</p>
              <p class="text-[11px] text-slate-500 mt-1 font-mono">Our system monitors new submissions in real-time and will alert you if a match appears.</p>
            </div>
          ` : matches.map(m => this.renderMatchCard(m, source)).join('')}
        </div>
      </div>
    `;

    // Attach match card buttons
    content.querySelectorAll('.btn-pair-chat').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchedItemId = btn.getAttribute('data-id');
        const matchedItem = stateManager.items.find(i => i.id === matchedItemId);
        this.close();
        if (this.options.onOpenChat && matchedItem) {
          this.options.onOpenChat(matchedItem);
        }
      });
    });

    content.querySelectorAll('.btn-pair-claim').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchedItemId = btn.getAttribute('data-id');
        this.close();
        if (this.options.onOpenClaim) {
          this.options.onOpenClaim(matchedItemId);
        }
      });
    });
  }

  renderMatchCard(matchObj, sourceItem) {
    const item = matchObj.item;
    const score = matchObj.score;
    const b = matchObj.breakdown;

    const bldg = CAMPUS_BUILDINGS.find(bg => bg.id === item.buildingId);
    const scoreColor = score >= 85 ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : score >= 65 ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10' : 'text-amber-400 border-amber-500/50 bg-amber-500/10';

    return `
      <div class="p-4 rounded-xl glass-panel border border-white/10 hover:border-cyan-500/40 transition-all space-y-4">
        <!-- Card Top Bar -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'lost' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                ${item.type}
              </span>
              <span class="text-xs text-slate-400 font-mono flex items-center gap-1">
                <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${bldg?.code || 'Campus'}
              </span>
            </div>
            <h5 class="text-sm font-bold text-white">${item.title}</h5>
            <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${item.description}</p>
          </div>

          <!-- Overall Match Gauge -->
          <div class="px-3 py-2 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreColor}">
            <span class="text-base font-black font-mono leading-none">${score}%</span>
            <span class="text-[9px] font-semibold uppercase tracking-wider mt-0.5 font-mono">Match</span>
          </div>
        </div>

        <!-- Detailed Feature Breakdown Gauges -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
          <div class="p-1.5 rounded bg-white/5">
            <div class="text-slate-400 mb-0.5 flex justify-between">
              <span>Category</span>
              <span class="font-bold text-white">${b.category}%</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-cyan-400" style="width: ${b.category}%"></div>
            </div>
          </div>

          <div class="p-1.5 rounded bg-white/5">
            <div class="text-slate-400 mb-0.5 flex justify-between">
              <span>Keywords</span>
              <span class="font-bold text-white">${b.keywords}%</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-400" style="width: ${b.keywords}%"></div>
            </div>
          </div>

          <div class="p-1.5 rounded bg-white/5">
            <div class="text-slate-400 mb-0.5 flex justify-between">
              <span>Proximity</span>
              <span class="font-bold text-white">${b.location}%</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-purple-400" style="width: ${b.location}%"></div>
            </div>
          </div>

          <div class="p-1.5 rounded bg-white/5">
            <div class="text-slate-400 mb-0.5 flex justify-between">
              <span>Color Match</span>
              <span class="font-bold text-white">${b.color}%</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-pink-400" style="width: ${b.color}%"></div>
            </div>
          </div>

          <div class="p-1.5 rounded bg-white/5 col-span-2 sm:col-span-1">
            <div class="text-slate-400 mb-0.5 flex justify-between">
              <span>Time Delta</span>
              <span class="font-bold text-white">${b.time}%</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400" style="width: ${b.time}%"></div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between gap-3 pt-1 font-mono">
          <span class="text-[11px] text-slate-400">Reporter: <strong class="text-slate-200">${item.reporter?.name || 'Campus Student'}</strong></span>
          <div class="flex gap-2">
            ${item.type === 'found' ? `
              <button class="btn-pair-claim px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all" data-id="${item.id}">
                Claim Item
              </button>
            ` : ''}
            <button class="btn-pair-chat px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5" data-id="${item.id}">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Connect Now</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
