/**
 * EYE OF ODIN - Lost & Found Item Tracker for Campus
 * Feed Controller: Side-Docked Asymmetric Stream that sits BESIDE the 3D animation!
 */

import { stateManager, CAMPUS_BUILDINGS, CATEGORIES } from './data.js';
import { audioEngine } from './audioEngine.js';

export class FeedController {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
  }

  init() {
    this.renderFilters();
    this.renderFeed();
    this.setupSearch();
  }

  renderFilters() {
    // 1. Category Bar (Includes 'Others / Unlisted')
    const categoryBar = document.getElementById('category-filter-bar');
    if (categoryBar) {
      categoryBar.innerHTML = CATEGORIES.map(cat => {
        const active = stateManager.activeFilter.category === cat.id ? 'active-filter' : '';
        return `
          <button class="filter-pill ${active}" data-category="${cat.id}">
            <span>${this.getCategoryIcon(cat.icon)}</span>
            <span>${cat.name}</span>
          </button>
        `;
      }).join('');

      categoryBar.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          audioEngine.playClick();
          const catId = btn.getAttribute('data-category');
          stateManager.activeFilter.category = catId;
          this.renderFilters();
          this.renderFeed();
        });
      });
    }

    // 2. Priority Filter Bar
    const priorityTabs = document.querySelectorAll('.priority-tab-btn');
    priorityTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audioEngine.playClick();
        priorityTabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        stateManager.activeFilter.priority = tab.getAttribute('data-priority');
        this.renderFeed();
      });
    });

    // 3. Type Tabs (All, Lost, Found, In Vault, Reunited)
    const typeTabs = document.querySelectorAll('.type-tab-btn');
    typeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audioEngine.playClick();
        typeTabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');

        const type = tab.getAttribute('data-type');
        if (type === 'in_vault') {
          stateManager.activeFilter.type = 'all';
          stateManager.activeFilter.status = 'in_vault';
        } else if (type === 'reunited') {
          stateManager.activeFilter.type = 'all';
          stateManager.activeFilter.status = 'reunited';
        } else {
          stateManager.activeFilter.type = type;
          stateManager.activeFilter.status = 'all';
        }
        this.renderFeed();
      });
    });

    // 4. Campus Zone Dropdown
    const zoneSelect = document.getElementById('zone-filter-select');
    if (zoneSelect) {
      zoneSelect.innerHTML = `<option value="all">All Campus Locations</option>` +
        CAMPUS_BUILDINGS.map(b => `<option value="${b.id}">${b.name} (${b.code})</option>`).join('');

      zoneSelect.addEventListener('change', e => {
        audioEngine.playClick();
        stateManager.activeFilter.buildingId = e.target.value;
        this.renderFeed();
      });
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('feed-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', e => {
      stateManager.activeFilter.search = e.target.value;
      this.renderFeed();
    });

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        stateManager.activeFilter.search = '';
        this.renderFeed();
      });
    }
  }

  renderFeed() {
    if (!this.container) return;

    const items = stateManager.getFilteredItems();
    const countBadge = document.getElementById('feed-count-badge');
    if (countBadge) {
      countBadge.textContent = `${items.length} items logged`;
    }

    if (items.length === 0) {
      this.container.innerHTML = `
        <div class="py-12 text-center glass-panel rounded-2xl border border-white/10 p-6">
          <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
          </div>
          <h4 class="text-sm font-bold text-white mb-1">No items found matching filters</h4>
          <p class="text-slate-400 text-xs max-w-xs mx-auto mb-4">
            Try switching priorities or categories to see more items in Odin's Network.
          </p>
          <button id="empty-clear-btn" class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
            Reset Filters
          </button>
        </div>
      `;

      const emptyClear = document.getElementById('empty-clear-btn');
      if (emptyClear) {
        emptyClear.addEventListener('click', () => {
          stateManager.activeFilter = { type: 'all', category: 'all', buildingId: 'all', search: '', status: 'all', priority: 'all' };
          const searchInput = document.getElementById('feed-search-input');
          if (searchInput) searchInput.value = '';
          this.renderFilters();
          this.renderFeed();
        });
      }
      return;
    }

    // Render as a sleek vertical stream that sits inside the left dock
    this.container.className = 'space-y-3 max-h-[620px] overflow-y-auto pr-2';
    this.container.innerHTML = items.map(item => this.renderCompactItemCard(item)).join('');

    this.attachCardEvents();
  }

  renderCompactItemCard(item) {
    const bldg = CAMPUS_BUILDINGS.find(b => b.id === item.buildingId);
    const bldgName = bldg ? `${bldg.name} (${bldg.code})` : 'Campus Location';
    const isLost = item.type === 'lost';
    const isReunited = item.status === 'reunited';
    const isInVault = item.custody === 'security_locker';
    const priority = item.priority || 'standard';

    const typeBadgeColor = isReunited
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : isLost
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

    const typeLabel = isReunited ? 'REUNITED' : isLost ? 'LOST' : 'FOUND';

    let priorityBadge = '';
    if (priority === 'critical') {
      priorityBadge = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          CRITICAL
        </span>
      `;
    } else if (priority === 'high') {
      priorityBadge = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
          HIGH
        </span>
      `;
    }

    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const rewardBadge = item.rewardBounty > 0 ? `
      <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
        REWARD: \$${item.rewardBounty}
      </span>
    ` : '';

    const vaultBadge = isInVault ? `
      <span class="px-2 py-0.5 rounded-full text-[9px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
        LOCKER: ${item.lockerId || 'VAULT'}
      </span>
    ` : '';

    return `
      <div class="item-card glass-panel hud-box rounded-2xl border border-white/10 hover:border-cyan-500/50 p-4 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(0,240,255,0.15)] flex flex-col sm:flex-row gap-3.5 group" data-id="${item.id}">
        
        <!-- Left Thumbnail Preview -->
        <div class="relative w-full sm:w-28 h-24 rounded-xl bg-slate-950/80 border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
          ${this.renderCardGraphic(item)}
          
          <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] text-slate-300 border border-white/10 font-mono">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${item.color || '#00f0ff'};"></span>
            <span class="truncate max-w-[60px]">${item.colorName || 'Color'}</span>
          </div>

          <button class="btn-inspect-3d absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-bold font-mono" data-preview="${item.previewType || 'laptop'}">
            3D VIEW
          </button>
        </div>

        <!-- Right Content Details -->
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <!-- Badges Bar -->
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border font-mono ${typeBadgeColor}">
                ${typeLabel}
              </span>
              ${priorityBadge}
              ${rewardBadge}
              ${vaultBadge}
              <span class="text-[10px] text-slate-400 font-mono ml-auto">${formattedDate}</span>
            </div>

            <!-- Title -->
            <h4 class="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              ${item.title}
            </h4>

            <!-- Location & Specific Room -->
            <p class="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
              <svg class="w-3 h-3 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="text-slate-300 font-medium truncate">${item.specificLocation || bldgName}</span>
            </p>
          </div>

          <!-- Actions Bar -->
          <div class="flex items-center gap-2 pt-2 border-t border-white/5 mt-2 font-mono">
            <button class="btn-ai-match flex-1 py-1 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all" data-id="${item.id}">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
              <span>AI Match</span>
            </button>

            ${isLost ? `
              <button class="btn-poster flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all" data-id="${item.id}">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Print Flyer</span>
              </button>
            ` : `
              <button class="btn-claim flex-1 py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all" data-id="${item.id}">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Verify Claim</span>
              </button>
            `}
          </div>
        </div>

      </div>
    `;
  }

  renderCardGraphic(item) {
    const type = item.previewType || 'laptop';
    if (type === 'laptop') {
      return `
        <div class="relative w-16 h-12 flex flex-col items-center justify-center">
          <div class="w-14 h-8 rounded-t border border-cyan-400/80 bg-slate-900 shadow-[0_0_8px_rgba(0,240,255,0.3)] flex items-center justify-center">
            <span class="text-cyan-400 text-[8px] font-mono">MACBOOK</span>
          </div>
          <div class="w-16 h-1.5 rounded-b bg-slate-700 border-t border-cyan-400/40"></div>
        </div>
      `;
    }
    if (type === 'earbuds') {
      return `
        <div class="w-10 h-9 rounded-xl border border-purple-400/80 bg-purple-950/40 flex flex-col items-center justify-center">
          <span class="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981] mb-0.5"></span>
          <span class="text-[8px] text-purple-300 font-mono">PODS</span>
        </div>
      `;
    }
    if (type === 'keys') {
      return `
        <div class="w-7 h-7 rounded-full border border-amber-400 bg-transparent flex items-center justify-center">
          <div class="w-2 h-6 rounded-sm bg-amber-400/90 rotate-45 transform translate-x-1 translate-y-1"></div>
        </div>
      `;
    }
    if (type === 'id_card') {
      return `
        <div class="w-14 h-10 rounded border border-sky-400/80 bg-sky-950/50 p-1 flex flex-col justify-between">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-sky-400"></div>
            <div class="w-6 h-0.5 rounded bg-sky-300"></div>
          </div>
          <div class="w-9 h-0.5 rounded bg-sky-400/50"></div>
        </div>
      `;
    }
    return `
      <div class="w-10 h-10 rounded-xl border border-cyan-400/40 bg-cyan-950/20 flex items-center justify-center text-cyan-400">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      </div>
    `;
  }

  attachCardEvents() {
    this.container.querySelectorAll('.btn-inspect-3d').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        audioEngine.playClick();
        const previewType = btn.getAttribute('data-preview');
        if (this.options.onInspect3D) {
          this.options.onInspect3D(previewType);
        }
      });
    });

    this.container.querySelectorAll('.btn-ai-match').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        audioEngine.playScan();
        const itemId = btn.getAttribute('data-id');
        if (this.options.onOpenAIMatch) {
          this.options.onOpenAIMatch(itemId);
        }
      });
    });

    this.container.querySelectorAll('.btn-claim').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        audioEngine.playClick();
        const itemId = btn.getAttribute('data-id');
        if (this.options.onOpenClaim) {
          this.options.onOpenClaim(itemId);
        }
      });
    });

    this.container.querySelectorAll('.btn-poster').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        audioEngine.playClick();
        const itemId = btn.getAttribute('data-id');
        if (this.options.onOpenPoster) {
          this.options.onOpenPoster(itemId);
        }
      });
    });
  }

  getCategoryIcon(iconName) {
    const map = {
      'layers': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      'laptop': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="1" y1="20" x2="23" y2="20"/></svg>',
      'credit-card': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      'key': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-3 3l-6 6a5 5 0 1 1-2-2l6-6m3-3l4 4"/></svg>',
      'backpack': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
      'headphones': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
      'book': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      'glasses': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="14" r="4"/><circle cx="18" cy="14" r="4"/><line x1="10" y1="14" x2="14" y2="14"/><path d="M2 14l2-8M22 14l-2-8"/></svg>',
      'help-circle': '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    return map[iconName] || '<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }
}
