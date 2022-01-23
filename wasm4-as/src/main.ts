import * as w4 from "./wasm4";
import * as Tiny from "./tinysprite";

/** Sprite de exemplo (8x8). */
const smiley = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
]);

/** Cena principal. */
let game: Tiny.Scene = new Tiny.Scene();

/**
 * @class Player
 *
 * @description
 * Exemplo de declaração de classe de jogador.
 */
class Player extends Tiny.Sprite {
  /**
   * @constructor
   *
   * @param {i32} x Posição X inicial.
   * @param {i32} y Posição Y inicial.
   */
  constructor(x: i32, y: i32) {
    super(8, 8);
    this.x = x;
    this.y = y;
  }

  /**
   * @event update
   */
  update(): void {
    if(Tiny.p1.up.held())    { this.y -= 1; }
    if(Tiny.p1.down.held())  { this.y += 1; }
    if(Tiny.p1.left.held())  { this.x -= 1; }
    if(Tiny.p1.right.held()) { this.x += 1; }
  }

  /**
   * @event draw
   */
  draw(): void {
    Tiny.canvas.blit(smiley, this.x, this.y, 8, 8, 0x4, w4.BLIT_1BPP);
  }
}

/**
 * @event start
 */
export function start(): void {
  game.sprites.push(new Player(80, 80));
}

/**
 * @event update
 */
export function update(): void {
  Tiny.canvas.text("Hello from...\nTinysprite!", 0, 0, 0x2);
  game.loop();
}
