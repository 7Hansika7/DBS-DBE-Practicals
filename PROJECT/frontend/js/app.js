/**
 * EYE OF ODIN - Lost & Found Item Tracker for Campus
 * Master Application Orchestrator
 */

import { stateManager } from './data.js';
import { ThreeSceneManager } from './threeScene.js';
import { audioEngine } from './audioEngine.js';
import { FeedController } from './feedController.js';
import { ReportModalController } from './reportModal.js';
import { ClaimModalController } from './claimModal.js';
import { ChatController } from './chatController.js';
import { CampusMapController } from './campusMap.js';
import { AdminPortalController } from './adminPortal.js';
import { PosterGeneratorController } from './posterGenerator.js';
import { AIModalController } from './aiModal.js';

class EyeOfOdinApp {
  constructor() {
    this.threeScene = null;
    this.feedController = null;
    this.reportModal = null;
    this.claimModal = null;
    this.chatModal = null;
    this.campusMap = null;
    this.adminPortal = null;
    this.posterModal = null;
    this.aiModal = null;
  }

  init() {
    console.log('Initializing EYE OF ODIN - Lost & Found Item Tracker for Campus...');

    // 1. Initialize 3D Engine
    this.threeScene = new ThreeSceneManager('webgl-canvas');
    this.threeScene.init();

    // 2. Initialize Report Modal
    this.reportModal = new ReportModalController('report-modal', {
      onItemCreated: newItem => {
        this.feedController.renderFeed();
        this.campusMap.render();
        this.updateNotificationBadge();
        this.showToast('Item Broadcasted to Eye of Odin!', 'success');
      }
    });
    this.reportModal.init();

    // 3. Initialize Claim Modal
    this.claimModal = new ClaimModalController('claim-modal', {
      onClaimSubmitted: (item, claimData) => {
        this.chatModal.open(item, claimData);
        this.updateNotificationBadge();
        this.showToast('Ownership Claim Sent to Founder', 'info');
      }
    });
    this.claimModal.init();

    // 4. Initialize P2P Chat Modal
    this.chatModal = new ChatController('chat-modal', {
      onReunited: item => {
        this.feedController.renderFeed();
        this.campusMap.render();
        this.adminPortal.render();
        this.updateNotificationBadge();
        this.showToast('Reunited Successfully! Odin Karma Awarded!', 'success');
      }
    });
    this.chatModal.init();

    // 5. Initialize AI Match Modal
    this.aiModal = new AIModalController('ai-modal', {
      onOpenChat: item => this.chatModal.open(item),
      onOpenClaim: itemId => this.claimModal.open(itemId)
    });
    this.aiModal.init();

    // 6. Initialize Poster Modal
    this.posterModal = new PosterGeneratorController('poster-modal');
    this.posterModal.init();

    // 7. Initialize Feed Controller
    this.feedController = new FeedController('items-feed-container', {
      onInspect3D: previewType => {
        this.scrollToSection('section-3d-inspector');
        this.threeScene.loadInspectedItemModel(previewType);
      },
      onOpenAIMatch: itemId => this.aiModal.open(itemId),
      onOpenClaim: itemId => this.claimModal.open(itemId),
      onOpenPoster: itemId => this.posterModal.open(itemId),
      onOpenReportModal: type => this.reportModal.open(type)
    });
    this.feedController.init();

    // 8. Initialize Campus Map Radar
    this.campusMap = new CampusMapController('campus-radar-container', {
      onBuildingSelected: bldgId => {
        this.threeScene.focusBuilding(bldgId);
      },
      onFocus3D: bldgId => {
        this.scrollToSection('section-campus-map');
        this.threeScene.focusBuilding(bldgId);
      },
      onFilterFeed: bldgId => {
        stateManager.activeFilter.buildingId = bldgId;
        const select = document.getElementById('zone-filter-select');
        if (select) select.value = bldgId;
        this.feedController.renderFeed();
        this.scrollToSection('section-live-feed');
      }
    });
    this.campusMap.init();

    // 9. Initialize Admin Moderation Portal
    this.adminPortal = new AdminPortalController('admin-portal-container', {
      onStateChange: () => {
        this.feedController.renderFeed();
        this.campusMap.render();
        this.updateNotificationBadge();
      }
    });
    this.adminPortal.init();

    // 10. Bind Top HUD Controls & Global Event Listeners
    this.bindHUDControls();
    this.setupScrollSpy();
    this.updateNotificationBadge();
  }

  bindHUDControls() {
    // Cinema Mode Toggle (Hides text so user can view full 3D animation!)
    const cinemaBtn = document.getElementById('btn-toggle-cinema');
    if (cinemaBtn) {
      cinemaBtn.addEventListener('click', () => {
        audioEngine.playScan();
        stateManager.cinemaMode = !stateManager.cinemaMode;
        document.body.classList.toggle('cinema-mode-active', stateManager.cinemaMode);

        cinemaBtn.innerHTML = stateManager.cinemaMode
          ? '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>Exit Cinema</span>'
          : '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg><span>Cinema View</span>';

        cinemaBtn.classList.toggle('bg-cyan-500', stateManager.cinemaMode);
        cinemaBtn.classList.toggle('text-black', stateManager.cinemaMode);

        if (stateManager.cinemaMode) {
          this.threeScene.setOrbitMode(true);
          this.showToast('Cinema View Active: Text hidden for full 3D experience. Drag mouse to orbit!', 'info');
        } else {
          this.threeScene.setOrbitMode(stateManager.orbit3DMode);
          this.showToast('Exited Cinema View: Interface restored.', 'info');
        }
      });
    }

    // Odin Pulse Scanwave button
    const pulseBtn = document.getElementById('btn-odin-pulse');
    if (pulseBtn) {
      pulseBtn.addEventListener('click', () => {
        audioEngine.playScan();
        this.threeScene.triggerOdinPulse();
        this.showToast('Odin Spatial Pulse Emitted across campus grid!', 'info');
      });
    }

    // Audio Toggle
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const enabled = audioEngine.toggleSound();
        audioBtn.innerHTML = enabled
          ? '<svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg><span>Sound: ON</span>'
          : '<svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg><span>Sound: OFF</span>';
        audioBtn.classList.toggle('bg-cyan-500/20', enabled);
        audioBtn.classList.toggle('text-cyan-300', enabled);
      });
    }

    // 3D Orbit Mode Toggle
    const orbitBtn = document.getElementById('btn-toggle-orbit');
    if (orbitBtn) {
      orbitBtn.addEventListener('click', () => {
        audioEngine.playClick();
        stateManager.orbit3DMode = !stateManager.orbit3DMode;
        this.threeScene.setOrbitMode(stateManager.orbit3DMode);

        orbitBtn.innerHTML = stateManager.orbit3DMode
          ? '<svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg><span>Free 3D Orbit: ACTIVE</span>'
          : '<svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>3D Camera: AUTO</span>';
        orbitBtn.classList.toggle('bg-cyan-500', stateManager.orbit3DMode);
        orbitBtn.classList.toggle('text-black', stateManager.orbit3DMode);
        this.showToast(stateManager.orbit3DMode ? 'Free 3D Orbit enabled! Drag canvas to rotate.' : 'Auto Scroll 3D Camera resumed.', 'info');
      });
    }

    // Top Action Buttons
    const btnReportLost = document.getElementById('btn-nav-report-lost');
    if (btnReportLost) {
      btnReportLost.addEventListener('click', () => this.reportModal.open('lost'));
    }

    const btnPostFound = document.getElementById('btn-nav-post-found');
    if (btnPostFound) {
      btnPostFound.addEventListener('click', () => this.reportModal.open('found'));
    }

    const btnHeroReportLost = document.getElementById('btn-hero-report-lost');
    if (btnHeroReportLost) {
      btnHeroReportLost.addEventListener('click', () => this.reportModal.open('lost'));
    }

    const btnHeroPostFound = document.getElementById('btn-hero-post-found');
    if (btnHeroPostFound) {
      btnHeroPostFound.addEventListener('click', () => this.reportModal.open('found'));
    }

    // Notifications Dropdown
    const notifBtn = document.getElementById('btn-notifications-toggle');
    const notifDropdown = document.getElementById('notifications-dropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', e => {
        e.stopPropagation();
        audioEngine.playClick();
        notifDropdown.classList.toggle('hidden');
        if (!notifDropdown.classList.contains('hidden')) {
          this.renderNotificationList();
          stateManager.markNotificationsRead();
          this.updateNotificationBadge();
        }
      });

      document.addEventListener('click', () => {
        notifDropdown.classList.add('hidden');
      });
    }

    // 3D Inspector Controls
    const xrayBtn = document.getElementById('btn-toggle-xray');
    if (xrayBtn) {
      xrayBtn.addEventListener('click', () => {
        audioEngine.playScan();
        const active = xrayBtn.classList.toggle('bg-cyan-500');
        xrayBtn.classList.toggle('text-black', active);
        this.threeScene.setInspectorXray(active);
      });
    }

    document.querySelectorAll('.btn-inspect-item-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        audioEngine.playClick();
        const type = btn.getAttribute('data-type');
        this.threeScene.loadInspectedItemModel(type);
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (stateManager.cinemaMode) {
          const cinemaBtn = document.getElementById('btn-toggle-cinema');
          if (cinemaBtn) cinemaBtn.click();
        }
        this.reportModal.close();
        this.claimModal.close();
        this.chatModal.close();
        this.aiModal.close();
        this.posterModal.close();
      }
    });
  }

  setupScrollSpy() {
    const stageDots = document.querySelectorAll('.stage-step-dot');
    const sections = [
      'section-hero',
      'section-live-feed',
      'section-ai-matching',
      'section-campus-map',
      'section-3d-inspector',
      'section-security-vault'
    ];

    stageDots.forEach(dot => {
      dot.addEventListener('click', () => {
        audioEngine.playClick();
        const targetId = dot.getAttribute('data-target');
        this.scrollToSection(targetId);
      });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      sections.forEach((secId, idx) => {
        const el = document.getElementById(secId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            stageDots.forEach(d => d.classList.remove('active-step'));
            if (stageDots[idx]) stageDots[idx].classList.add('active-step');
          }
        }
      });
    }, { passive: true });
  }

  scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notif-unread-badge');
    if (!badge) return;
    const unreadCount = stateManager.notifications.filter(n => n.unread).length;
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  renderNotificationList() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    list.innerHTML = stateManager.notifications.slice(0, 8).map(n => `
      <div class="p-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-xs">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-white truncate">${n.title}</span>
          <span class="text-[10px] text-slate-400">${n.time}</span>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">${n.message}</p>
      </div>
    `).join('');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-panel hud-box border flex items-center gap-3 shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-semibold ${
      type === 'success' ? 'border-emerald-500/50 text-emerald-300' : 'border-cyan-500/50 text-cyan-300'
    }`;
    toast.innerHTML = `
      <span class="flex-shrink-0">${
        type === 'success'
          ? '<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      }</span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 20);

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.odinApp = new EyeOfOdinApp();
  window.odinApp.init();
});
