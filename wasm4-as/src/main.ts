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

/** Lista de cenas principais. */
let scenes: Tiny.Scene[] = [];

/**
 * Obtém a última cena da pilha.
 *
 * @return {Tiny.Scene}
 */
function getScene(): Tiny.Scene {
  return scenes[scenes.length - 1];
}

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
    this.tag = "Player";
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
 * @class Collectble
 *
 * @description
 * Exemplo de coletável.
 */
class Collectable extends Tiny.Sprite {
  constructor(x: i32, y: i32) {
    super(8, 8);
    this.tag = "Collectable";
    this.x = x;
    this.y = y;
  }

  /**
   * @event update
   */
  update(): void {
    // Obter referência da cena atual:
    let scene: Tiny.Scene = getScene();

    // Internamente, as cenas separam os sprites por UIDs e tags. Desta forma,
    // é possível verificar se a cena contém um objeto específico, neste caso,
    // o jogador...
    if(scene.hasTag("Player")) {
      let player: Tiny.Sprite = scene.getTag("Player")[0];

      // Ao colidir com o jogador, o coletável se teleportará para uma
      // coordenada aleatória, usando a função utilitária "Util.range()"...
      if(this.intersect(player)) {
        this.x = Tiny.Util.range(0, (160 - this.width));
        this.y = Tiny.Util.range(0, (160 - this.height));
      }
    }
  }

  /**
   * @event draw
   */
  draw(): void {
    Tiny.canvas.oval(this.x, this.y, this.width, this.height, 0x2);
  }
}

/**
 * @class RootScene
 *
 * @description
 * Exemplo de declaração de cena.
 */
class RootScene extends Tiny.Scene {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * @event onCreate
   */
  onCreate(): void {
    this.sprites.push(new Player(80, 80));
    this.sprites.push(new Collectable(64, 64));
  }

  /**
   * @event update
   */
  update(): void {
    Tiny.canvas.text("Hello from...\nTinysprite!", 0, 0, 0x2);
  }
}

/**
 * @event start
 */
export function start(): void {
  // Criar uma cena inicial...
  let rootScene: Tiny.Scene = new RootScene();
      rootScene.sprites.push(new Player(80, 80));

  // ...e adicioná-la na lista:
  scenes.push(rootScene);
}

/**
 * @event update
 */
export function update(): void {
  // Executar loop sob a última cena da pilha...
  if(scenes.length > 0) {
    let scene: Tiny.Scene = getScene();
        scene.loop();
  }
  // ...ou exibir uma mensagem de erro quando não existirem mais cenas:
  else {
    Tiny.canvas.text("No scenes!", 0, 0, 0x2);
  }
}
