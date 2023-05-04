/// <reference path="../node_modules/assemblyscript/std/types/assembly/index.d.ts"/>
/**
 * @name tinysprite
 * @author MrRafael-dev
 * @license MIT
 * @version 1.0.0.12
 * @see {@link https://github.com/MrRafael-dev/tinysprite Github}
 *
 * @description
 * Biblioteca de jogos para o WASM-4.
 * 
 * Esta é uma versão mais simplificada das originais e com algumas
 * funcionalidades removidas para minimizar o tamanho da biblioteca.
 */
import * as w4 from "./wasm4";

//#region <misc.ts>
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

/**
 * Sorteia um número aleatório entre dois valores.
 *
 * @param {i32} min Valor mínimo.
 * @param {i32} max Valor máximo.
 *
 * @returns {i32}
 */
export function range(min: i32 = 0, max: i32 = 0): i32 {
  const cmin: f64 = Math.ceil(min);
  const fmax: f64 = Math.floor(max);

  return (Math.floor(Math.random() * (fmax - cmin)) as i32) + min;
}

/**
 * Gerador de números pseudo-aleatórios: Xorshift.
 *
 * @param {u64} seed Seed para o gerador.
 *
 * @returns {u64}
 */
export function prand(seed: u64): u64 {
  let next: u64 = seed as u64;
      next ^= next << 13;
      next ^= next >> 7;
      next ^= next << 17;

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
 * @returns {u16}
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
  const rotations: Uint32Array = new Uint32Array(4);
        rotations[0] = flags;
        rotations[1] = flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE;
        rotations[2] = flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y;
        rotations[3] = flags | w4.BLIT_ROTATE;

  // Look-Up Table de rotações (X invertido).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  const rotationsFX: Uint32Array = new Uint32Array(4);
        rotationsFX[0] = flags | w4.BLIT_FLIP_X;
        rotationsFX[1] = flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE;
        rotationsFX[2] = flags | w4.BLIT_FLIP_Y;
        rotationsFX[3] = flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE;

  // Look-Up Table de rotações (Y invertido).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  const rotationsFY: Uint32Array = new Uint32Array(4);
        rotationsFY[0] = flags | w4.BLIT_FLIP_Y;
        rotationsFY[1] = flags | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE;
        rotationsFY[2] = flags | w4.BLIT_FLIP_X;
        rotationsFY[3] = flags | w4.BLIT_FLIP_X | w4.BLIT_ROTATE;

  // Look-Up Table de rotações (X e Y invertidos).
  // Ângulos: 0º, 90º, 180º e 270º, respectivamente.
  const rotationsFXY: Uint32Array = new Uint32Array(4);
        rotationsFXY[0] = flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y;
        rotationsFXY[1] = flags | w4.BLIT_ROTATE;
        rotationsFXY[2] = flags;
        rotationsFXY[3] = flags | w4.BLIT_FLIP_X | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE;

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
 * Calcula e retorna flags de frequência de áudio.
 * 
 * @param {i32} freq1 Frequência (1/2). De `0x0000` a `0xFFFF`.
 * @param {i32} freq2 Frequência (2/2). De `0x0000` a `0xFFFF`.
 * 
 * @returns {u32}
 */
export function tfreq(freq1: i32 = 0, freq2: i32 = 0): u32 {
	return freq1 | (freq2 << 16);
}

/**
 * Calcula e retorna flags de duração de áudio.
 * 
 * @param {i32} attack Ataque sonoro. De `0x00` a `0xFF`.
 * @param {i32} decay Esmaecimento sonoro. De `0x00` a `0xFF`.
 * @param {i32} sustain Sustentação da nota. De `0x00` a `0xFF`.
 * @param {i32} release Soltura da nota. De `0x00` a `0xFF`.
 * 
 * @returns {u32}
 */
export function tdur(attack: i32 = 0, decay: i32 = 0, sustain: i32 = 0, release: i32 = 0): u32 {
	return (attack << 24) | (decay << 16) | sustain | (release << 8);
}

/**
 * Calcula e retorna flags de volume de áudio.
 * 
 * @param {i32} peak Pico da nota. De `0` a `100`.
 * @param {i32} volume Volume da nota. De `0` a `100`.
 * 
 * @returns {u32}
 */
export function tvol(peak: i32 = 0, volume: i32 = 0): u32 {
	return (peak << 8) | volume;
}

/**
 * Calcula e retorna flags de áudio.
 * 
 * @param {i32} channel Canal de áudio. De `0` a `3`.
 * @param {i32} mode Modo de áudio. De `0` a `3`.
 * @param {i32} pan Direção dos auto-falantes (esquerda/direita).
 * 
 * @returns {i32}
 */
export function tflags(channel: i32 = 0, mode: i32 = 0, pan: i32 = 0): u32 {
	return channel | (mode << 2) | (pan << 4);
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
  Math.random();
}

//#endregion </misc.ts>
//#region <bit_array.ts>
/**
 * @class BitArray @extends Uint8Array
 * 
 * @description
 * Representa uma `Array` de *bits* que representam um *byte*.
 */
export class BitArray extends Uint8Array {
  /**
   * @constructor
   * 
   * @param {u8} value Valor.
   */
  constructor(value: u8) {
    super(8);
    this.value = value;
  }

  /** Valor. */
  get value(): u8 {
    return (this[0] * 0b10000000)
         + (this[1] * 0b1000000 )
         + (this[2] * 0b100000  )
         + (this[3] * 0b10000   )
         + (this[4] * 0b1000    )
         + (this[5] * 0b100     )
         + (this[6] * 0b10      )
         + (this[7]             );
  }

  /** Valor. */
  set value(value: u8) {
    this[0] = (value >> 7) & 1;
    this[1] = (value >> 6) & 1;
    this[2] = (value >> 5) & 1;
    this[3] = (value >> 4) & 1;
    this[4] = (value >> 3) & 1;
    this[5] = (value >> 2) & 1;
    this[6] = (value >> 1) & 1;
    this[7] = (value >> 0) & 1;
  }
}

//#endregion </bit_array.ts>
//#region <half_nibble_array.ts>
/**
 * @class HalfNibbleArray @extends Uint8Array
 * 
 * @description
 * Representa uma `Array` de *half-nibbles*, que representam 2 *bits*.
 */
export class HalfNibbleArray extends Uint8Array {
  /**
   * @constructor
   * 
   * @param {u8} Valor.
   */
  constructor(value: u8) {
    super(4);
    this.value = value;
  }

  /** Valor. */
  get value(): u8 {
    const hi: u8  = (this[0] * 0b100) + (this[1]);
    const lo: u8  = (this[2] * 0b100) + (this[3]);

    return (hi * 0x10) + lo;
  }

  /** Valor. */
  set value(value: u8) {
    this[0] = (value & 0b11000000) >> 6;
    this[1] = (value & 0b110000  ) >> 4;
    this[2] = (value & 0b1100    ) >> 2;
    this[3] = (value & 0b11      );
  }
}

//#endregion </half_nibble_array.ts>
//#region <nibble_array.ts>
/**
 * @class NibbleArray @extends Uint8Array
 * 
 * @description
 * Representa uma `Array` de *nibbles*, que representam 4 *bits*.
 */
export class NibbleArray extends Uint8Array {
  /**
   * @constructor
   * 
   * @param {u8} value Valor.
   */
  constructor(value: u8) {
    super(2);
    this.value = value;
  }

  /** Valor. */
  get value(): u8 {
    return (this[0] * 0x10) + this[1];
  }

  /** Valor. */
  set value(value: u8) {
    this[0] = (value >> 4);
    this[1] = (value & 0xF);
  }
}

//#endregion </nibble_array.ts>
//#region <surface.ts>
/**
 * @interface Surface
 * 
 * @description
 * Permite manipular pixels de uma imagem, permitindo editá-la dinamicamente.
 */
export interface Surface {
  /** Referência de imagem. */
  offset: usize;

  /** Largura. */
  width: i32;

  /** Altura. */
  height: i32;

  /**
   * Obtém um pixel.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @returns {u8} Índice de cor deste pixel.
   */
  getPixel(x: i32, y: i32): u8;

  /**
   * Insere um pixel.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {u8} color Índice de cor deste pixel.
   *
   * @returns {boolean}
   */
  setPixel(x: i32, y: i32, color: u8): boolean;
}

/**
 * @class BitSurface @implements Surface
 * 
 * @description
 * *Surface* para imagens de formato *1BPP* (*1 bit per pixel*; 2 cores).
 */
export class BitSurface implements Surface {
  offset: usize;
  width: i32;
  height: i32;

  /**
   * @constructor
   * 
   * @param {usize} offset Referência de imagem.
   * @param {i32} width Altura.
   * @param {i32} height Largura.
   */
  constructor(offset: usize, width: i32, height: i32) {
    this.offset = offset;
    this.width = width;
    this.height = height;
  }

  getPixel(x: i32, y: i32): u8 {
    // Ignorar pixels fora da área da imagem...
    if((x < 0 || x >= this.width) || (y < 0 || y >= this.height)) {
      return 0;
    }

    // Calcular offset e índice do pixel na imagem.
    const offset: i32 = ((y * (this.height / 8)) + (x / 8));
    const index: i32 = Math.abs(x % 8) as i32;

    // Obter byte com os pixels da imagem.
    const pixelData: u8 = load<u8>(this.offset + offset);

    // Separar bytes e retornar o valor do pixel especificado...
    const pixels: BitArray = new BitArray(pixelData);
    return pixels[index];
  }

  setPixel(x: i32, y: i32, color: u8): boolean {
    // Ignorar pixels fora da área da tela...
    if((x < 0 || x >= this.width) || (y < 0 || y >= this.height)) {
      return false;
    }

    // Calcular offset e índice do pixel no framebuffer.
    const pixelOffset: i32 = ((y * (this.height / 8)) + (x / 8));
    const index: i32 = Math.abs(x % 8) as i32;

    // Obter byte com os pixels da tela.
    let pixelData: u8 = load<u8>(this.offset + pixelOffset);

    // Separar bytes e alterar índice do pixel especificado...
    let pixels: BitArray = new BitArray(pixelData);
        pixels[index] = color % 2;

    // Remontar byte...
    pixelData = pixels.value;

    // Alterar framebuffer...
    store<u8>(this.offset + pixelOffset, pixelData);
    return true;
  }
}

/**
 * @class HalfNibbleSurface @implements Surface
 * 
 * @description
 * *Surface* para imagens de formato *2BPP* (*2 bits per pixel*; 4 cores).
 */
export class HalfNibbleSurface implements Surface {
  offset: usize;
  width: i32;
  height: i32;

  /**
   * @constructor
   * 
   * @param {usize} offset Referência de imagem.
   * @param {i32} width Altura.
   * @param {i32} height Largura.
   */
  constructor(offset: usize, width: i32, height: i32) {
    this.offset = offset;
    this.width = width;
    this.height = height;
  }
  
  getPixel(x: i32, y: i32): u8 {
    // Ignorar pixels fora da área da tela...
    if((x < 0 || x >= this.width) || (y < 0 || y >= this.height)) {
      return 0;
    }

    // Calcular offset e índice do pixel no framebuffer.
    const pixelOffset: i32 = ((y * (this.height / 4)) + (x / 4));
    const index: i32 = Math.abs(x % 4) as i32;

    // Obter byte com os pixels da tela.
    const pixelData: u8 = load<u8>(this.offset + pixelOffset);

    // Separar bytes e retornar o valor do pixel especificado...
    const pixels: HalfNibbleArray = new HalfNibbleArray(pixelData);
    return pixels[index];
  }

  setPixel(x: i32, y: i32, color: u8): boolean {
    // Ignorar pixels fora da área da tela...
    if((x < 0 || x >= this.width) || (y < 0 || y >= this.height)) {
      return false;
    }

    // Calcular offset e índice do pixel no framebuffer.
    const pixelOffset: i32 = ((y * (this.height / 4)) + (x / 4));
    const index: i32 = Math.abs(x % 4) as i32;

    // Obter byte com os pixels da tela.
    let pixelData: u8 = load<u8>(this.offset + pixelOffset);

    // Separar bytes e alterar índice do pixel especificado...
    let pixels: HalfNibbleArray = new HalfNibbleArray(pixelData);
        pixels[3 - index] = color % 4;

    // Remontar byte...
    pixelData = pixels.value;

    // Alterar framebuffer...
    store<u8>(this.offset + pixelOffset, pixelData);
    return true;
  }
}

//#endregion </surface.ts>
//#region <vec2.ts>
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
   * Retorna uma representação deste objeto em texto.
   * 
   * @returns {string}
   */
  toString(): string {
    return `${this.x.toString()},${this.y.toString()}`;
  }

  /**
   * Reposiciona as coordenadas deste vetor.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * 
   * @returns {Vec2} Tail call.
   */
  set(x: i32, y: i32): Vec2 {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Movimenta as coordenadas deste vetor em uma posição relativa.
   * 
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * 
   * @returns {Vec2} Tail call.
   */
  move(x: i32, y: i32): Vec2 {
    this.x += x;
    this.y += y;

    return this;
  }

  /**
   * Alinha as coordenadas deste vetor para representar índices de uma grade.
   * 
   * @param {i32} width Largura da grade.
   * @param {i32} height Altura da grade.
   * 
   * @returns {Vec2} Tail call.
   */
  grid(width: i32, height: i32): Vec2 {
    this.x = Math.floor(this.x / width) as i32;
    this.y = Math.floor(this.y / height) as i32;

    return this;
  }

  /**
   * Converte índices de grade representadas por este vetor para coordenadas.
   * 
   * @param {i32} width Largura da grade.
   * @param {i32} height Altura da grade.
   * 
   * @returns {Vec2} Tail call.
   */
  ungrid(width: i32, height: i32): Vec2 {
    this.x = this.x * width;
    this.y = this.y * height;

    return this;
  }
}

//#endregion </vec2.ts>
//#region <rect.ts>
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
   * Retorna uma representação deste objeto em texto.
   * 
   * @returns {string}
   */
  toString(): string {
    return `${this.x.toString()},${this.y.toString()};${this.width.toString()},${this.height.toString()};${this.collisionsEnabled? 1: 0}`;
  }

  /**
   * Reposiciona as coordenadas desta caixa.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @returns {Rect} Tail call.
   */
  set(x: i32, y: i32): Rect {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Movimenta as coordenadas desta caixa em uma posição relativa.
   * 
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * 
   * @returns {Rect} Tail call.
   */
  move(x: i32, y: i32): Rect {
    this.x += x;
    this.y += y;

    return this;
  }

  /**
   * Alinha as coordenadas desta caixa para representar índices de uma grade.
   * 
   * @param {i32} width Largura da grade.
   * @param {i32} height Altura da grade.
   * 
   * @returns {Rect} Tail call.
   */
  grid(width: i32, height: i32): Rect {
    this.x = Math.floor(this.x / width) as i32;
    this.y = Math.floor(this.y / height) as i32;

    return this;
  }

  /**
   * Converte índices de grade representadas por esta caixa para coordenadas.
   * 
   * @param {i32} width Largura da grade.
   * @param {i32} height Altura da grade.
   * 
   * @returns {Rect} Tail call.
   */
  ungrid(width: i32, height: i32): Rect {
    this.x = this.x * width;
    this.y = this.y * height;

    return this;
  }

  /**
   * Redimensiona o tamanho desta caixa.
   *
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   *
   * @returns {Rect} Tail call.
   */
  resize(width: i32, height: i32): Rect {
    this.width  = width;
    this.height = height;

    return this;
  }

  /**
   * Retorna a posição superior-esquerda desta caixa (X e Y).
   *
   * @returns {Vec2}
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
   * @returns {Vec2}
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
   * @returns {Vec2}
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
   * @returns {Vec2}
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
   * @returns {Vec2}
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
   * @returns {Vec2}
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
   * @returns {Vec2}
   */
  bottomLeft(): Vec2 {
    return new Vec2(
      this.x,
      this.y + (this.height - 1)
    );
  }

  /**
   * Retorna a posição inferior-central desta caixa (X e Y).
   *
   * @returns {Vec2}
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
   * @returns {Vec2}
   */
  bottomRight(): Vec2 {
    return new Vec2(
      this.x + (this.width  - 1),
      this.y + (this.height - 1)
    );
  }

  /**
   * Indica se esta caixa está em uma posição visível da tela.
   *
   * @returns {boolean}
   */
  isOnScreen(): boolean {
    return canvas.isVisible(this.x, this.y, this.width, this.height);
  }

  /**
   * Indica se uma posição está dentro dos limites desta caixa.
   * 
   * @param x {i32} Posição X.
   * @param y {i32} Posição Y.
   * 
   * @returns {boolean}
   */
  within(x: i32, y: i32): boolean {
    return (
      this.x               < x + 1 &&
      this.x + this.width  > x     &&
      this.y               < y + 1 &&
      this.height + this.y > y
    );
  }

  /**
   * Detecta colisão entre esta e outra caixa.
   *
   * @param {Rect} rect Caixa de colisão.
   *
   * @returns {boolean}
   */
  intersect(rect: Rect): boolean {
    return (
      rect != this
      && this.collisionsEnabled
      && rect.collisionsEnabled
      && this.x               < rect.x + rect.width
      && this.x + this.width  > rect.x
      && this.y               < rect.y + rect.height
      && this.height + this.y > rect.y
    );
  }

  /**
   * Detecta colisão entre esta e outra caixa, em outra posição.
   *
   * @param {Rect} rect Caixa de colisão.
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @returns {boolean}
   */
  intersectAt(rect: Rect, x: i32, y: i32): boolean {
    // Salvar posição atual temporariamente...
    const tempX: i32 = this.x;
    const tempY: i32 = this.y;

    // Teleportar caixa...
    this.x = x;
    this.y = y;

    // Obter resultado da colisão:
    const result: boolean = this.intersect(rect);

    // Restaurar posição original...
    this.x = tempX;
    this.y = tempY;

    return result;
  }
}

//#endregion </rect.ts>
//#region <canvas.ts>
/**
 * @class Canvas
 *
 * @description
 * Abstração de funções de desenho do WASM-4.
 */
@final
export class Canvas {
  /** Área de desenho. */
  view: Rect;

  /** Paleta de cores. */
  palette: Int32Array;

  /** Quando "true", mantém a tela "suja". */
  preserveFrameBuffer: boolean;

  /** Quando "true", esconde os botões da versão mobile. */
  hideGamepadOverlay: boolean;

  /**
   * @constructor
   */
  constructor() {
    this.view = new Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.palette = new Int32Array(4);
    this.preserveFrameBuffer = false;
    this.hideGamepadOverlay  = false;

    this.resetPalette();
  }

  /**
   * Redefine a paleta de cores de volta para a padrão.
   * 
   * @returns {boolean}
   */
  resetPalette(): boolean {
    return this.setPalette(0xE0F8CF, 0x86C06C, 0x306850, 0x071821);
  }

  /**
   * Define uma nova paleta de cores.
   * 
   * @param {i32} color1 Cor da paleta (1/4).
   * @param {i32} color2 Cor da paleta (2/4).
   * @param {i32} color3 Cor da paleta (3/4).
   * @param {i32} color4 Cor da paleta (4/4).
   * 
   * @returns {boolean}
   */
  setPalette(color1: i32, color2: i32, color3: i32, color4: i32): boolean {
    this.palette[0] = color1;
    this.palette[1] = color2;
    this.palette[2] = color3;
    this.palette[3] = color4;

    return true;
  }

  /**
   * Atualiza a paleta de cores.
   *
   * @returns {boolean}
   */
  updatePalette(): boolean {
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
   * @returns {boolean}
   */
  updateSystemFlags(): boolean {
    // Valores das flags.
    const bitA: i32 = this.hideGamepadOverlay?  2: 0;
    const bitB: i32 = this.preserveFrameBuffer? 1: 0;

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
   * @returns {boolean}
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
   * @returns {boolean}
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
   * @returns {i32}
   */
  @inline
  viewX(x: i32): i32 {
    return x - this.view.x;
  }

  /**
   * Calcula uma posição Y relativa à área de desenho.
   *
   * @param {i32} y Posição Y.
   *
   * @returns {i32}
   */
  @inline
  viewY(y: i32): i32 {
    return y - this.view.y;
  }

  /**
   * Obtém um pixel da tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   *
   * @returns {u8} Índice de cor deste pixel (de 0x00 a 0x03).
   */
  getPixel(x: i32, y: i32): u8 {
    // Ignorar pixels fora da área da tela...
    if((x < 0 || x >= 160) || (y < 0 || y >= 160)) {
      return 0;
    }

    // Calcular offset e índice do pixel no framebuffer.
    const offset: i32 = ((y * 40) + (x / 4));
    const index: i32 = Math.abs(x % 4) as i32;

    // Obter byte com os pixels da tela.
    const pixelData: u8 = load<u8>(w4.FRAMEBUFFER + offset);

    // Separar bytes e retornar o valor do pixel especificado...
    const pixels: HalfNibbleArray = new HalfNibbleArray(pixelData);
    return pixels[index];
  }

  /**
   * Insere um pixel na tela.
   *
   * @param {i32} x Posição X.
   * @param {i32} y Posição Y.
   * @param {u8} color Índice de cor deste pixel (de 0x00 a 0x03).
   *
   * @returns {boolean}
   */
  setPixel(x: i32, y: i32, color: u8): boolean {
    // Ignorar pixels fora da área da tela...
    if((x < 0 || x >= 160) || (y < 0 || y >= 160)) {
      return false;
    }

    // Calcular offset e índice do pixel no framebuffer.
    const offset: i32 = ((y * 40) + (x / 4));
    const index: i32 = Math.abs(x % 4) as i32;

    // Obter byte com os pixels da tela.
    let pixelData: u8 = load<u8>(w4.FRAMEBUFFER + offset);

    // Separar bytes e alterar índice do pixel especificado...
    let pixels: HalfNibbleArray = new HalfNibbleArray(pixelData);
        pixels[3 - index] = color % 4;

    // Remontar byte...
    pixelData = pixels.value;

    // Alterar framebuffer...
    store<u8>(w4.FRAMEBUFFER + offset, pixelData);
    return true;
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
   * @returns {boolean}
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
   * organizados em apenas uma linha/coluna.
   *
   * @param {usize} image Imagem de referência.
   * @param {boolean} isHorizontal Modo de organização (horizontal/vertical).
   * @param {i32} imageSize Tamanho (horizontal/vertical) da imagem.
   * @param {i32} charWidth Largura dos caracteres.
   * @param {i32} charHeight Altura dos caracteres.
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
  write(image: usize, isHorizontal: boolean, imageSize: i32, charWidth: i32, charHeight: i32, x: i32, y: i32, text: string, charset: string, start: i32, paddingX: i32, paddingY: i32, colors: u16, flags: u32): boolean {
    // Contadores de linhas e colunas.
    let line  : i32 = 0;
    let column: i32 = 0;

    // Caracteres especiais: "\n" (newline) e " " (space).
    const newline: i32 = 10;
    const space  : i32 = 32;

    // Percorrer caracteres do texto...
    for(let charIndex: i32 = 0; charIndex < text.length; charIndex += 1) {
      const char    : string = text.charAt(charIndex);
      const charCode: i32    = char.charCodeAt(0);

      // Avançar para a próxima linha ao encontrar um "\n" (newline)...
      if(charCode === newline) {
        line  += 1;
        column = 0;
        continue;
      }

      // Avançar para a próxima coluna ao encontrar um " " (space),
      // depois de desenhar um retângulo que simboliza o espaço...
      else if(charCode === space) {
        this.rect(
          x + (column * (charWidth  + paddingX)),
          y + (line   * (charHeight + paddingY)),
          charWidth,
          charHeight, 
          (colors >> 4)
        );

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
      const frame: Rect = new Rect(
        isHorizontal ===  true? index * charWidth : 0,
        isHorizontal === false? index * charHeight: 0,
        charWidth,
        charHeight
      );

      // Desenhar caractere...
      this.blitSub(
        image,
        x + (column * (frame.width  + paddingX)),
        y + (line   * (frame.height + paddingY)),
        charWidth,
        charHeight,
        frame.x,
        frame.y,
        imageSize,
        colors,
        flags
      );

      // Avançar uma coluna...
      column += 1;
    }

    return true;
  }
}

//#endregion </canvas.ts>
//#region <gamepad_button.ts>
/**
 * @class GamepadButton
 *
 * @description
 * Representa um dos botões de controle. Útil para obter eventos rápidos, como
 * checar se foi pressionado ou não.
 */
@final
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
   * @returns {u8}
   */
  nextState(pressed: boolean): u8 {
    // Ciclo de estados quando o botão estiver pressionado.
    const whenPressed: Uint8Array = new Uint8Array(4);
          whenPressed[0] = GAMEPAD_STATE_PRESSED; // Quando inerte.
          whenPressed[1] = GAMEPAD_STATE_HELD;    // Quando recém-pressionado.
          whenPressed[2] = GAMEPAD_STATE_HELD;    // Quando mantido.
          whenPressed[3] = GAMEPAD_STATE_PRESSED; // Quando recém-solto.

    // Ciclo de estados quando o botão estiver solto.
    const whenReleased: Uint8Array = new Uint8Array(4);
          whenReleased[0] = GAMEPAD_STATE_IDLE;     // Quando inerte.
          whenReleased[1] = GAMEPAD_STATE_RELEASED; // Quando recém-pressionado.
          whenReleased[2] = GAMEPAD_STATE_RELEASED; // Quando mantido.
          whenReleased[3] = GAMEPAD_STATE_IDLE;     // Quando recém-solto.

    if(pressed) {
      this.state = whenPressed[this.state];
    }
    else {
      this.state = whenReleased[this.state];
    }

    return this.state;
  }

  /** Indica se este botão está inerte. */
  @inline
  get idle(): boolean {
    return this.state === GAMEPAD_STATE_IDLE;
  }

  /** Indica se este botão está recém-pressionado. */
  @inline
  get pressed(): boolean {
    return this.state === GAMEPAD_STATE_PRESSED;
  }

  /** Indica se este botão está mantido. */
  @inline
  get held(): boolean {
    return this.state === GAMEPAD_STATE_HELD;
  }

  /** Indica se este botão está solto. */
  @inline
  get released(): boolean {
    return this.state === GAMEPAD_STATE_RELEASED;
  }
}

//#endregion <gamepad_button.ts>
//#region <gamepad.ts>
/**
 * @class Gamepad
 *
 * @description
 * Representa um controle de jogador.
 */
@final
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
   * @returns {usize}
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
    const gamepad: usize = this.gamepad();

    for(let index: usize = 0; index < gamepad; index += 1) {
      Math.random();
    }

    this.up.nextState(gamepad & w4.BUTTON_UP? true: false);
    this.down.nextState(gamepad & w4.BUTTON_DOWN? true: false);
    this.left.nextState(gamepad & w4.BUTTON_LEFT? true: false);
    this.right.nextState(gamepad & w4.BUTTON_RIGHT? true: false);
    this.b1.nextState(gamepad & w4.BUTTON_1? true: false);
    this.b2.nextState(gamepad & w4.BUTTON_2? true: false);
  }
}

//#endregion </gamepad.ts>
//#region <mouse.ts>
/**
 * @class Mouse
 *
 * @description
 * Representa um cursor de mouse/touchscreen.
 */
@final
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
    const mouse: usize = load<u8>(w4.MOUSE_BUTTONS);

    this.left.nextState(mouse & w4.MOUSE_LEFT? true: false);
    this.right.nextState(mouse & w4.MOUSE_RIGHT? true: false);
    this.middle.nextState(mouse & w4.MOUSE_MIDDLE? true: false);

    this.position.x = load<i16>(w4.MOUSE_X) as i32;
    this.position.y = load<i16>(w4.MOUSE_Y) as i32;
  }
}

//#endregion </mouse.ts>
//#region <variables.ts>
/** Canvas principal. */
export const canvas: Canvas = new Canvas();

/** Controles do jogador 1. */
export const p1: Gamepad = new Gamepad(GAMEPAD_P1);

/** Controles do jogador 2. */
export const p2: Gamepad = new Gamepad(GAMEPAD_P2);

/** Controles do jogador 3. */
export const p3: Gamepad = new Gamepad(GAMEPAD_P3);

/** Controles do jogador 4. */
export const p4: Gamepad = new Gamepad(GAMEPAD_P4);

/** Cursor do mouse/touchscreen. */
export const mouse: Mouse = new Mouse();
//#endregion </variables.ts>
