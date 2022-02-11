/**
 * @name TinySprite for WASM-4
 * @author Mr.Rafael
 * @license MIT
 * @version 0.0.3
 *
 * ================================
 * Contents:
 * ================================
 * >> class Vec2             [100%]
 * >> class Viewport         [100%]
 * >> class Font             [100%]
 * >> class Tilemap          [100%]
 * >> class Canvas           [100%]
 *  | let canvas
 * >> class GamepadButton    [100%]
 * >> class Gamepad          [100%]
 *  | let p1
 *  | let p2
 *  | let p3
 *  | let p4
 * >> class Frame            [100%]
 * >> class Spritesheet      [ 75%]
 * >> class Hitbox           [100%]
 * >> class Sprite           [ 75%]
 * >> class Scene            [ 50%]
 * ================================
 * Import lines:
 * ================================
 * >> import {TINYSPRITE_VERSION, SCREEN_WIDTH, SCREEN_HEIGHT, Vec2, Viewport, Font, Tilemap, Canvas, canvas, GamepadButton, Gamepad, p1, p2, p3, p4, Frame, Spritesheet, Hitbox, Sprite, Scene} from "./tinysprite";
 * >> import * as Tiny from "./tinysprite";
 * ================================
 */

// WASM-4.
import * as w4 from "./wasm4";

/** Versão da TinySprite. */
export const TINYSPRITE_VERSION: string = "0.0.3";

/** Largura da tela do WASM-4. */
export const SCREEN_WIDTH: i32 = 160;

/** Altura da tela do WASM-4. */
export const SCREEN_HEIGHT: i32 = 160;

// ==========================================================================
// vec2.ts
// ==========================================================================
/**
 * @class Vec2
 *
 * @description
 * Classe utilitária usada apenas para representar uma coordenada 2D na tela.
 */
export class Vec2 {
  /** Posição X. */
  x: i32;

  /** Posição Y. */
  y: i32;

  /**
   * @constructor
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   */
  constructor(x: i32, y: i32) {
    this.x = x;
    this.y = y;
  }
}

// ==========================================================================
// viewport.ts
// ==========================================================================
/**
 * @class Viewport
 *
 * @description
 * Representa uma área de tela. Também pode ser usada como uma câmera.
 */
export class Viewport {
  /** Posição X. */
  x: i32;

  /** Posição Y. */
  y: i32;

  /** Largura. */
  width: i32;

  /** Altura. */
  height: i32;

  /**
   * @constructor
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   */
  constructor(x: i32, y: i32, width: i32, height: i32) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
  }

  /**
   * Retorna a posição superior-esquerda da tela (X e Y).
   *
   * @return {Vec2}
   */
  topLeft(): Vec2 {
    return new Vec2(
      this.x,
      this.y
    );
  }

  /**
   * Retorna a posição superior-central da tela (X e Y).
   *
   * @return {Vec2}
   */
  topCenter(): Vec2 {
    return new Vec2(
      this.x + (Math.floor(this.width / 2) as i32) - 1,
      this.y
    );
  }

  /**
   * Retorna a posição superior-direita da tela (X e Y).
   *
   * @return {Vec2}
   */
  topRight(): Vec2 {
    return new Vec2(
      this.x + (this.width - 1),
      this.y
    );
  }

  /**
   * Retorna a posição centro-esquerda da tela (X e Y).
   *
   * @return {Vec2}
   */
  centerLeft(): Vec2 {
    return new Vec2(
      this.x,
      this.y + (Math.floor(this.height / 2) as i32) - 1
    );
  }

  /**
   * Retorna a posição central da tela (X e Y).
   *
   * @return {Vec2}
   */
  center(): Vec2 {
    return new Vec2(
      this.x + (Math.floor(this.width  / 2) as i32) - 1,
      this.y + (Math.floor(this.height / 2) as i32) - 1
    );
  }

  /**
   * Retorna a posição centro-direita da tela (X e Y).
   *
   * @return {Vec2}
   */
  centerRight(): Vec2 {
    return new Vec2(
      this.x + (this.width - 1),
      this.y + (Math.floor(this.height / 2) as i32) - 1
    );
  }

  /**
   * Retorna a posição inferior-esquerda da tela (X e Y).
   *
   * @return {Vec2}
   */
  bottomLeft(): Vec2 {
    return new Vec2(
      this.y,
      this.y + (this.height - 1)
    );
  }

  /**
   * Retorna a posição inferior-central da tela (X e Y).
   *
   * @return {Vec2}
   */
  bottomCenter(): Vec2 {
    return new Vec2(
      this.x + (Math.floor(this.width  / 2) as i32) - 1,
      this.y + (this.height - 1)
    );
  }

  /**
   * Retorna a posição inferior-direita da tela (X e Y).
   *
   * @return {Vec2}
   */
  bottomRight(): Vec2 {
    return new Vec2(
      this.x + (this.width  - 1),
      this.y + (this.height - 1)
    );
  }
}

// ==========================================================================
// font.ts
// ==========================================================================
/**
 * @class Font
 *
 * @description
 * Representa uma fonte personalizada, feita a partir de uma folha de sprites.
 */
export class Font {
  /** Folha de sprites. */
  spritesheet: Spritesheet;

  /** Charset com todos os caracteres a serem usados. */
  charset: string;

  /** Índice do quadro de animação do primeiro caractere. */
  start: i32;

  /** Espaçamento horizontal entre cada caractere. */
  paddingX: i32;

  /** Espaçamento vertical entre cada caractere. */
  paddingY: i32;

  /**
   * @constructor
   *
   * @param {Spritesheet} Folha de sprites.
   * @param {string} charset Charset com todos os caracteres a serem usados.
   * @param {i32} start Índice do quadro de animação do primeiro caractere.
   * @param {i32} paddingX Espaçamento horizontal entre cada caractere.
   * @param {i32} paddingY Espaçamento vertical entre cada caractere.
   */
  constructor(spritesheet: Spritesheet, charset: string, start: i32, paddingX: i32, paddingY: i32) {
    this.spritesheet = spritesheet;
    this.charset     = charset;
    this.start       = start;
    this.paddingX    = paddingX;
    this.paddingY    = paddingY;
  }

  /**
   * Escreve um texto personalizado.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {string} text Texto a ser escrito.
   * @param {u16} colors Ordem de cores da paleta.
   */
  write(x: i32, y: i32, text: string, colors: u16): boolean {
    return this.spritesheet.write(x, y, text, this.charset, this.start, this.paddingX, this.paddingY, colors);
  }
}

// ==========================================================================
// tilemap.ts
// ==========================================================================
/**
 * @class Tilemap
 *
 * @description
 * Representa um mapa 2D. Pode ser usado para representar fases e cenários.
 */
export class Tilemap {
  /** Largura dos tiles. */
  width: i32;

  /** Altura dos tiles. */
  height: i32;

  /** Tilemap (Array 2D). */
  map: i16[][];

  /**
   * @constructor
   *
   * @param {Spritesheet} Folha de sprites.
   * @param {i32} width Largura dos tiles.
   * @param {i32} height Altura dos tiles.
   * @param {i16[][]} map Tilemap (Array 2D).
   */
  constructor(width: i32, height: i32, map: i16[][]) {
    this.width = width;
    this.height = height;
    this.map = map;
  }

  /**
   * Define um tile na posição especificada (em grade).
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i16} index Índice do tile.
   *
   * @return {boolean}
   */
  setTile(x: i32, y: i32, index: i16): boolean {
    // Não seguir adiante quando uma das posições passadas ultrapassar os
    // limites de linhas do tilemap...
    if(y < 0 || y >= this.map.length) {
      return false;
    }

    // Linha de tiles.
    let row: i16[] = this.map[y];

    // Não seguir adiante quando uma das posições passadas ultrapassar os
    // limites de colunas do tilemap...
    if(x < 0 || x >= row.length) {
      return false;
    }

    row[x] = index;
    return true;
  }

  /**
   * Obtém um tile na posição especificada (em grade).
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @return {i16}
   */
  getTile(x: i32, y: i32): i16 {
    // Não seguir adiante quando uma das posições passadas ultrapassar os
    // limites de linhas do tilemap...
    if(y < 0 || y >= this.map.length) {
      return -1;
    }

    // Linha de tiles.
    let row: i16[] = this.map[y];

    // Não seguir adiante quando uma das posições passadas ultrapassar os
    // limites de colunas do tilemap...
    if(x < 0 || x >= row.length) {
      return -1;
    }

    return row[x];
  }

  /**
   * Desenha o tilemap.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {Spritesheet} spritesheet Folha de sprites.
   * @param {u16} colors Ordem de cores da paleta.
   */
  tile(x: i32, y: i32, spritesheet: Spritesheet, colors: u16): boolean {
    return spritesheet.tile(x, y, this.map, colors);
  }
}

// ==========================================================================
// canvas.ts
// ==========================================================================
/**
 * @class Canvas
 *
 * @description
 * Abstração de funções de desenho do WASM-4.
 */
export class Canvas {
  /** Área de desenho. */
  view: Viewport;

  /** Paleta de cores. */
  palette: i32[];

  /** Quando "true", mantém a tela "suja". */
  preserveFrameBuffer: boolean;

  /** Quando "true", esconde os botões da versão mobile. */
  hideGamepadOverlay: boolean;

  /**
   * @constructor
   *
   * @param {Viewport} Área de desenho.
   * @param {Vec2} camera Câmera.
   */
  constructor() {
    this.view = new Viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.palette = [
      0xe0f8cf,
      0x86c06c,
      0x306850,
      0x071821
    ];
    this.preserveFrameBuffer = false;
    this.hideGamepadOverlay  = false;
  }

  /**
   * Atualiza a paleta de cores.
   *
   * @return {boolean}
   */
  updatePalette(): boolean {
    // Não atualizar a paleta quando não houver a quantidade mínima de cores:
    if(this.palette.length < 4) {
      return false;
    }

    // Atualizar paleta de cores...
    store<u32>(w4.PALETTE, this.palette[0] as u32, 0 * sizeof<u32>());
    store<u32>(w4.PALETTE, this.palette[1] as u32, 1 * sizeof<u32>());
    store<u32>(w4.PALETTE, this.palette[2] as u32, 2 * sizeof<u32>());
    store<u32>(w4.PALETTE, this.palette[3] as u32, 3 * sizeof<u32>());

    return true;
  }

  /**
   * Atualiza as flags.
   *
   * @return {boolean}
   */
  updateSystemFlags(): boolean {
    // Valores das flags.
    let bitA: i32 = this.hideGamepadOverlay?  2: 0;
    let bitB: i32 = this.preserveFrameBuffer? 1: 0;

    // Atualizar flags...
    store<u8>(w4.SYSTEM_FLAGS, bitA + bitB);
    return true;
  }

  /**
   * Retorna se uma instância está visível na tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   *
   * @return {boolean}
   */
  isVisible(x: i32, y: i32, width: i32, height: i32): boolean {
    return (
      this.viewX(x)          < SCREEN_WIDTH  &&
      this.viewX(x + width)  > 0             &&
      this.viewY(y)          < SCREEN_HEIGHT &&
      this.viewY(y + height) > 0
    );
  }

  /**
   * Calcula uma posição X relativa à área de desenho.
   *
   * @param {i32} x Posição X.
   *
   * @return {i32}
   */
  viewX(x: i32): i32 {
    return x - this.view.x;
  }

  /**
   * Calcula uma posição Y relativa à área de desenho.
   *
   * @param {i32} x Posição X.
   *
   * @return {i32}
   */
  viewY(y: i32): i32 {
    return y - this.view.y;
  }

  /**
   * Desenha uma imagem na tela.
   *
   * @param {usize} image Imagem de referência.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   * @param {u16} colors Ordem de cores da paleta.
   * @param {u32} flags Flags de desenho da imagem de referência.
   */
  blit(image: usize, x: i32, y: i32, width: i32, height: i32, colors: u16, flags: u32): boolean {
    // Não desenhar fora da tela...
    if(!this.isVisible(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar imagem...
    w4.blit(
      image,
      this.viewX(x),
      this.viewY(y),
      width as u32,
      height as u32,
      flags
    );

    return true;
  }

  /**
   * Desenha um fragmento de uma imagem na tela.
   *
   * @param {usize} image Imagem de referência.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   * @param {i32} cutX Posição X de corte.
   * @param {u16} cutY Posição Y de corte.
   * @param {u16} stride Use a largura da imagem de referência.
   * @param {u16} colors Ordem de cores da paleta.
   * @param {u32} flags Flags de desenho da imagem de referência.
   */
  blitSub(image: usize, x: i32, y: i32, width: i32, height: i32, cutX: i32, cutY: i32, stride: i32, colors: u16, flags: u32): boolean {
    // Não desenhar fora da tela...
    if(!this.isVisible(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar imagem...
    w4.blitSub(
      image,
      this.viewX(x),
      this.viewY(y),
      width as u32,
      height as u32,
      cutX as u32,
      cutY as u32,
      stride,
      flags
    );

    return true;
  }

  /**
   * Desenha uma linha na tela.
   *
   * @param {i32} x1 Posição X inicial.
   * @param {i32} y1 Posição Y inicial.
   * @param {i32} x2 Posição X final.
   * @param {i32} y2 Posição Y final.
   * @param {u16} colors Ordem de cores da paleta.
   */
  line(x1: i32, y1: i32, x2: i32, y2: i32, colors: u16): boolean {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.line(
      this.viewX(x1),
      this.viewY(y1),
      this.viewX(x2),
      this.viewY(y2)
    );

    return true;
  }

  /**
   * Desenha uma linha horizontal na tela.
   *
   * @param {i32} x Posição X inicial.
   * @param {i32} y Posição Y inicial.
   * @param {i32} length Tamanho da linha.
   * @param {u16} colors Ordem de cores da paleta.
   */
  hline(x: i32, y: i32, length: i32, colors: u16): boolean {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.hline(
      this.viewX(x),
      this.viewY(y),
      length
    );

    return true;
  }

  /**
   * Desenha uma linha vertical na tela.
   *
   * @param {i32} x Posição X inicial.
   * @param {i32} y Posição Y inicial.
   * @param {i32} length Tamanho da linha.
   * @param {u16} colors Ordem de cores da paleta.
   */
  vline(x: i32, y: i32, length: i32, colors: u16): boolean {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.vline(
      this.viewX(x),
      this.viewY(y),
      length
    );

    return true;
  }

  /**
   * Desenha um círculo na tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   * @param {u16} colors Ordem de cores da paleta.
   */
  oval(x: i32, y: i32, width: i32, height: i32, colors: u16): boolean {
    // Não desenhar fora da tela...
    if(!this.isVisible(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar círculo...
    w4.oval(
      this.viewX(x),
      this.viewY(y),
      width,
      height
    );

    return true;
  }

  /**
   * Desenha um retângulo na tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   * @param {u16} colors Ordem de cores da paleta.
   */
  rect(x: i32, y: i32, width: i32, height: i32, colors: u16): boolean {
    // Não desenhar fora da tela...
    if(!this.isVisible(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar retângulo...
    w4.rect(
      this.viewX(x),
      this.viewY(y),
      width,
      height
    );

    return true;
  }

  /**
   * Escreve um texto na tela usando a fonte padrão.
   *
   * @param {string} text Texto a ser escrito.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {u16} colors Ordem de cores da paleta.
   *
   * @return {boolean}
   */
  text(text: string, x: i32, y: i32, colors: u16): boolean {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Escrever texto (com fonte padrão)...
    w4.text(text, x, y);

    return true;
  }
}

/** Canvas principal. */
export let canvas: Canvas = new Canvas();

// ==========================================================================
// gamepad_button.ts
// ==========================================================================
/** Identificador do jogador 1. */
const GAMEPAD_P1: u8 = 0;

/** Identificador do jogador 2. */
const GAMEPAD_P2: u8 = 1;

/** Identificador do jogador 3. */
const GAMEPAD_P3: u8 = 2;

/** Indicador do jogador 4. */
const GAMEPAD_P4: u8 = 3;

/** Estado de controle inerte. */
const GAMEPAD_STATE_IDLE: u8 = 0;

/** Estado de controle recém-pressionado. */
const GAMEPAD_STATE_PRESSED: u8 = 1;

/** Estado de controle mantido. */
const GAMEPAD_STATE_HELD: u8 = 2;

/** Estado de controle recém-solto. */
const GAMEPAD_STATE_RELEASED: u8 = 3;

/**
 * @class GamepadButton
 *
 * @description
 * Representa um dos botões de controle. Útil para obter eventos rápidos, como
 * checar se foi pressionado ou não.
 */
export class GamepadButton {
  /** Estado de botão. */
  state: u8;

  /**
   * @constructor
   */
  constructor() {
    this.state = 0;
  }

  /**
   * Avança para o próximo estado de botão, a partir de uma situação atual.
   *
   * @param {boolean} pressed Indica se o botão de entrada está pressionado.
   *
   * @return {u8}
   */
  nextState(pressed: boolean): u8 {
    // Ciclo de estados quando o botão estiver pressionado.
    let whenPressed: u8[] = [
      GAMEPAD_STATE_PRESSED, // Quando inerte.
      GAMEPAD_STATE_HELD,    // Quando recém-pressionado.
      GAMEPAD_STATE_HELD,    // Quando mantido.
      GAMEPAD_STATE_PRESSED  // Quando recém-solto.
    ];

    // Ciclo de estados quando o botão estiver solto.
    let whenReleased: u8[] = [
      GAMEPAD_STATE_IDLE,     // Quando inerte.
      GAMEPAD_STATE_RELEASED, // Quando recém-pressionado.
      GAMEPAD_STATE_RELEASED, // Quando mantido.
      GAMEPAD_STATE_IDLE      // Quando recém-solto.
    ];

    if(pressed) {
      this.state = whenPressed[this.state];
    }
    else {
      this.state = whenReleased[this.state];
    }

    return this.state;
  }

  /**
   * Indica se este botão está inerte.
   *
   * @return {boolean}
   */
  idle(): boolean {
    return this.state === GAMEPAD_STATE_IDLE;
  }

  /**
   * Indica se este botão está recém-pressionado.
   *
   * @return {boolean}
   */
  pressed(): boolean {
    return this.state === GAMEPAD_STATE_PRESSED;
  }

  /**
   * Indica se este botão está mantido.
   *
   * @return {boolean}
   */
  held(): boolean {
    return this.state === GAMEPAD_STATE_HELD;
  }

  /**
   * Indica se este botão está solto.
   *
   * @return {boolean}
   */
  released(): boolean {
    return this.sate === GAMEPAD_STATE_RELEASED;
  }
}

// ==========================================================================
// gamepad.ts
// ==========================================================================
/**
 * @class Gamepad
 *
 * @description
 * Representa um controle de jogador.
 */
export class Gamepad {
  /** Número do jogador. */
  player: u8;

  /** Botão para cima. */
  up: GamepadButton;

  /** Botão para baixo. */
  down: GamepadButton;

  /** Botáo para esquerda. */
  left: GamepadButton;

  /** Botáo para direita. */
  right: GamepadButton;

  /** Botáo 1 (tecla Z). */
  b1: GamepadButton;

  /** Botáo 2 (tecla X). */
  b2: GamepadButton;

  /**
   * @constructor
   *
   * @param {usize} input Porta de referência.
   */
  constructor(player: u8) {
    this.player = player;
    this.up    = new GamepadButton();
    this.down  = new GamepadButton();
    this.left  = new GamepadButton();
    this.right = new GamepadButton();
    this.b1    = new GamepadButton();
    this.b2    = new GamepadButton();
  }

  /**
   * Retorna a entrada de referência do jogador deste controle.
   *
   * @return {usize}
   */
  gamepad(): usize {
    // Porta do jogador 1...
    if(this.player === GAMEPAD_P1) {
      return load<u8>(w4.GAMEPAD1);
    }
    // Porta do jogador 2...
    else if(this.player === GAMEPAD_P2) {
      return load<u8>(w4.GAMEPAD2);
    }
    // Porta do jogador 3...
    else if(this.player === GAMEPAD_P3) {
      return load<u8>(w4.GAMEPAD3);
    }
    // Porta do jogador 4...
    else {
      return load<u8>(w4.GAMEPAD4);
    }
  }

  /**
   * Atualiza todos os estados de tecla.
   */
  update(): void {
    let gamepad: usize = this.gamepad();

    this.up.nextState(gamepad & w4.BUTTON_UP? true: false);
    this.down.nextState(gamepad & w4.BUTTON_DOWN? true: false);
    this.left.nextState(gamepad & w4.BUTTON_LEFT? true: false);
    this.right.nextState(gamepad & w4.BUTTON_RIGHT? true: false);
    this.b1.nextState(gamepad & w4.BUTTON_1? true: false);
    this.b2.nextState(gamepad & w4.BUTTON_2? true: false);
  }
}

/** Controles do jogador 1. */
export let p1: Gamepad = new Gamepad(GAMEPAD_P1);

/** Controles do jogador 2. */
export let p2: Gamepad = new Gamepad(GAMEPAD_P2);

/** Controles do jogador 3. */
export let p3: Gamepad = new Gamepad(GAMEPAD_P3);

/** Controles do jogador 4. */
export let p4: Gamepad = new Gamepad(GAMEPAD_P4);
// ==========================================================================
// frame.ts
// ==========================================================================
/**
 * @class Frame
 *
 * @description
 * Representa um quadro de animação usado em uma folha de sprites.
 */
export class Frame {
  /** Posição X. */
  x: i32;

  /** Posição Y. */
  y: i32;

  /** Largura. */
  width: i32;

  /** Altura. */
  height: i32;

  /**
   * @constructor
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   */
  constructor(x: i32, y: i32, width: i32, height: i32) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
  }
}

// ==========================================================================
// spritesheet.ts
// ==========================================================================
/**
 * @class Spritesheet
 *
 * @description
 * Representa uma folha de sprites. Contém vários quadros de animação.
 */
export class Spritesheet {
  /** Imagem de referência. */
  image: usize;

  /** Flags de desenho da imagem de referência. */
  flags: u32;

  /** Largura da imagem. */
  imageWidth: i32;

  /** Altura da imagem.  */
  imageHeight: i32;

  /** Largura dos quadros de animação. */
  width: i32;

  /** Altura dos quadros de animação. */
  height: i32;

  /** Total de quadros por linha. */
  rows: i32;

  /** Total de quadros por coluna. */
  columns: i32;

  /** Quadros de animação. */
  frames: Frame[];

  /**
   * @constructor
   *
   * @param {usize} image Imagem de referência.
   * @param {u32} flags Flags de desenho da imagem de referência.
   * @param {i32} imageWidth Largura da imagem.
   * @param {i32} imageHeight Altura da imagem.
   * @param {i32} width Largura dos quadros de animação.
   * @param {i32} height Altura dos quadros de animação.
   */
  constructor(image: usize, flags: u32, imageWidth: i32, imageHeight: i32, width: i32, height: i32) {
    this.image       = image;
    this.flags       = flags;
    this.imageWidth  = imageWidth;
    this.imageHeight = imageHeight;
    this.width       = width;
    this.height      = height;
    this.rows        = Math.floor(imageHeight / height) as i32;
    this.columns     = Math.floor(imageWidth / width) as i32;
    this.frames      = [];

    // Criar quadros de animação dinamicamente...
    for(let row: i32 = 0; row < this.rows; row += 1) {
      for(let column: i32 = 0; column < this.columns; column += 1) {

        this.frames.push(
          new Frame(column * width, row * height, width, height)
        );

      }
    }
  }

  /**
   * Desenha um quadro de animação.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} index Índice do quadro de animação.
   * @param {boolean} flipX Inverte este quadro horizontalmente.
   * @param {boolean} flipY Inverte este quadro verticalmente.
   * @param {i32} rotation Ângulo de rotação (de 0º a 360º).
   * @param {u16} colors Ordem de cores da paleta.
   */
  draw(x: i32, y: i32, index: i32, flipX: boolean, flipY: boolean, rotation: i32, colors: u16): boolean {
    // Não desenhar a imagem, caso o índice não exista:
    if(index < 0 || index >= this.frames.length) {
      return false;
    }

    // Índice de rotação, alinhado em 90º.
    let rotationIndex: i32 = (Math.floor(Math.abs(rotation) / 90) as i32) % 4;

    // Ajustar rotação para ângulos negativos...
    if(rotation < 0) {
      rotationIndex = (4 - rotationIndex) % 4;
    }

    // Look-Up Table de rotações (original).
    // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
    let rotations: u32[] = [
      this.flags,
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE,
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y,
      this.flags | w4.BLIT_ROTATE
    ];

    // Look-Up Table de rotações (X invertido).
    // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
    let rotationsFX: u32[] = [
      this.flags | w4.BLIT_FLIP_X,
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE,
      this.flags | w4.BLIT_FLIP_Y,
      this.flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE
    ];

    // Look-Up Table de rotações (Y invertido).
    // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
    let rotationsFY: u32[] = [
      this.flags | w4.BLIT_FLIP_Y,
      this.flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE,
      this.flags | w4.BLIT_FLIP_X,
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE
    ];

    // Look-Up Table de rotações (X e Y invertidos).
    // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
    let rotationsFXY: u32[] = [
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y,
      this.flags | w4.BLIT_ROTATE,
      this.flags,
      this.flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE
    ];

    // Flags de desenho.
    let flags: u32 = 0;

    // Escolher flags especiais de rotação...
         if(flipX && flipY) { flags = rotationsFXY[rotationIndex]; }
    else if(flipX)          { flags = rotationsFX[rotationIndex];  }
    else if(flipY)          { flags = rotationsFY[rotationIndex];  }
    else                    { flags = rotations[rotationIndex];    }

    // Quadro de animação.
    let frame: Frame = this.frames[index];

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar imagem...
    canvas.blitSub(
      this.image,
      x,
      y,
      frame.width as u32,
      frame.height as u32,
      frame.x as u32,
      frame.y as u32,
      this.imageWidth,
      colors,
      flags
    );

    return true;
  }

  /**
   * Escreve um texto na tela, usando os quadros de animação como acaracteres.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {string} text Texto a ser escrito.
   * @param {string} charset Charset com todos os caracteres a serem usados.
   * @param {i32} paddingX Espaçamento horizontal entre cada caractere.
   * @param {i32} paddingY Espaçamento vertical entre cada caractere.
   * @param {i32} start Índice do quadro de animação do primeiro caractere.
   * @param {u16} colors Ordem de cores da paleta.
   */
  write(x: i32, y: i32, text: string, charset: string, start: i32, paddingX: i32, paddingY: i32, colors: u16): boolean {
    // Contadores de linhas e colunas.
    let line  : i32 = 0;
    let column: i32 = 0;

    // Caracteres especiais: "\n" (newline) e " " (space).
    let newline: i32 = 10;
    let space  : i32 = 32;

    // Percorrer caracteres do texto...
    for(let index: i32 = 0; index < text.length; index += 1) {
      let char    : string = text[index];
      let charCode: i32    = char.charCodeAt(0);

      // Avançar para a próxima linha ao encontrar um "\n" (newline)...
      if(charCode === newline) {
        line  += 1;
        column = 0;
        continue;
      }
      // Avançar para a próxima coluna ao encontrar um " " (space)...
      else if(charCode === space) {
        column += 1;
        continue;
      }

      // Índice do caractere no charset.
      let index: i32 = charset.indexOf(char);

      // Se o caractere não existir no charset, ou o índice ultrapassar o
      // total de quadros de animação existentes nesta folha de sprites, ele
      // será ignorado e tratado como um " " (space)...
      if(index < 0 || index >= this.frames.length) {
        column += 1;
        continue;
      }

      // Ajustar índice do caractere para obter o índice do quadro de animação
      // equivalente ao do caractere...
      index += start;

      // Quadro de animação equivalente ao do caractere.
      let frame: Frame = this.frames[index];

      // Desenhar caractere...
      this.draw(
        x + (column * (frame.width  + paddingX)),
        y + (line   * (frame.height + paddingY)),
        index,
        colors
      );

      // Avançar uma coluna...
      column += 1;
    }

    return true;
  }

  /**
   * Desenha um tilemap na tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i16[][]} tilemap Tilemap (Array 2D).
   * @param {u16} colors Ordem de cores da paleta.
   */
  tile(x: i32, y: i32, tilemap: i16[][], colors: u16): boolean {
    // Percorrer linhas do tilemap...
    for(let row: i32 = 0; row < tilemap.length; row += 1) {
      let line: i16[] = tilemap[row];

      // Calcular posição vertical de desenho na viewport.
      let viewY: i32 = canvas.viewY(y + (row * this.height));

      // Quando menor que zero, saltar para a próxima linha...
      if(viewY < -this.height) {
        continue;
      }
      // Quando maior que a altura da tela, encerrar iteração...
      if(viewY >= 160) {
        break;
      }

      // Percorrer colunas do tilemap...
      for(let column: i32 = 0; column < line.length; column += 1) {
        let index: i32 = line[column] as i32;

        // Calcular posição horizontal de desenho na viewport.
        let viewX: i32 = canvas.viewX(x + (column * this.width));

        // Quando menor que zero, saltar para a próxima coluna...
        if(viewX < -this.width) {
          continue;
        }
        // Quando maior que a largura da tela, encerrar iteração...
        if(viewX >= 160) {
          break;
        }

        // Se o índice do tile ultrapassar o total de quadros de animação
        // existentes nesta folha de sprites, ele será ignorado...
        if(index < 0 || index >= this.frames.length) {
          column += 1;
          continue;
        }

        // Quadro de animação equivalente ao do caractere.
        let frame: Frame = this.frames[index];

        // Desenhar caractere...
        this.draw(
          x + (column * frame.width),
          y + (row * frame.height),
          index,
          false,
          false,
          0,
          colors
        );
      }

    }

    return true;
  }
}

// ==========================================================================
// hitbox.ts
// ==========================================================================
/**
 * @class Hitbox
 *
 * @description
 * Representa um retângulo usado apra detecção de colisão.
 */
export class Hitbox {
  /** Posição esquerda. */
  left: i32;

  /** Posição superior. */
  top: i32;

  /** Posição direita. */
  right: i32;

  /** Posição inferior. */
  bottom: i32;

  /**
   * @constructor
   *
   * @param {i32} left Posição esquerda.
   * @param {i32} top Posição superior.
   * @param {i32} right Posição direita.
   * @param {i32} bottom Posição inferior.
   */
  constructor(left: i32, top: i32, right: i32, bottom: i32) {
    this.left   = left;
    this.top    = top;
    this.right  = right;
    this.bottom = bottom;
  }
}

// ==========================================================================
// sprite.ts
// ==========================================================================
/**
 * @class Sprite
 *
 * @description
 * Classe de sprite genérica.
 */
export class Sprite {
  /** Tag. */
  tag: string;

  /** Posição X. */
  x: i32;

  /** Posição Y. */
  y: i32;

  /** Largura do sprite. */
  width: i32;

  /** Altura do sprite. */
  height: i32;

  /** Caixa de colisão. */
  hitbox: Hitbox;

  /** Indica se o evento de criação já foi acionado. */
  _created: boolean;

  /** Indica se o evento de destruição já foi acionado. */
  _destroyed: boolean;

  /**
   * @constructor
   *
   * @param {i32} width Largura do sprite.
   * @param {i32} height Altura do sprite.
   */
  constructor(width: i32, height: i32) {
    this.tag = "Sprite";
    this.x = 0;
    this.y = 0;
    this.width  = width;
    this.height = height;
    this.hitbox = new Hitbox(0, 0, width, height);
    this._created = false;
    this._destroyed = false;
  }

  /**
   * Calcula e retorna o posicionamento central deste sprite.
   *
   * @return {Vec2}
   */
  center(): Vec2 {
    return new Vec2(
      this.x + (Math.floor(this.width  / 2) as i32),
      this.y + (Math.floor(this.height / 2) as i32)
    );
  }

  /**
   * Calcula e retorna o posicionamento equivalente deste sprite em uma grade.
   *
   * @param {i32} width Largura dos tiles.
   * @param {i32} height Altura dos tiles.
   *
   * @return {Vec2}
   */
  grid(width: i32, height: i32): Vec2 {
    // Posição central deste sprite.
    let center: Vec2 = this.center();

    return new Vec2(
      Math.floor(center.x /  width) as i32,
      Math.floor(center.y / height) as i32
    );
  }

  /**
   * Movimenta este sprite em um ângulo específico.
   *
   * @param {i32} speed Velocidade de movimentação.
   * @param {i32} angle Ângulo (de 0º a 359º).
   *
   * @return {Sprite} Tail call.
   */
  moveToAngle(angle: f64, speed: f64): Sprite {
    // Ângulo radiano.
    let degree: f64 = Math.PI / 180.0;

    // Movimentar sprite...
    this.x += (speed * Math.cos(angle * degree)) as i32;
    this.y += (speed * Math.sin(angle * degree)) as i32;

    return this;
  }

  /**
   * Movimenta este sprite até uma posição específica.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} speed Velocidade de movimentação.
   *
   * @return {Sprite} Tail call.
   */
  moveTo(x: i32, y: i32, speed: f64): Sprite {
    // Ângulo radiano + rotação:
    let degree  : f64 = Math.PI / 180.0;
    let rotateTo: f64 = Math.atan2(y - this.y, x - this.x) * degree;

    // Movimentar sprite...
    this.x += speed * (Math.cos(rotateTo / degree)) as i32;
    this.y += speed * (Math.sin(rotateTo / degree)) as i32;

    return this;
  }

  /**
   * Checa a intersecção entre dois sprites.
   *
   * @param {Sprite} sprite Sprite a ser checado.
   *
   * @return {boolean}
   */
  intersect(sprite: Sprite): bool {
    return (
      this.x + this.hitbox.left   < sprite.x + sprite.hitbox.right  &&
      this.x + this.hitbox.right  > sprite.x + sprite.hitbox.left   &&
      this.y + this.hitbox.top    < sprite.y + sprite.hitbox.bottom &&
      this.y + this.hitbox.bottom > sprite.y + sprite.hitbox.top
    );
  }

  /**
   * Checa a intersecção entre múltiplos sprites.
   *
   * @param {Sprite[]} sprites Sprites a serem checados.
   *
   * @return {Sprite[]} Sprites colididos (vazio quando não há colisões).
   */
  intersectArray(sprites: Sprite[]): Sprite[] {
    // Resultados.
    let results: Sprite[] = [];

    // Percorrer lista de spriets...
    for(let index: i32 = 0; index < sprites.length; index += 1) {
      let sprite: Sprite = sprites[i];

      // Checagem de colisão.
      let collision: boolean = this.intersect(sprite);

      // Mover sprite para os resultados, caso exista colisão:
      if(collision) {
        results.push(sprite);
      }
    }

    return results;
  }

  /**
   * Checa a intersecção entre dois sprites, em uma posição arbitrária.
   *
   * @param {Sprite} sprite Sprite a ser checado.
   * @param {i32} x X Posição X.
   * @param {i32} y Y Posição Y.
   *
   * @return {boolean}
   */
  intersectAt(sprite: Sprite, x: i32, y: i32): boolean {
    // Salvar posição atual deste sprite temporariamente...
    let xprev: i32 = this.x;
    let yprev: i32 = this.y;

    // Mover este sprite para uma posição arbitrária...
    this.x = x;
    this.y = y;

    // Checar colisão com o outro sprite:
    let result: boolean = this.intersect(sprite);

    // Mover sprite de volta à sua posição original...
    this.x = xprev;
    this.y = yprev;

    return result;
  }

  /**
   * Checa a intersecção entre múltiplos sprites, em uma posição arbitrária.
   *
   * @param {Sprite[]} sprites Sprites a serem checados.
   * @param {i32} x X Posição X.
   * @param {i32} y Y Posição Y.
   *
   * @return {Sprite[]} Sprites colididos (vazio quando não há colisões).
   */
  intersectAtArray(sprites: Sprite[], x: i32, y: i32): Sprite[] {
    // Resultados.
    let results: Sprite[] = [];

    // Percorrer lista de spriets...
    for(let index: i32 = 0; index < sprites.length; index += 1) {
      let sprite: Sprite = sprites[i];

      // Checagem de colisão.
      let collision: boolean = this.intersectAt(sprite, x, y);

      // Mover sprite para os resultados, caso exista colisão:
      if(collision) {
        results.push(sprite);
      }
    }

    return results;
  }

  /**
   * Checa a intersecção entre um sprite e um tilemap.
   *
   * @param {Tilemap} tilemap Tilemap.
   * @param {i16[]} tiles Índices do tilemap a serem checados.
   *
   * @return {boolean}
   */
  intersectTiles(tilemap: Tilemap, tiles: i16[]): boolean {
    // Posição equivalente deste sprite na grade.
    let grid: Vec2 = this.grid(tilemap.width, tilemap.height);

    // Percorrer tiles de colisão...
    for(let index: i32 = 0; index < tiles.length; index += 1) {
      let tile: i16 = tiles[index];

      // Se um dos índices de colisão estiverem na mesma posição equivalente
      // deste sprite na grade, então existe colisão:
      if(tilemap.getTile(grid.x, grid.y) === tile) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checa a intersecção entre um sprite e um tilemap, em uma posição
   * arbitrária.
   *
   * @param {Tilemap} tilemap Tilemap.
   * @param {i16[]} tiles Índices do tilemap a serem checados.
   * @param {i32} x X Posição X.
   * @param {i32} y Y Posição Y.
   *
   * @return {boolean}
   */
  intersectTilesAt(tilemap: Tilemap, tiles: i16[], x: i32, y: i32): boolean {
    // Salvar posição atual deste sprite temporariamente...
    let xprev: i32 = this.x;
    let yprev: i32 = this.y;

    // Mover este sprite para uma posição arbitrária...
    this.x = x;
    this.y = y;

    // Checar colisão com os tiles:
    let result: boolean = this.intersectTiles(tilemap, tiles);

    // Mover sprite de volta à sua posição original...
    this.x = xprev;
    this.y = yprev;

    return result;
  }

  /**
   * Destrói este sprite.
   *
   * @return {boolean}
   */
  destroy(): boolean {
    this._destroyed = true;
    return this._destroyed;
  }

  /**
   * @event create
   */
  created(): void {
    // ...
  }

  /**
   * @event update
   */
  update(): void {
    // ...
  }

  /**
   * @event destroyed
   */
  destroyed(): void {
    // ...
  }

  /**
   * @event draw
   */
  draw(): void {
    // ...
  }
}

// ==========================================================================
// scene.ts
// ==========================================================================
/**
 * @class Scene
 *
 * @description
 * Representa uma cena de jogo.
 */
export class Scene {
  /** Lista de sprites do jogo. */
  sprites: Sprite[];

  /** Tags. */
  tags: Map<string, Sprite[]>;

  /**
   * @constructor
   */
  constructor() {
    this.sprites = [];
    this.tags = new Map<string, Sprite[]>();
  }

  /**
   * Retorna se uma tag existe e possui ao menos um sprite rotulado.
   *
   * @return {boolean}
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag) && this.tags.get(tag).length > 0;
  }

  /**
   * Obtém todos os sprites rotulados por uma tag específica.
   *
   * @param {string} tag Tag.
   *
   * @return {Sprite[]}
   */
  getTag(tag: string): Sprite[] {
    if(this.hasTag(tag)) {
      return this.tags.get(tag);
    }

    return [];
  }

  /**
   * Game loop.
   */
  loop(): void {
    // Atualizar controles...
    p1.update();
    p2.update();
    p3.update();
    p4.update();

    // Filtro de sprites ativos.
    let filter: Sprite[] = [];

    // Clasificar sprites...
    for(let index: i32 = 0; index < this.sprites.length; index += 1) {
      let sprite: Sprite = this.sprites[index];
      let tag   : string = sprite.tag;

      // Criar identificador, caso não exista...
      if(!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }

      // Classificar este sprite:
      this.tags.get(tag).push(sprite);
    }

    // Acionar evento de update:
    this.update();

    // Percorrer sprites...
    for(let index: i32 = 0; index < this.sprites.length; index += 1) {
      let sprite: Sprite = this.sprites[index];

      // Seus eventos só serão acionados quando estiver ativo...
      if(!sprite._destroyed) {

        // Acionar evento de criação (apenas uma vez):
        if(!sprite._created) {
          sprite.created();
          sprite._created = true;
        }

        // Acionar eventos de update e de desenho:
        sprite.update();
        sprite.draw();

        // Caso o sprite continue ativo após seus eventos, ele passará pelo
        // filtro e continuará na lista no próximo loop...
        if(!sprite._destroyed) {
          filter.push(sprite);
        }
        // ...do contrário, acionar evento de destruição:
        else {
          sprite.destroyed();
        }
      }
    }

    // Filtrar sprites e limpar tags...
    this.sprites = filter;
    this.tags.clear();

    // Atualizar paleta de cores + flags...
    canvas.updatePalette();
    canvas.updateSystemFlags();
  }

  /**
   * @event update
   */
  update(): void {
    // ...
  }
}
