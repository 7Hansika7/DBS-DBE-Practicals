/**
 * BEACON 3D - Printable Lost Item Poster & QR Flyer Generator
 * Creates campus bulletin-ready flyers with high-contrast layout, QR code, and tear-off contact slips.
 */

import { stateManager, CAMPUS_BUILDINGS } from './data.js';
import { audioEngine } from './audioEngine.js';

export class PosterGeneratorController {
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
    this.render();
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    audioEngine.playClick();
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    audioEngine.playClick();
  }

  bindEvents() {
    const closeBtn = document.getElementById('poster-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
  }

  render() {
    const container = document.getElementById('poster-flyer-render');
    if (!container || !this.currentItem) return;

    const item = this.currentItem;
    const bldg = CAMPUS_BUILDINGS.find(b => b.id === item.buildingId);

    container.innerHTML = `
      <div class="printable-flyer bg-white text-black p-8 rounded-lg shadow-2xl max-w-lg mx-auto font-sans relative border-4 border-black">
        <!-- Bold Header -->
        <div class="text-center border-b-4 border-black pb-4 mb-4">
          <h1 class="text-4xl font-black tracking-tight uppercase leading-none">LOST ITEM</h1>
          <p class="text-sm font-bold uppercase tracking-widest text-red-600 mt-1">PLEASE HELP RETURN TO CAMPUS STUDENT</p>
        </div>

        <!-- Reward Banner -->
        ${item.rewardBounty > 0 ? `
          <div class="bg-black text-white text-center py-2 px-4 rounded font-black text-lg uppercase tracking-wider mb-4 font-mono">
            \$${item.rewardBounty} CASH REWARD FOR SAFE RETURN
          </div>
        ` : ''}

        <!-- Item Details -->
        <div class="mb-4">
          <h2 class="text-2xl font-black text-gray-900 leading-tight mb-2">${item.title}</h2>
          <div class="text-sm font-semibold text-gray-700 space-y-1 font-mono">
            <p><strong>Last Seen:</strong> ${item.specificLocation || bldg?.name || 'Campus'}</p>
            <p><strong>Date Lost:</strong> ${new Date(item.date).toLocaleDateString()} at ${new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Category:</strong> ${item.category.toUpperCase()}</p>
          </div>
        </div>

        <!-- Description Box -->
        <div class="p-3 bg-gray-100 rounded border-2 border-dashed border-gray-400 mb-6 text-xs text-gray-800 leading-relaxed font-sans">
          <strong>Key Identifying Marks:</strong><br/>
          ${item.description}
        </div>

        <!-- QR Code & Scan Prompt -->
        <div class="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border-2 border-black mb-6">
          <div class="text-xs">
            <p class="font-black text-sm uppercase">Found this or have info?</p>
            <p class="text-gray-600 mt-0.5">Scan to securely message owner via Eye of Odin Campus Network.</p>
            <p class="font-mono text-[10px] text-cyan-700 mt-1 font-bold">odin-campus.edu/item/${item.id}</p>
          </div>
          <!-- Procedural SVG QR Code -->
          <div class="w-20 h-20 bg-white p-1 border-2 border-black flex-shrink-0 flex items-center justify-center">
            ${this.generateSVGQRCode()}
          </div>
        </div>

        <!-- Perforated Tear-off Slips -->
        <div class="border-t-2 border-dashed border-gray-400 pt-3">
          <p class="text-[10px] text-gray-500 font-mono text-center uppercase tracking-widest mb-2">[ TEAR-OFF CONTACT SLIPS ]</p>
          <div class="grid grid-cols-4 gap-1 text-center font-mono">
            ${Array.from({ length: 4 }).map(() => `
              <div class="border border-gray-300 p-1.5 text-[9px] leading-tight break-words">
                <span class="font-bold block">${item.title.slice(0, 10)}</span>
                <span class="text-gray-600">${item.reporter?.email || 'campus.edu'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-center gap-3">
        <button id="btn-print-poster" class="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all font-mono">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Print Flyer (PDF)</span>
        </button>
      </div>
    `;

    const printBtn = document.getElementById('btn-print-poster');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  generateSVGQRCode() {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full" fill="currentColor">
        <rect x="5" y="5" width="25" height="25" fill="black" />
        <rect x="10" y="10" width="15" height="15" fill="white" />
        <rect x="13" y="13" width="9" height="9" fill="black" />

        <rect x="70" y="5" width="25" height="25" fill="black" />
        <rect x="75" y="10" width="15" height="15" fill="white" />
        <rect x="78" y="13" width="9" height="9" fill="black" />

        <rect x="5" y="70" width="25" height="25" fill="black" />
        <rect x="10" y="75" width="15" height="15" fill="white" />
        <rect x="13" y="78" width="9" height="9" fill="black" />

        <!-- Grid modules -->
        <rect x="35" y="10" width="6" height="6" fill="black" />
        <rect x="45" y="15" width="6" height="6" fill="black" />
        <rect x="55" y="8" width="6" height="6" fill="black" />
        <rect x="38" y="25" width="6" height="6" fill="black" />
        <rect x="50" y="30" width="6" height="6" fill="black" />
        <rect x="15" y="40" width="6" height="6" fill="black" />
        <rect x="30" y="45" width="6" height="6" fill="black" />
        <rect x="42" y="42" width="6" height="6" fill="black" />
        <rect x="60" y="48" width="6" height="6" fill="black" />
        <rect x="75" y="40" width="6" height="6" fill="black" />
        <rect x="85" y="50" width="6" height="6" fill="black" />
        <rect x="40" y="65" width="6" height="6" fill="black" />
        <rect x="52" y="72" width="6" height="6" fill="black" />
        <rect x="68" y="65" width="6" height="6" fill="black" />
        <rect x="80" y="78" width="6" height="6" fill="black" />
      </svg>
    `;
  }
}
