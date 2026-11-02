// What earlier versions left in localStorage, for the publish check (not published).
// When a version changes how things are kept, add what it leaves here, and a scenario in run.js.
window.FIXTURES = {
  // 1.3: emoji pictures, photos as data URLs under photo:<id> (filled in by run.js), a recording the phone has lost
  '1.3': {
    items: [
      { id: 'a1', name: '食パン', emoji: '🍞', unit: '袋', group: 'food', sizes: ['6枚切り', '8枚切り'], note: '', photo: true, count: 3, lastAt: 1790000000000 },
      { id: 'a2', name: 'たまご', emoji: '🥚', unit: 'パック', group: 'food', sizes: [], note: '', photo: true, count: 5, lastAt: 1790000000000 },
      { id: 'a3', name: 'おにぎり', emoji: '🍙', unit: '個', group: 'food', sizes: [], note: '', photo: false, count: 0, lastAt: 0 },
      { id: 'a4', name: '牛乳', emoji: '🥛', unit: '本', group: 'drink', sizes: ['1L', '500ml'], note: '', photo: false, count: 2, lastAt: 1790000000000 },
      { id: 'a5', name: 'ティッシュ', emoji: '🤧', unit: '箱', group: 'daily', sizes: [], note: '', photo: false, count: 1, lastAt: 1790000000000 },
    ],
    photos: ['a1', 'a2'],
    cart: { lines: { a2: 1 }, extras: [{ id: 'v1', voice: true, sec: 3 }, { id: 't1', text: 'しょうが' }], when: '' },
    history: 1,
    settings: { size: 'm', send: 'line', theme: 'light', to: '' },
  },
  // 1.6 to 1.9: Lucide pictures, a sent list or three (the newest with a size picked), family settings, the backup record
  '1.8': {
    items: [
      { id: 'b1', name: '食パン', icon: 'sandwich', emoji: '🍞', unit: '袋', group: 'food', sizes: ['6枚切り', '8枚切り'], note: '', photo: false, count: 4, lastAt: 1790000000000 },
      { id: 'b2', name: 'たまご', icon: 'egg', emoji: '🥚', unit: 'パック', group: 'food', sizes: [], note: 'Mサイズ', photo: false, count: 6, lastAt: 1790000000000 },
      { id: 'b3', name: 'トマト', icon: '', emoji: '', unit: '個', group: 'food', sizes: [], note: '', photo: false, count: 1, lastAt: 1790000000000 },
      { id: 'b4', name: 'お茶', icon: 'coffee', emoji: '🍵', unit: '本', group: 'drink', sizes: [], note: '', photo: false, count: 2, lastAt: 1790000000000 },
      { id: 'b5', name: 'ごみ袋', icon: 'trash-2', emoji: '🗑️', unit: '袋', group: 'daily', sizes: [], note: '', photo: false, count: 1, lastAt: 1790000000000 },
      { id: 'b6', name: '電池', icon: 'battery-full', emoji: '🔋', unit: 'パック', group: 'other', sizes: [], note: '', photo: false, count: 0, lastAt: 0 },
    ],
    photos: [],
    cart: { lines: { b2: 1, 'b1|6枚切り': 1 }, extras: [{ id: 't1', text: 'しょうゆ' }], when: 'こんど来るとき' },
    history: 3,
    histSized: [{ id: 'b1', name: '食パン', size: '8枚切り', unit: '袋', qty: 2 }],
    settings: { size: 'l', send: 'line', theme: 'light', to: 'ゆうこ', lock: false, keep: 'three' },
    backup: { at: 1790000000000, changes: 2, dl: [1790000000000] },
    ver: '1.8',
  },
};
