/**
 * EYE OF ODIN - Lost & Found Item Tracker for Campus
 * State Store & Persistent Database with Priority Levels & Others Category
 */

const STORAGE_KEY = 'EYE_OF_ODIN_CAMPUS_DATA_V2';

export const CAMPUS_BUILDINGS = [
  {
    id: 'bldg-lib',
    name: 'Central Library & Learning Commons',
    code: 'LIB',
    coords: { x: -4, z: -2 },
    area: 'Academic Core',
    securityDesk: '1st Floor Main Entrance Security Desk',
    description: '3-story library with 24/7 quiet study zones, group study pods, and cafe.',
    riskLevel: 'High Activity'
  },
  {
    id: 'bldg-tech',
    name: 'Turing Computer Science & Engineering Hall',
    code: 'ENG',
    coords: { x: 4, z: -3 },
    area: 'North Campus',
    securityDesk: 'Ground Floor Atrium Helpdesk',
    description: 'Hardware labs, lecture halls, computer clusters, and robotics arena.',
    riskLevel: 'High Activity'
  },
  {
    id: 'bldg-union',
    name: 'Student Life Union & Food Pavilion',
    code: 'UNN',
    coords: { x: -3, z: 4 },
    area: 'Central Campus',
    securityDesk: 'Info Desk & Campus Police Sub-Station',
    description: 'Cafeteria, lounge, bookstore, student government offices, and game room.',
    riskLevel: 'Highest Loss Rate'
  },
  {
    id: 'bldg-sci',
    name: 'Franklin Science & Research Complex',
    code: 'SCI',
    coords: { x: 3, z: 3 },
    area: 'South Campus',
    securityDesk: 'Bio-Chem Lobby Reception',
    description: 'Chemistry labs, lecture halls, cleanrooms, and biology greenhouse.',
    riskLevel: 'Moderate Activity'
  },
  {
    id: 'bldg-gym',
    name: 'Pinnacle Athletics & Recreation Center',
    code: 'GYM',
    coords: { x: -6, z: 1 },
    area: 'West Campus',
    securityDesk: 'Front Turnstile Desk & Equipment Checkout',
    description: 'Olympic pool, weight training gym, indoor basketball courts, and locker rooms.',
    riskLevel: 'High Activity'
  },
  {
    id: 'bldg-quad',
    name: 'Memorial Quad & Amphitheater',
    code: 'QUD',
    coords: { x: 0, z: 0 },
    area: 'Central Lawn',
    securityDesk: 'Campus Patrol Bicycle Unit',
    description: 'Outdoor grassy expanse, hammocks, solar charging benches, and walkways.',
    riskLevel: 'Moderate Activity'
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'layers' },
  { id: 'electronics', name: 'Electronics & Laptops', icon: 'laptop' },
  { id: 'ids_cards', name: 'Student IDs & Wallets', icon: 'credit-card' },
  { id: 'keys', name: 'Keys & Keychains', icon: 'key' },
  { id: 'bags', name: 'Backpacks & Bags', icon: 'backpack' },
  { id: 'wearables', name: 'Watches & Audio', icon: 'headphones' },
  { id: 'books', name: 'Books & Course Notes', icon: 'book' },
  { id: 'accessories', name: 'Eyewear & Accessories', icon: 'glasses' },
  { id: 'others', name: 'Others / Unlisted', icon: 'help-circle' }
];

export const INITIAL_ITEMS = [
  {
    id: 'item-lost-1',
    type: 'lost',
    priority: 'critical',
    title: 'Apple MacBook Pro 14" (Space Gray, M2)',
    category: 'electronics',
    customCategory: null,
    description: 'Contains semester thesis code and tomorrow\'s exam materials! Left in Turing Hall 3rd floor robotics lab near workstation #14. Has a distinctive NASA meatball sticker and GitHub octocat decal on the lid.',
    buildingId: 'bldg-tech',
    specificLocation: 'Turing Hall, Room 302 (Robotics Lab)',
    date: '2026-09-14T14:30:00Z',
    status: 'active',
    color: '#383b42',
    colorName: 'Space Gray',
    rewardBounty: 100,
    secretQuestion: 'What color is the protective keyboard silicone skin?',
    secretAnswerHint: 'A vibrant gradient hue',
    tags: ['laptop', 'apple', 'macbook', 'space gray', 'stickers', 'm2', 'thesis'],
    reporter: {
      name: 'Maya Lin',
      role: 'CS Senior',
      email: 'm.lin@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 142,
    hasImage: true,
    previewType: 'laptop'
  },
  {
    id: 'item-found-1',
    type: 'found',
    priority: 'high',
    title: 'AirPods Pro (2nd Gen) in Purple Case',
    category: 'wearables',
    customCategory: null,
    description: 'Found on an armchair in the 2nd floor Student Union quiet lounge. The silicone sleeve has a mini boba tea silicone keychain charm.',
    buildingId: 'bldg-union',
    specificLocation: 'Student Union, 2nd floor fireplace lounge',
    date: '2026-09-15T11:15:00Z',
    status: 'active',
    color: '#8a5cf6',
    colorName: 'Purple Case',
    rewardBounty: 0,
    secretQuestion: 'What engraving is etched on the back of the charging case?',
    secretAnswerHint: 'Two initials and a graduation year',
    tags: ['earbuds', 'apple', 'airpods', 'audio', 'purple', 'boba charm'],
    reporter: {
      name: 'Marcus Vance',
      role: 'Sophomore, Biology',
      email: 'm.vance@campus.edu',
      verified: true
    },
    custody: 'security_locker',
    lockerId: 'Locker C-09',
    viewsCount: 88,
    hasImage: true,
    previewType: 'earbuds'
  },
  {
    id: 'item-lost-2',
    type: 'lost',
    priority: 'high',
    title: 'AirPods Pro Case with Boba Charm',
    category: 'wearables',
    customCategory: null,
    description: 'Lost my wireless earbuds case somewhere between the dining hall and student union lounge. Has my favorite purple silicone sleeve!',
    buildingId: 'bldg-union',
    specificLocation: 'Between Union & Dining',
    date: '2026-09-15T10:45:00Z',
    status: 'active',
    color: '#8a5cf6',
    colorName: 'Lavender Purple',
    rewardBounty: 30,
    secretQuestion: 'What engraving is etched on the case?',
    secretAnswerHint: 'My initials MV26',
    tags: ['earbuds', 'apple', 'airpods', 'audio', 'purple', 'boba charm'],
    reporter: {
      name: 'Elena Rostova',
      role: 'Junior, Psychology',
      email: 'e.rostova@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 195,
    hasImage: true,
    previewType: 'earbuds'
  },
  {
    id: 'item-found-2',
    type: 'found',
    priority: 'critical',
    title: 'Subaru Car Remote Key Fob with Brass Key & Dorm Tag',
    category: 'keys',
    customCategory: null,
    description: 'Turned into Central Library Front Desk. Black car remote with blue Subaru emblem, a brass dorm deadbolt key, and a barcode gym membership tag.',
    buildingId: 'bldg-lib',
    specificLocation: 'Library 1st floor cafe seating booth',
    date: '2026-09-15T09:00:00Z',
    status: 'in_vault',
    color: '#1a1c23',
    colorName: 'Metallic Black & Brass',
    rewardBounty: 0,
    secretQuestion: 'What are the last 3 digits on the plastic gym tag?',
    secretAnswerHint: 'Three digits',
    tags: ['keys', 'car fob', 'subaru', 'brass', 'gym tag', 'keychain'],
    reporter: {
      name: 'Officer Daniels',
      role: 'Campus Security',
      email: 'security@campus.edu',
      verified: true
    },
    custody: 'security_locker',
    lockerId: 'Locker A-04',
    viewsCount: 64,
    hasImage: true,
    previewType: 'keys'
  },
  {
    id: 'item-lost-3',
    type: 'lost',
    priority: 'high',
    title: 'North Face Surge Backpack (Forest Green)',
    category: 'bags',
    customCategory: null,
    description: 'Heavy forest green backpack containing Organic Chemistry binder, iPad Air in blue smart folio, and prescription glasses in hard case.',
    buildingId: 'bldg-sci',
    specificLocation: 'Franklin Science Hall, Auditorium 101 row F',
    date: '2026-09-14T17:10:00Z',
    status: 'active',
    color: '#1f4d36',
    colorName: 'Forest Green',
    rewardBounty: 50,
    secretQuestion: 'What textbook is inside the main zippered pocket?',
    secretAnswerHint: 'Author or subject',
    tags: ['backpack', 'north face', 'green', 'ipad', 'chemistry', 'bag'],
    reporter: {
      name: 'David Kalu',
      role: 'Pre-Med Junior',
      email: 'd.kalu@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 112,
    hasImage: true,
    previewType: 'backpack'
  },
  {
    id: 'item-found-3',
    type: 'found',
    priority: 'high',
    title: 'Official Campus Student ID Card & RFID Lanyard',
    category: 'ids_cards',
    customCategory: null,
    description: 'Official student card issued to "Julian Chen". Found near the Memorial Quad solar charging bench. Handed over to Campus Info Desk.',
    buildingId: 'bldg-quad',
    specificLocation: 'Quad walkway near solar canopy',
    date: '2026-09-15T12:30:00Z',
    status: 'in_vault',
    color: '#0284c7',
    colorName: 'University Blue Lanyard',
    rewardBounty: 0,
    secretQuestion: 'What is the student ID number suffix?',
    secretAnswerHint: 'Last 4 digits',
    tags: ['student id', 'rfid', 'badge', 'lanyard', 'card', 'id'],
    reporter: {
      name: 'Sarah Jenkins',
      role: 'Freshman, Arts',
      email: 's.jenkins@campus.edu',
      verified: true
    },
    custody: 'security_locker',
    lockerId: 'Locker D-02',
    viewsCount: 45,
    hasImage: true,
    previewType: 'id_card'
  },
  {
    id: 'item-lost-4',
    type: 'lost',
    priority: 'critical',
    title: 'Prescription Inhaler & Epinephrine Auto-Injector in Black Pouch',
    category: 'others',
    customCategory: 'Medical & Health Essentials',
    description: 'Urgent medical emergency item. Lost near the athletic fieldhouse or gym locker room. Zippered black pouch with red cross tag.',
    buildingId: 'bldg-gym',
    specificLocation: 'Pinnacle Gym Track / Bleachers',
    date: '2026-09-15T15:20:00Z',
    status: 'active',
    color: '#ef4444',
    colorName: 'Red Cross on Black',
    rewardBounty: 60,
    secretQuestion: 'What prescription medicine name is on the pharmacy label?',
    secretAnswerHint: 'Name of the patient or asthma medication',
    tags: ['medical', 'inhaler', 'epipen', 'health', 'urgent', 'prescriptions'],
    reporter: {
      name: 'Chloe Bennett',
      role: 'Sophomore, Kinesiology',
      email: 'c.bennett@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 220,
    hasImage: true,
    previewType: 'box'
  },
  {
    id: 'item-found-4',
    type: 'found',
    priority: 'standard',
    title: 'Hydro Flask 32oz (Pacific Blue with Stickers)',
    category: 'accessories',
    customCategory: null,
    description: 'Stainless steel insulated bottle with climbing stickers (Patagonia, Yosemite) and a small dent on the bottom rim. Found on the bleachers.',
    buildingId: 'bldg-gym',
    specificLocation: 'Athletics Center, Court 2 bleachers',
    date: '2026-09-15T13:40:00Z',
    status: 'active',
    color: '#0284c7',
    colorName: 'Pacific Blue',
    rewardBounty: 0,
    secretQuestion: 'What brand of stickers are on the side opposite the logo?',
    secretAnswerHint: 'National park or outdoor brand',
    tags: ['bottle', 'hydroflask', 'blue', 'stickers', 'water bottle'],
    reporter: {
      name: 'Coach Miller',
      role: 'Athletics Staff',
      email: 'j.miller@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 73,
    hasImage: true,
    previewType: 'bottle'
  },
  {
    id: 'item-reunited-1',
    type: 'lost',
    priority: 'high',
    title: 'Sony WH-1000XM5 Noise-Canceling Headphones',
    category: 'wearables',
    customCategory: null,
    description: 'Black over-ear headphones in zipper travel case. Reunited within 45 minutes thanks to EYE OF ODIN neural vision matching!',
    buildingId: 'bldg-lib',
    specificLocation: 'Library Quiet Zone 3rd Floor',
    date: '2026-09-13T16:00:00Z',
    status: 'reunited',
    color: '#111827',
    colorName: 'Midnight Black',
    rewardBounty: 40,
    secretQuestion: 'What color is the aux cable inside the travel pouch?',
    secretAnswerHint: 'Gold-plated black braided cable',
    tags: ['headphones', 'sony', 'xm5', 'audio', 'black', 'bluetooth'],
    reporter: {
      name: 'Liam Zhang',
      role: 'Graduate Researcher',
      email: 'l.zhang@campus.edu',
      verified: true
    },
    custody: 'self',
    viewsCount: 310,
    hasImage: true,
    previewType: 'headphones',
    reunitedDate: '2026-09-13T16:45:00Z',
    reunitedBy: 'Hannah Lee'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'ODIN AI Match Identified (97%)',
    message: '97% Match between your Lost AirPods report and a Found AirPods post in the Student Union!',
    type: 'match',
    time: '5m ago',
    unread: true,
    itemId: 'item-lost-2',
    matchedItemId: 'item-found-1'
  },
  {
    id: 'notif-2',
    title: 'CRITICAL PRIORITY Alert Broadcasted',
    message: 'Prescription Medical Inhaler pouch reported lost near Pinnacle Gym Track.',
    type: 'critical',
    time: '12m ago',
    unread: true,
    itemId: 'item-lost-4'
  },
  {
    id: 'notif-3',
    title: 'Custody Secured in Campus Vault',
    message: 'Found Subaru Key Fob is now safely secured in Security Locker A-04 at Central Library.',
    type: 'vault',
    time: '45m ago',
    unread: true,
    itemId: 'item-found-2'
  }
];

export const SAMARITANS_LEADERBOARD = [
  { rank: 1, name: 'Hannah Lee', badge: 'Odin Guardian Tier III', returns: 9, karma: 1420, avatar: 'HL' },
  { rank: 2, name: 'Officer Daniels', badge: 'Security Master Chief', returns: 7, karma: 1180, avatar: 'OD' },
  { rank: 3, name: 'Julian Vance', badge: 'All-Seeing Finder', returns: 5, karma: 890, avatar: 'JV' },
  { rank: 4, name: 'Sarah Jenkins', badge: 'Campus Good Samaritan', returns: 4, karma: 640, avatar: 'SJ' },
  { rank: 5, name: 'Alex Rivera', badge: 'Vigilant Scout', returns: 3, karma: 480, avatar: 'AR' }
];

export class StateManager {
  constructor() {
    this.items = [];
    this.notifications = [];
    this.leaderboard = [];
    this.activeFilter = {
      type: 'all',
      category: 'all',
      buildingId: 'all',
      search: '',
      status: 'all',
      priority: 'all' // 'all' | 'critical' | 'high' | 'standard'
    };
    this.currentViewMode = 'grid';
    this.isAdmin = false;
    this.audioEnabled = false;
    this.orbit3DMode = false;
    this.cinemaMode = false;
    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.items = parsed.items || INITIAL_ITEMS;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.leaderboard = parsed.leaderboard || SAMARITANS_LEADERBOARD;
        return;
      }
    } catch (e) {
      console.warn('LocalStorage load error, using initial dataset', e);
    }
    this.items = [...INITIAL_ITEMS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.leaderboard = [...SAMARITANS_LEADERBOARD];
    this.save();
  }

  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: this.items,
          notifications: this.notifications,
          leaderboard: this.leaderboard
        })
      );
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
  }

  resetToDefaults() {
    this.items = [...INITIAL_ITEMS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.leaderboard = [...SAMARITANS_LEADERBOARD];
    this.save();
  }

  addItem(itemData) {
    const newItem = {
      id: 'item-' + Date.now(),
      date: new Date().toISOString(),
      status: 'active',
      priority: itemData.priority || 'standard',
      viewsCount: 1,
      ...itemData
    };
    this.items.unshift(newItem);
    this.save();

    this.addNotification({
      title: newItem.priority === 'critical' ? 'CRITICAL ALERT Item Logged' : newItem.type === 'lost' ? 'New Lost Item Broadcasted' : 'New Found Item Logged',
      message: `"${newItem.title}" has been registered in the Eye of Odin campus network.`,
      type: newItem.priority === 'critical' ? 'critical' : newItem.type,
      itemId: newItem.id
    });

    return newItem;
  }

  updateItemStatus(itemId, newStatus, extra = {}) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.status = newStatus;
      Object.assign(item, extra);
      this.save();
    }
    return item;
  }

  assignLocker(itemId, lockerId) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.custody = 'security_locker';
      item.lockerId = lockerId;
      item.status = 'in_vault';
      this.save();
      this.addNotification({
        title: 'Item Transferred to Campus Vault',
        message: `"${item.title}" is now held under Campus Security Custody in ${lockerId}.`,
        type: 'vault',
        itemId: item.id
      });
    }
    return item;
  }

  addNotification(notif) {
    const newNotif = {
      id: 'notif-' + Date.now(),
      time: 'Just now',
      unread: true,
      ...notif
    };
    this.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationsRead() {
    this.notifications.forEach(n => (n.unread = false));
    this.save();
  }

  getFilteredItems() {
    return this.items.filter(item => {
      if (this.activeFilter.type !== 'all' && item.type !== this.activeFilter.type) {
        return false;
      }
      if (this.activeFilter.category !== 'all' && item.category !== this.activeFilter.category) {
        return false;
      }
      if (this.activeFilter.priority !== 'all' && item.priority !== this.activeFilter.priority) {
        return false;
      }
      if (this.activeFilter.buildingId !== 'all' && item.buildingId !== this.activeFilter.buildingId) {
        return false;
      }
      if (this.activeFilter.status !== 'all') {
        if (this.activeFilter.status === 'in_vault' && item.custody !== 'security_locker') return false;
        if (this.activeFilter.status !== 'in_vault' && item.status !== this.activeFilter.status) return false;
      }
      if (this.activeFilter.search) {
        const query = this.activeFilter.search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
        const matchLoc = item.specificLocation && item.specificLocation.toLowerCase().includes(query);
        const matchCustomCat = item.customCategory && item.customCategory.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchTags && !matchLoc && !matchCustomCat) {
          return false;
        }
      }
      return true;
    });
  }

  getStats() {
    const totalLost = this.items.filter(i => i.type === 'lost').length;
    const totalFound = this.items.filter(i => i.type === 'found').length;
    const totalReunited = this.items.filter(i => i.status === 'reunited').length;
    const inVault = this.items.filter(i => i.custody === 'security_locker').length;
    const criticalCount = this.items.filter(i => i.priority === 'critical' && i.status !== 'reunited').length;
    const totalActive = this.items.filter(i => i.status === 'active').length;
    const totalValuationEstimate = (totalLost + totalFound + totalReunited) * 185;
    const rate = totalReunited + totalFound > 0 ? Math.round((totalReunited / (totalLost || 1)) * 100) : 84;

    return {
      totalLost,
      totalFound,
      totalReunited,
      inVault,
      criticalCount,
      totalActive,
      totalValuationEstimate,
      reunionRate: Math.min(rate, 96)
    };
  }
}

export const stateManager = new StateManager();
