/**
 * @name TinySprite Scenes for WASM-4
 * @author Mr.Rafael
 * @license MIT
 * @version 0.0.1
 *
 * @description
 * Estrutura de sprites e cenas para a TinySprite.
*/
import {Rect} from "./tinysprite";

// ==========================================================================
// sprite.ts
// ==========================================================================
/**
 * @class Sprite
 * @extends Rect
 *
 * @description
 * Representa um objeto de uso geral que pode ser controlado por eventos.
 */
export class Sprite extends Rect {
  /** Indica se o evento de criação já foi acionado. */
  _created: boolean;

  /** Indica se o evento de destruição já foi acionado. */
  _destroyed: boolean;

  /**
   * @constructor
   *
   * @param {i32} width Largura.
   * @param {i32} height Altura.
   */
  constructor(width: i32, height: i32) {
    super(0, 0, width, height);
    this._created   = false;
    this._destroyed = false;
  }

  /**
   * Marca este sprite para destruição.
   *
   * @return {boolean}
   */
  destroy(): boolean {
    // A função retornará "true" apenas na primeira vez que for destruído...
    if(!this._destroyed) {
      this._destroyed        = true;
      this.collisionsEnabled = false;

      return true;
    }

    // ...do contrário, retornará "false", indicando que nenhum nada ocorreu:
    return false;
  }

  /**
   * Evento de criação. É acionado apenas uma vez.
   *
   * @param {Scene} scene Cena deste sprite.
   */
  onCreate(scene: Scene): void {
  }

  /**
   * Evento de update. É acionado a cada quadro.
   *
   * @param {Scene} scene Cena deste sprite.
   */
  onUpdate(scene: Scene): void {
  }

  /**
   * Evento de desenho. É acionado a cada quadro.
   *
   * @param {Scene} scene Cena deste sprite.
   */
  onDraw(scene: Scene): void {
  }

  /**
   * Evento de destruição. É acionado apenas uma vez.
   *
   * @param {Scene} scene Cena deste sprite.
   */
  onDestroy(scene: Scene): void {
  }
}

// ==========================================================================
// scene.ts
// ==========================================================================
/**
 * @class Scene
 * @extends Rect
 *
 * @description
 * Representa uma cena ou fase do jogo que pode conter vários sprites.
 */
export class Scene extends Rect {
  /** Lista de sprites desta cena. */
  children: Sprite[];

  /** Indica se o evento de criação já foi acionado. */
  _created: boolean;

  /**
   * @constructor
   *
   * @param {i32} width Largura (padrão: 160).
   * @param {i32} height Altura (padrão: 160).
   */
  constructor(width: i32 = 160, height: i32 = 160) {
    super(0, 0, width, height);
    this.children = [];
  }

  /**
   * Evento de criação. É acionado apenas uma vez.
   */
  onCreate(): void {
  }

  /**
   * Evento de update. É acionado a cada quadro.
   */
  onUpdate(): void {
  }

  /**
   * Evento de desenho. É acionado a cada quadro.
   */
  onDraw(): void {
  }

  /**
   * Evento de desenho (overlay). É acionado a cada quadro.
   */
  onDrawHUD(): void {
  }

  /**
   * Gerencia os eventos de um sprite.
   *
   * @param {Sprite} sprite Sprite.
   *
   * @return {boolean} Indica se o sprite foi destruído durante os eventos.
   */
  handleEvents(sprite: Sprite): boolean {
    if(!sprite._destroyed) {
      // Executar evento de criação:
      if(!sprite._created) {
        sprite._created = true;
        sprite.onCreate(this);
      }

      // Executar evento de update:
      sprite.onUpdate(this);

      // Executar evento de desenho:
      if(!sprite._destroyed) {
        sprite.onDraw(this);
      }
    }

    return sprite._destroyed;
  }

  /**
   * Game loop.
   */
  loop(): void {
    // Atualizar paleta e controles:
    poll();

    // Lista de exclusão.
    let discard: Sprite[] = [];

    // Executar evento de criação:
    if(!this._created) {
      this._created = true;
      this.onCreate();
    }

    // Executar evento de desenho:
    this.onDraw();

    // Percorrer sprites...
    for(let index: i32 = 0; index < this.children.length; index += 1) {
      let child: Sprite      = this.children[index];
      let destroyed: boolean = this.handleEvents(child);

      // Adicionar sprites à lista de exclusão:
      if(destroyed) {
        discard.push(child);
      }
    }

    // Executar eventos de update:
    this.onUpdate();

    // Percorrer lista de exclusão...
    for(let index: i32 = 0; index < discard.length; index += 1) {
      let child: Sprite   = discard[index];
      let childIndex: i32 = discard.indexOf(child);

      // Executar evento de destruição:
      child.onDestroy(this);

      // Excluir sprites:
      if(childIndex >= 0) {
        this.children.splice(childIndex, 1);
      }
    }

    // Executar evento de desenho (overlay):
    this.onDrawHUD();
  }
}
