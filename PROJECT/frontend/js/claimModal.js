/**
 * BEACON 3D - Claim Verification & Ownership Challenge Modal
 * Handles secure claim filing, proof of ownership challenges, and transition to safe P2P chat.
 */

import { stateManager } from './data.js';
import { audioEngine } from './audioEngine.js';

export class ClaimModalController {
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
    const closeBtn = document.getElementById('claim-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
  }

  render() {
    const content = document.getElementById('claim-modal-content');
    if (!content || !this.currentItem) return;

    const item = this.currentItem;

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Item Summary Banner -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-mono text-cyan-400 uppercase tracking-wide">Filing Ownership Claim</span>
            <h4 class="text-sm font-bold text-white truncate">${item.title}</h4>
            <p class="text-[11px] text-slate-400 truncate">Found at: ${item.specificLocation || 'Campus'}</p>
          </div>
        </div>

        <!-- Ownership Challenge Box -->
        <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-indigo-400">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <h5 class="text-xs font-bold text-indigo-200">Owner Verification Challenge</h5>
          </div>
          <p class="text-xs text-slate-300 font-medium mb-1">
            "${item.secretQuestion || 'Please describe any identifying markings, serial number, or stickers on this item.'}"
          </p>
          ${item.secretAnswerHint ? `
            <p class="text-[11px] text-slate-400 italic">Hint: ${item.secretAnswerHint}</p>
          ` : ''}
        </div>

        <!-- Claim Form Inputs -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Your Answer to Challenge *</label>
            <input id="claim-answer-input" type="text" placeholder="Be as precise as possible..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors" required />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Additional Proof / Details (Optional)</label>
            <textarea id="claim-proof-input" rows="2" placeholder="Mention serial number, purchase receipt date, wallpaper, or unique scuffs..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
              <input id="claim-name-input" type="text" value="Jordan Hayes" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Student Email *</label>
              <input id="claim-email-input" type="email" value="j.hayes@campus.edu" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
        </div>

        <!-- Submit Claim Button -->
        <button id="claim-submit-btn" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-2 font-mono">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Submit Claim & Open Secure Chat</span>
        </button>
      </div>
    `;

    const submitBtn = document.getElementById('claim-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitClaim());
    }
  }

  submitClaim() {
    const answerInput = document.getElementById('claim-answer-input');
    const proofInput = document.getElementById('claim-proof-input');
    const nameInput = document.getElementById('claim-name-input');
    const emailInput = document.getElementById('claim-email-input');

    if (!answerInput || !answerInput.value.trim()) {
      alert('Please provide an answer to the verification question.');
      return;
    }

    audioEngine.playChime();

    // Add notification
    stateManager.addNotification({
      title: 'Claim Submitted for Verification',
      message: `Your ownership claim on "${this.currentItem.title}" is being reviewed by the finder.`,
      type: 'claim',
      itemId: this.currentItem.id
    });

    const currentItemCopy = this.currentItem;
    const answerValue = answerInput.value.trim();

    this.close();

    // Trigger P2P Chat transition
    if (this.options.onClaimSubmitted) {
      this.options.onClaimSubmitted(currentItemCopy, {
        answer: answerValue,
        proof: proofInput?.value.trim() || '',
        claimantName: nameInput?.value || 'Jordan Hayes',
        claimantEmail: emailInput?.value || 'j.hayes@campus.edu'
      });
    }
  }
}
