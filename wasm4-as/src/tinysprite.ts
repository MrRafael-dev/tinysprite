/**
 * @name TinySprite for WASM-4
 * @author Mr.Rafael
 * @license MIT
 *
 * ================================
 * Contents:
 * ================================
 * >> class Vec2             [100%]
 * >> class Viewport         [100%]
 * >> class Font             [100%]
 * >> class Canvas           [100%]
 *  | let canvas
 * >> class Frame            [100%]
 * >> class Spritesheet      [ 50%]
 * >> class Hitbox           [100%]
 * >> class Sprite           [ 50%]
 * >> class Core             [ 50%]
 * ================================
 * Import lines:
 * ================================
 * >> import {SCREEN_WIDTH, SCREEN_HEIGHT, Vec2, Viewport, Font, Canvas, canvas, Frame, Spritesheet, Hitbox, Sprite, Core} from "./tinysprite";
 * >> import * as tiny from "./tinysprite";
 * ================================
 */

// WASM-4.
import * as w4 from "./wasm4";

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

  /**
   * @constructor
   *
   * @param {Spritesheet} Folha de sprites.
   * @param {string} charset Charset com todos os caracteres a serem usados.
   * @param {i32} start Índice do quadro de animação do primeiro caractere.
   */
  constructor(spritesheet: Spritesheet, charset: string, start: i32) {
    this.spritesheet = spritesheet;
    this.charset     = charset;
    this.start       = start;
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
    return this.spritesheet.write(x, y, text, this.charset, this.start, colors);
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
      this.viewX(x)          < SCREEN_WIDTH &&
      this.viewX(x + width)  > 0   &&
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
   *
   * @return {boolean}
   */
  text(text: string, x: i32, y: i32): boolean {
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
   * @param {u16} colors Ordem de cores da paleta.
   */
  draw(x: i32, y: i32, index: i32, colors: u16): boolean {
    // Não desenhar a imagem, caso o índice não exista:
    if(index < 0 || index >= this.frames.length) {
      return false;
    }

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
      this.flags
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
   * @param {i32} start Índice do quadro de animação do primeiro caractere.
   * @param {u16} colors Ordem de cores da paleta.
   */
  write(x: i32, y: i32, text: string, charset: string, start: i32, colors: u16): boolean {
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
        x + (column * frame.width),
        y + (line * frame.height),
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
   * @param {u16[][]} tilemap Tilemap (Array 2D).
   * @param {u16} colors Ordem de cores da paleta.
   */
  tile(x: i32, y: i32, tilemap: u16[][], colors: u16): boolean {
    // Percorrer linhas do tilemap...
    for(let row: i32 = 0; row < tilemap.length; row += 1) {
      let line: u16[] = tilemap[row];

      // Percorrer colunas do tilemap...
      for(let column: i32 = 0; column < line.length; column += 1) {
        let index: i32 = line[column] as i32;

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
    this.width  = width;
    this.height = height;
    this.hitbox = new Hitbox(0, 0, width, height);
    this._created = false;
    this._destroyed = false;
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
   * Destrói este sprite.
   *
   * @return {boolean}
   */
  destroy(): boolean {
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
// core.ts
// ==========================================================================
/**
 * @class Core
 *
 * @description
 * Representa uma instância de jogo.
 */
export class Core {
  /** Lista de sprites do jogo. */
  sprites: Sprite[];

  /**
   * @constructor
   */
  constructor() {
    this.sprites = [];
  }

  /**
   * Game loop.
   */
  loop(): void {
    // Filtro de sprites ativos.
    let filter: Sprite[] = [];

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

    // Filtrar sprites...
    this.sprites = filter;

    // Atualizar paleta de cores...
    canvas.updatePalette();
  }

  /**
   * @event update
   */
  update(): void {
    // ...
  }
}
