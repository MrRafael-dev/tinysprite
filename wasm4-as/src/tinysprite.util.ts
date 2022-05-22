/**
 * @name TinySprite Utils for WASM-4
 * @author Mr.Rafael
 * @license MIT
 * @version 1.2.3
 *
 * @description
 * Funções utilitárias da TinySprite (apenas gráficos e controles).
 * Você pode importá-la utilizando uma das duas linhas abaixo:
 *
 * ```
 * import {Velocity, Vec2, Rect, Spritesheet, Animation, Font, Tilemap, rseed, canvas, p1, p2, p3, p4, mouse, prand, cflags, poll} from "./tinysprite";
 * import * as ts from "./tinysprite";
 * ```
 */
import * as w4 from "./wasm4";

// ==========================================================================
// misc.ts
// ==========================================================================
/** Largura da tela do WASM-4. */
const SCREEN_WIDTH: i32 = 160;

/** Altura da tela do WASM-4. */
const SCREEN_HEIGHT: i32 = 160;

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

/** Seed para números aleatórios. */
export let rseed: u32 = 4444;

/** Canvas principal. */
export let canvas: Canvas = new Canvas();

/** Controles do jogador 1. */
export let p1: Gamepad = new Gamepad(GAMEPAD_P1);

/** Controles do jogador 2. */
export let p2: Gamepad = new Gamepad(GAMEPAD_P2);

/** Controles do jogador 3. */
export let p3: Gamepad = new Gamepad(GAMEPAD_P3);

/** Controles do jogador 4. */
export let p4: Gamepad = new Gamepad(GAMEPAD_P4);

/** Cursor do mouse/touchscreen. */
export let mouse: Mouse = new Mouse();

/**
 * Gerador de números pseudo-aleatórios: Xorshift.
 *
 * @param {u16} seed Seed para o gerador.
 *
 * @return {u64}
 */
export function prand(seed: u64): u64 {
  let next: u64 = seed as u64;
      next ^= next << 13;
      next ^= next >> 17;
      next ^= next << 5;

  return next;
}

/**
 * Calcula e retorna flags de desenho.
 *
 * @param {u32} flags Flags de desenho.
 * @param {boolean} flipX Inverte este quadro horizontalmente.
 * @param {boolean} flipY Inverte este quadro verticalmente.
 * @param {i32} rotation Ângulo de rotação (de 0º a 360º).
 *
 * @return {u16}
 */
export function cflags(flags: u32 = 0, flipX: boolean = false, flipY: boolean = false, rotation: i32 = 0): u32 {
  // Índice de rotação, alinhado em 90º.
  let rotationIndex: i32 = (Math.floor(Math.abs(rotation) / 90) as i32) % 4;

  // Ajustar rotação para ângulos negativos...
  if(rotation < 0) {
    rotationIndex = (4 - rotationIndex) % 4;
  }

  // Look-Up Table de rotações (original).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  let rotations: u32[] = [
    flags,
    flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE,
    flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y,
    flags | w4.BLIT_ROTATE
  ];

  // Look-Up Table de rotações (X invertido).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  let rotationsFX: u32[] = [
    flags | w4.BLIT_FLIP_X,
    flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE,
    flags | w4.BLIT_FLIP_Y,
    flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE
  ];

  // Look-Up Table de rotações (Y invertido).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  let rotationsFY: u32[] = [
    flags | w4.BLIT_FLIP_Y,
    flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE,
    flags | w4.BLIT_FLIP_X,
    flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE
  ];

  // Look-Up Table de rotações (X e Y invertidos).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  let rotationsFXY: u32[] = [
    flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y,
    flags | w4.BLIT_ROTATE,
    flags,
    flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE
  ];

  // Flags de desenho.
  let drawFlags: u32 = 0;

  // Escolher flags especiais de rotação...
       if(flipX && flipY) { drawFlags = rotationsFXY[rotationIndex]; }
  else if(flipX)          { drawFlags = rotationsFX[rotationIndex];  }
  else if(flipY)          { drawFlags = rotationsFY[rotationIndex];  }
  else                    { drawFlags = rotations[rotationIndex];    }

  return drawFlags;
}

/**
 * Atualiza o estado de vários elementos do console, como o estado de teclas
 * dos controles e paleta de cores. Deve ser chamada a cada novo quadro.
 */
export function poll(): void {
  // Atualizar controles...
  p1.update();
  p2.update();
  p3.update();
  p4.update();
  mouse.update();

  // Atualizar paleta de cores + flags...
  canvas.updatePalette();
  canvas.updateSystemFlags();

  // Aleatorizar seed...
  rseed = prand(rseed as u64);

  // Impedir que a seed possua um valor vazio...
  if(rseed === 0) {
    rseed = 4444;
  }
}

// ==========================================================================
// velocity.ts
// ==========================================================================
/**
 * @class Velocity
 *
 * @description
 * Representa um vetor de movimento.
 */
export class Velocity {
  /** Velocidade atual. */
  spd: f32;

  /** Força de aceleração. */
  acc: f32;

  /** Força de desaceleração. */
  dec: f32;

  /** Força máxima. */
  max: f32;

  /**
   * @constructor
   *
   * @param {f32} acc Força de aceleração.
   * @param {f32} dec Força de desaceleração.
   * @param {f32} max Força máxima.
   */
  constructor(acc: f32 = 0.0, dec: f32 = 0.0, max: f32 = 0.0) {
    this.spd = 0.0;
    this.acc = acc;
    this.dec = dec;
    this.max = max;
  }

  /**
   * Acelera este vetor de velocidade.
   *
   * @param {f32} spd Velocidade de movimento.
   *
   * @return {f32}
   */
  move(spd: f32): f32 {
    this.spd += this.acc * spd;
    return this.spd;
  }

  /**
   * Controla a aceleração desta velocidade.
   *
   * @return {i32}
   */
  update(): f32 {
    // Controlar velocidade (+spd)...
    if(this.spd > this.acc) {

      // Controle de velocidade máxima (+spd):
      if(this.spd > this.max) {
        this.spd = this.max;
      }

      // Desaceleração (+spd):
      else {
        this.spd -= this.dec;

        if(this.spd < 0.0) {
          this.spd = 0.0;
        }
      }
    }

    // Controlar velocidade (-spd)...
    else if(this.spd < -this.acc) {

      // Controle de velocidade máxima (-spd):
      if(this.spd < -this.max) {
        this.spd = -this.max;
      }

      // Desaceleração (-spd):
      else {
        this.spd += this.dec;

        if(this.spd > 0.0) {
          this.spd = 0.0;
        }
      }
    }

    return this.spd;
  }
}

// ==========================================================================
// vec2.ts
// ==========================================================================
/**
 * @class Vec2
 *
 * @description
 * Classe utilitária usada apenas para representar um vetor 2D na tela.
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

  /**
   * Reposiciona as coordenadas deste vetor.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   */
  set(x: i32, y: i32): void {
    this.x = x;
    this.y = y;
  }
}

// ==========================================================================
// rect.ts
// ==========================================================================
/**
 * @class Rect
 *
 * @description
 * Representa uma caixa de colisão.
 */
export class Rect {
  /** Posição X. */
  x: i32;

  /** Posição Y. */
  y: i32;

  /** Largura. */
  width: i32;

  /** Altura. */
  height: i32;

  /** Ativa ou desativa a detecção de colisão para esta caixa. */
  collisionsEnabled: boolean;

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
    this.collisionsEnabled = true;
  }

  /**
   * Reposiciona as coordenadas desta caixa.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @return {Rect} Tail call.
   */
  set(x: i32, y: i32): Rect {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Redimensiona o tamanho desta caixa.
   *
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   *
   * @return {Rect} Tail call.
   */
  resize(width: i32, height: i32): Rect {
    this.width  = width;
    this.height = height;

    return this;
  }

  /**
   * Retorna a posição superior-esquerda desta caixa (X e Y).
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
   * Retorna a posição superior-central desta caixa (X e Y).
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
   * Retorna a posição superior-direita desta caixa (X e Y).
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
   * Retorna a posição centro-esquerda desta caixa (X e Y).
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
   * Retorna a posição central desta caixa (X e Y).
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
   * Retorna a posição centro-direita desta caixa (X e Y).
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
   * Retorna a posição inferior-esquerda desta caixa (X e Y).
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
   * Retorna a posição inferior-central desta caixa (X e Y).
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
   * Retorna a posição inferior-direita desta caixa (X e Y).
   *
   * @return {Vec2}
   */
  bottomRight(): Vec2 {
    return new Vec2(
      this.x + (this.width  - 1),
      this.y + (this.height - 1)
    );
  }

  /**
   * Detecta colisão entre esta e outra caixa.
   *
   * @param {Rect} rect Caixa de colisão.
   *
   * @return {boolean}
   */
  intersect(rect: Rect): boolean {
    return (
      rect != this
      && this.collisionsEnabled
      && rect.collisionsEnabled
      && this.x               <= rect.x + rect.width
      && this.x + this.width  >= rect.x
      && this.y               <= rect.y + rect.height
      && this.height + this.y >= rect.y
    );
  }

  /**
   * Detecta colisão entre esta e outra caixa, em outra posição.
   *
   * @param {Rect} rect Caixa de colisão.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @return {boolean}
   */
  intersectAt(rect: Rect, x: i32, y: i32): boolean {
    // Salvar posição atual temporariamente...
    let tempX: i32 = this.x;
    let tempY: i32 = this.y;

    // Teleportar caixa...
    this.x = x;
    this.y = y;

    // Obter resultado da colisão:
    let result: boolean = this.intersect(rect);

    // Restaurar posição original...
    this.x = tempX;
    this.y = tempY;

    return result;
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
  view: Rect;

  /** Paleta de cores. */
  palette: i32[];

  /** Quando "true", mantém a tela "suja". */
  preserveFrameBuffer: boolean;

  /** Quando "true", esconde os botões da versão mobile. */
  hideGamepadOverlay: boolean;

  /**
   * @constructor
   */
  constructor() {
    this.view = new Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
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
   * Limpa a tela com uma cor específica.
   *
   * @param {u16} colors Ordem de cores da paleta.
   * @param {boolean} ignoreViewport Permite ignorar o posicionamento da
   *        viewport, limpando a tela inteira. O valor padrão é `true`.
   *
   *
   * @return {boolean}
   */
  clear(colors: u16, ignoreViewport: boolean = true): boolean {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar retângulo (ignorando viewport)...
    if(ignoreViewport) {
      w4.rect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
      );
    }
    // Desenhar retângulo (dentro da viewport)...
    else {
      w4.rect(
        this.viewX(0),
        this.viewY(0),
        this.view.width,
        this.view.height
      );
    }

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
    w4.text(text, this.viewX(x), this.viewY(y));

    return true;
  }

  /**
   * Escreve um texto na tela, assumindo que todos os caracteres estejam
   * organizados em apenas uma linha.
   *
   * @param {usize} image Imagem de referência.
   * @param {i32} imageWidth Largura da imagem.
   * @param {i32} imageHeight Altura da imagem.
   * @param {i32} charWidth Largura dos caracteres.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {string} text Texto a ser escrito.
   * @param {string} charset Charset com todos os caracteres a serem usados.
   * @param {i32} paddingX Espaçamento horizontal entre cada caractere.
   * @param {i32} paddingY Espaçamento vertical entre cada caractere.
   * @param {i32} start Índice do quadro de animação do primeiro caractere.
   * @param {u16} colors Ordem de cores da paleta.
   * @param {u32} flags Flags de desenho da imagem de referência.
   */
   write(image: usize, imageWidth: i32, charWidth: i32, charHeight: i32, x: i32, y: i32, text: string, charset: string, start: i32, paddingX: i32, paddingY: i32, colors: u16, flags: u32): boolean {
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
      if(index < 0 || index >= charset.length) {
        column += 1;
        continue;
      }

      // Ajustar índice do caractere para obter o índice do quadro de animação
      // equivalente ao do caractere...
      index += start;

      // Quadro de animação equivalente ao do caractere.
      let frame: Rect = new Rect(
        index * charWidth,
        0,
        charWidth,
        charHeight
      );

      // Desenhar caractere...
      this.blitSub(
        image,
        this.viewX(x) + (column * (frame.width  + paddingX)),
        this.viewY(y) + (line   * (frame.height + paddingY)),
        charWidth,
        charHeight,
        frame.x,
        frame.y,
        imageWidth,
        colors,
        flags
      );

      // Avançar uma coluna...
      column += 1;
    }

    return true;
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
  frames: Rect[];

  /**
   * @constructor
   *
   * @param {usize} image Imagem de referência.
   * @param {u32} flags Flags de desenho da imagem de referência.
   * @param {i32} imageWidth Largura da imagem.
   * @param {i32} imageHeight Altura da imagem.
   * @param {boolean} auto Quando `true`, recorta os quadros automaticamente.
   * @param {i32} width Largura dos quadros de animação.
   * @param {i32} height Altura dos quadros de animação.
   */
  constructor(image: usize, flags: u32, imageWidth: i32, imageHeight: i32, auto: boolean = false, width: i32 = 1, height: i32 = 1) {
    this.image       = image;
    this.flags       = flags;
    this.imageWidth  = imageWidth;
    this.imageHeight = imageHeight;
    this.width       = width;
    this.height      = height;
    this.rows        = Math.floor(imageHeight / height) as i32;
    this.columns     = Math.floor(imageWidth  /  width) as i32;
    this.frames      = [];

    // Cortar e criar quadros de animação dinamicamente (opcional)...
    if(auto) {
      for(let row: i32 = 0; row < this.rows; row += 1) {
        for(let column: i32 = 0; column < this.columns; column += 1) {

          this.frames.push(
            new Rect(column * width, row * height, width, height)
          );

        }
      }
    }
  }

  /**
   * Desenha um quadro de animação, com parâmetros avançados.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {i32} index Índice do quadro de animação.
   * @param {boolean} flipX Inverte este quadro horizontalmente.
   * @param {boolean} flipY Inverte este quadro verticalmente.
   * @param {i32} rotation Ângulo de rotação (de 0º a 360º).
   * @param {u16} colors Ordem de cores da paleta.
   */
  drawExt(x: i32, y: i32, index: i32, flipX: boolean, flipY: boolean, rotation: i32, colors: u16): boolean {
    // Não desenhar a imagem, caso o índice não exista:
    if(index < 0 || index >= this.frames.length) {
      return false;
    }

    // Flags de desenho.
    let flags: u32 = cflags(this.flags, flipX, flipY, rotation);

    // Quadro de animação.
    let frame: Rect = this.frames[index];

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
  draw(x: i32, y: i32, index: i32, colors: u16): boolean {
    return this.drawExt(x, y, index, false, false, 0, colors);
  }

  /**
   * Escreve um texto na tela, usando os quadros de animação como caracteres.
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
      let frame: Rect = this.frames[index];

      // Desenhar caractere...
      this.drawExt(
        x + (column * (frame.width  + paddingX)),
        y + (line   * (frame.height + paddingY)),
        index,
        false,
        false,
        0,
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

      // Percorrer colunas do tilemap...
      for(let column: i32 = 0; column < line.length; column += 1) {
        let index: i32 = line[column] as i32;

        // Se o índice do tile ultrapassar o total de quadros de animação
        // existentes nesta folha de sprites, ele será ignorado...
        if(index < 0 || index >= this.frames.length) {
          continue;
        }

        // Quadro de animação equivalente ao do tile.
        let frame: Rect = this.frames[index];

        // Desenhar tile...
        this.drawExt(
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
// animation.ts
// ==========================================================================
/**
 * @class Animation
 *
 * @description
 * Implementação de animações simples.
 */
export class Animation {
  /** Quadros de animação. */
  frames: i16[];

  /** Velocidade da animação (subtração de ticks). */
  speed: f32;

  /** Taxa de ciclos máxima por quadro. */
  max: f32;

  /** Contador de ciclos. */
  ticks: f32;

  /** Índice de quadro de animação atual. */
  index: i32;

  /**
   * @constructor
   *
   * @param {i16[]} frames Quadros de animação.
   * @param {f32} speed Velocidade da animação (subtração de ticks).
   * @param {f32} max Taxa de ciclos máxima por quadro.
   */
  constructor(frames: i16[] = [], speed: f32 = 30.0, max: f32 = 60.0) {
    this.frames = frames;
    this.speed  = speed;
    this.max    = max;
    this.ticks  = 0.0;
    this.index  = 0;
  }

  /**
   * Retorna o quadro de animação atual, correspondente ao índice.
   *
   * @return {i16}
   */
  get(): i16 {
    return this.frames[this.frames.length % this.frame];
  }

  /**
   * Avança para o próximo índice de quadro de animação.
   *
   * @return {i32} Índice de quadro de animação atual.
   */
  next(): i32 {
    this.index = this.frames.length % (this.frame + 1);
    return this.index;
  }

  /**
   * Atualiza o estado da animação.
   */
  update(): void {
    if(this.ticks > 0.0) {
      this.ticks -= this.speed;
    }
    else {
      this.ticks = this.max;
      this.next();
    }
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
// gamepad_button.ts
// ==========================================================================
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

    rseed *= gamepad & w4.BUTTON_UP? 2: 1;
    rseed *= gamepad & w4.BUTTON_DOWN? 4: 1;
    rseed *= gamepad & w4.BUTTON_LEFT? 8: 1;
    rseed *= gamepad & w4.BUTTON_RIGHT? 16: 1;
    rseed *= gamepad & w4.BUTTON_1? 32: 1;
    rseed *= gamepad & w4.BUTTON_2? 64: 1;
    rseed  = prand(rseed as u64);

    this.up.nextState(gamepad & w4.BUTTON_UP? true: false);
    this.down.nextState(gamepad & w4.BUTTON_DOWN? true: false);
    this.left.nextState(gamepad & w4.BUTTON_LEFT? true: false);
    this.right.nextState(gamepad & w4.BUTTON_RIGHT? true: false);
    this.b1.nextState(gamepad & w4.BUTTON_1? true: false);
    this.b2.nextState(gamepad & w4.BUTTON_2? true: false);
  }
}

// ==========================================================================
// mouse.ts
// ==========================================================================
/**
 * @class Mouse
 *
 * @description
 * Representa um cursor de mouse/touchscreen.
 */
export class Mouse {
  /** Posição do mouse. */
  position: Vec2;

  /** Botão esquerdo do mouse. */
  left: GamepadButton;

  /** Botão direito do mouse. */
  right: GamepadButton;

  /** Botão do meio do mouse. */
  middle: GamepadButton;

  /**
   * @constructor
   */
  constructor() {
    this.position = new Vec2(0, 0);
    this.left     = new GamepadButton();
    this.right    = new GamepadButton();
    this.middle   = new GamepadButton();
  }

  /**
   * Atualiza todos os estados de tecla.
   */
  update(): void {
    let mouse: usize = load<u8>(w4.MOUSE_BUTTONS);

    this.left.nextState(mouse & w4.MOUSE_LEFT? true: false);
    this.right.nextState(mouse & w4.MOUSE_RIGHT? true: false);
    this.middle.nextState(mouse & w4.MOUSE_MIDDLE? true: false);

    this.position.x = load<i16>(w4.MOUSE_X) as i32;
    this.position.y = load<i16>(w4.MOUSE_Y) as i32;

    rseed += Math.abs(this.position.x) as u32;
    rseed += Math.abs(this.position.y) as u32;
    rseed  = prand(rseed as u64);
  }
}
