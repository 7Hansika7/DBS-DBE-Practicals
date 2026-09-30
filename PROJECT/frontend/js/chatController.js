/**
 * BEACON 3D - P2P Secure Chat & Safe Hand-off Coordinator
 * Facilitates direct messaging between owner and finder, safe location suggestions, and verified item release.
 */

import { stateManager } from './data.js';
import { audioEngine } from './audioEngine.js';

export class ChatController {
  constructor(modalId, options = {}) {
    this.modal = document.getElementById(modalId);
    this.options = options;
    this.currentItem = null;
    this.claimData = null;
    this.messages = [];
  }

  init() {
    this.bindEvents();
  }

  open(item, claimData = null) {
    this.currentItem = item;
    this.claimData = claimData;

    // Seed conversation
    this.messages = [
      {
        sender: 'system',
        text: `[SECURE CHANNEL] Hand-off Channel initiated for "${item.title}". Campus Security recommends meeting at an official illuminated desk.`,
        time: 'Just now'
      }
    ];

    if (claimData) {
      this.messages.push({
        sender: 'claimant',
        name: claimData.claimantName || 'Claimant',
        text: `Hi! I filed a claim for this item. Verification response: "${claimData.answer}". ${claimData.proof ? `Additional proof: ${claimData.proof}` : ''}`,
        time: 'Just now'
      });

      // Automated simulated response from founder
      setTimeout(() => {
        this.addMessage({
          sender: 'founder',
          name: item.reporter?.name || 'Finder',
          text: `Hello ${claimData.claimantName}! That matches the distinguishing features perfectly. Let's arrange a safe hand-off on campus!`,
          time: 'Just now'
        });
        audioEngine.playAlert();
      }, 1200);
    } else {
      this.messages.push({
        sender: 'founder',
        name: item.reporter?.name || 'Finder',
        text: `Hi! I have the ${item.title}. Where would you like to meet to verify and pick it up?`,
        time: 'Just now'
      });
    }

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
    const closeBtn = document.getElementById('chat-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
  }

  render() {
    const header = document.getElementById('chat-modal-header');
    const messagesBox = document.getElementById('chat-messages-box');
    const inputArea = document.getElementById('chat-input-area');

    if (!this.currentItem) return;
    const item = this.currentItem;

    if (header) {
      header.innerHTML = `
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>${item.reporter?.name || 'Finder'}</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h4>
              <p class="text-xs text-slate-400">Coordination for: <strong class="text-slate-200">${item.title}</strong></p>
            </div>
          </div>
          ${item.status !== 'reunited' ? `
            <button id="chat-verify-release-btn" class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 font-mono">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Handover Complete</span>
            </button>
          ` : `
            <span class="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 font-mono">
              REUNITED
            </span>
          `}
        </div>
      `;

      const releaseBtn = document.getElementById('chat-verify-release-btn');
      if (releaseBtn) {
        releaseBtn.addEventListener('click', () => this.handleReunitedComplete());
      }
    }

    this.renderMessages();

    if (inputArea) {
      inputArea.innerHTML = `
        <!-- Safe Campus Meetup Presets -->
        <div class="p-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-300 font-mono">
          <span class="text-cyan-400 whitespace-nowrap font-medium flex items-center gap-1">
            <svg class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Suggest Spot:
          </span>
          <button class="btn-spot px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 whitespace-nowrap border border-white/10" data-spot="Central Library 1st Floor Security Desk">
            Library Security Desk
          </button>
          <button class="btn-spot px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 whitespace-nowrap border border-white/10" data-spot="Student Union Main Info Booth">
            Student Union Info Booth
          </button>
          <button class="btn-spot px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 whitespace-nowrap border border-white/10" data-spot="Campus Police Sub-Station">
            Campus Police Station
          </button>
        </div>

        <!-- Chat Input Form -->
        <form id="chat-send-form" class="p-3 flex items-center gap-2">
          <input id="chat-text-input" type="text" placeholder="Type a message or meetup detail..." class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors" />
          <button type="submit" class="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1">
            <span>Send</span>
          </button>
        </form>
      `;

      inputArea.querySelectorAll('.btn-spot').forEach(btn => {
        btn.addEventListener('click', () => {
          const spot = btn.getAttribute('data-spot');
          this.addMessage({
            sender: 'claimant',
            name: 'Jordan Hayes',
            text: `Can we meet at ${spot}?`,
            time: 'Just now'
          });
          audioEngine.playClick();

          setTimeout(() => {
            this.addMessage({
              sender: 'founder',
              name: this.currentItem.reporter?.name || 'Finder',
              text: `Sounds great! I will head to ${spot} with the item. See you there!`,
              time: 'Just now'
            });
            audioEngine.playAlert();
          }, 1000);
        });
      });

      const form = document.getElementById('chat-send-form');
      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          const input = document.getElementById('chat-text-input');
          if (!input || !input.value.trim()) return;

          this.addMessage({
            sender: 'claimant',
            name: 'Jordan Hayes',
            text: input.value.trim(),
            time: 'Just now'
          });
          audioEngine.playClick();
          input.value = '';
        });
      }
    }
  }

  addMessage(msg) {
    this.messages.push(msg);
    this.renderMessages();
  }

  renderMessages() {
    const box = document.getElementById('chat-messages-box');
    if (!box) return;

    box.innerHTML = this.messages.map(m => {
      if (m.sender === 'system') {
        return `
          <div class="text-center my-3">
            <span class="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
              ${m.text}
            </span>
          </div>
        `;
      }

      const isClaimant = m.sender === 'claimant';
      return `
        <div class="flex flex-col ${isClaimant ? 'items-end' : 'items-start'} my-2">
          <span class="text-[10px] text-slate-400 mb-1 px-1">${m.name || (isClaimant ? 'You' : 'Finder')} • ${m.time}</span>
          <div class="max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isClaimant ? 'bg-cyan-500 text-black font-medium rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/10'}">
            ${m.text}
          </div>
        </div>
      `;
    }).join('');

    box.scrollTop = box.scrollHeight;
  }

  handleReunitedComplete() {
    if (!this.currentItem) return;

    audioEngine.playChime();
    stateManager.updateItemStatus(this.currentItem.id, 'reunited', {
      reunitedDate: new Date().toISOString(),
      reunitedBy: 'Jordan Hayes'
    });

    stateManager.addNotification({
      title: 'Item Successfully Reunited!',
      message: `"${this.currentItem.title}" was verified and safely handed back to the owner!`,
      type: 'success',
      itemId: this.currentItem.id
    });

    this.addMessage({
      sender: 'system',
      text: `Handover confirmed! Item status marked as REUNITED. Karma points awarded to finder!`,
      time: 'Just now'
    });

    this.render();

    if (this.options.onReunited) {
      this.options.onReunited(this.currentItem);
    }
  }
}
