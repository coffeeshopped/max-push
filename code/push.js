
class Push {

  static initTextRow = "                                                                    "
  
  listenerCounter = 0
  listeners = []
  
  midiOutListener = null
  
  constructor() {
    this.initText()
    this.clearPads()  
  }
    
  initText() {
    this.textRows = [
      Push.initTextRow, Push.initTextRow, Push.initTextRow, Push.initTextRow
    ]
    this.displayTextRow(0)
    this.displayTextRow(1)
    this.displayTextRow(2)
    this.displayTextRow(3)
  }
  
  clearPads() {
    for (var i=36; i<100; ++i) {
      this.#midiOut([0x90, i, 0])
    }
  }
  
  displayText(row, slot, text) {
    var newRow = this.textRows[row]
    var padded = text
    if (text.length > 8) {
      padded = text.slice(0,8)
    }
    else if (text.length < 8) {
      var space = "        "
      padded = text + space.slice(0, 8 - text.length)
    }
    var slotStart = slot * 8 + Math.ceil(slot / 2.0)
    newRow = newRow.slice(0, slotStart) + padded + newRow.slice(slotStart + 8)
    this.textRows[row] = newRow
    this.displayTextRow(row)
  }
  
  displayTextRow(row) {
    var bytes = [240, 71, 127, 21, row + 24, 0, 69, 0]
    for (var i=0; i<68; ++i) {
      bytes.push(this.textRows[row].charCodeAt(i))
    }
    bytes.push(247)
    this.#midiOut(bytes)
  }
  
  displayButton(button, state) {
    this.#midiOut([0xb0, button, state])
  }
  
  displayPad(row, col, state) {
    var pad = Push.noteForPad(row, col)
    this.#midiOut([0x90, pad, state])
  }
  
  
  #midiOut(bytes) {
    if (this.midiOutListener) {
      this.midiOutListener(bytes)
    }
  }
  
  // add a listener. Return an index for later removal
  addListener(listener) {
    this.listeners.push(listener)
    var i = this.listenerCounter
    this.listenerCounter += 1
    return i
  }
  
  removeListener(i) {
    this.listeners[i] = null
  }
  
  ccIn(ctrl, value) {  
    var event = false
  
    if ((ctrl >= 0x47 && ctrl <= 0x4f) || (ctrl == 0x0e) || (ctrl == 0x0f)) {
      // if it's one of the knobs...
      event = [Push.Event.TURN, ctrl, value < 64 ? value : -128 + value]
    }
    else {
      // assume it's a button push
      event = [Push.Event.BUTTON, ctrl, value > 0]
    }
    
    this.#processEvent(event)
  }
  
  noteIn(pitch, velo) {
    var event = false
    
    if (pitch < 0x0b) {
      event = [Push.Event.TOUCH, pitch, velo > 0]
    }
    else {
      event = [Push.Event.PAD, pitch, velo]
    }
    
    this.#processEvent(event)
  }
  
  #processEvent(event) {
    for (var i=0; i<this.listeners.length; ++i) {
      if (this.listeners[i]) {
        this.listeners[i](event)
      }
    }
  }

  static Knob = {
    CLICK: 0x0e, 
    SMALL: 0x0f,
    BIG_0: 71,
    BIG_1: 72,
    BIG_2: 73,
    BIG_3: 74,
    BIG_4: 75,
    BIG_5: 76,
    BIG_6: 77,
    BIG_7: 78,
    BIG_8: 79,
  }
  
  static Event = {
    TURN: 0,
    PAD: 1,
    PAD_AFTER: 2,
    TOUCH: 3,
    BUTTON: 4,
  }
  
  static Button = {
    TAP_TEMPO: 3,
    METRONOME: 9,
    
    REP_1_4: 0x24,
    REP_1_4T: 0x25,
    REP_1_8: 0x26,
    REP_1_8T: 0x27,
    REP_1_16: 0x28,
    REP_1_16T: 0x29,
    REP_1_32: 0x2a,
    REP_1_32T: 0x2b,
    
    LEFT: 0x2c,
    RIGHT: 0x2d,
    UP: 0x2e,
    DOWN: 0x2f,
    
    SELECT: 0x30,
    SHIFT: 0x31,
    NOTE: 0x32,
    SESSION: 0x33,
    ADD_EFFECT: 0x34,
    ADD_TRACK: 0x35,
    OCTAVE_DOWN: 0x36,
    OCTAVE_UP: 0x37,
    REPEAT: 0x38,
    ACCENT: 0x39,
    SCALES: 0x3a,
    USER: 0x3b,
    MUTE: 0x3c,
    SOLO: 0x3d,
    IN: 0x3e,
    OUT: 0x3f,
    
    PLAY: 0x55,
    RECORD: 0x56,
    NEW: 0x57,
    DUPLICATE: 0x58,
    AUTOMATION: 0x59,
    FIXED_LENGTH: 0x5a,
    
    DEVICE: 0x6e,
    BROWSE: 0x6f,
    TRACK: 0x70,
    CLIP: 0x71,
    VOLUME: 0x72,
    PAN_SEND: 0x73,
    
    QUANTIZE: 0x74,
    DOUBLE: 0x75,
    DELETE: 0x76,
    UNDO: 0x77,
    
    ROW_0_0: 0x14,
    ROW_0_1: 0x15,
    ROW_0_2: 0x16,
    ROW_0_3: 0x17,
    ROW_0_4: 0x18,
    ROW_0_5: 0x19,
    ROW_0_6: 0x1a,
    ROW_0_7: 0x1b,
    
    MASTER: 0x1c,
    STOP: 0x1d,
  
    ROW_1_0: 0x66,
    ROW_1_1: 0x67,
    ROW_1_2: 0x68,
    ROW_1_3: 0x69,
    ROW_1_4: 0x6a,
    ROW_1_5: 0x6b,
    ROW_1_6: 0x6c,
    ROW_1_7: 0x6d,
    
  }
  
  static BState = {
    OFF: 0,
    DIM: 1,
    DIM_SLOW: 2,
    DIM_FAST: 3,
    ON: 4,
    ON_SLOW: 5,
    ON_FAST: 6
  }
  
  static noteForPad(row, col) {
    return 36 + col + ((7 - row) * 8)
  }
  
  static PState = {
    off: 0,
    on: 9,
  }
  
}





module.exports = Push