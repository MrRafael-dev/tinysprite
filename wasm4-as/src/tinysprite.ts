/**
 * @name tinysprite
 * @author MrRafael-dev
 * @license MIT
 * @version 2.0.0-rc.0
 * @see {@link https://github.com/MrRafael-dev/tinysprite Github}
 *
 * @description
 * Biblioteca de jogos para o WASM-4.
 * 
 * Esta é uma versão mais simplificada das originais e com algumas
 * funcionalidades removidas para minimizar o tamanho da biblioteca.
 */

import * as w4 from "./wasm4";

//#region <util.ts>
/**
 * Funções utilitárias.
 */
export namespace util {
	/** *Look-Up Table* de rotações usadas pelo método {@link flip}. */
	export const rotTable: usize = memory.data<u8>([
		2, 10, 4, 12, // Rotação com X invertido.
		4, 12, 2, 10, // Rotação com Y invertido.
		6,  8, 0, 14, // Rotação com X e Y invertidos.
		0, 14, 6,  8, // Rotação original.
	]);

	/**
	 * Sorteia um número aleatório entre dois valores.
	 *
	 * @param min Valor mínimo.
	 * @param max Valor máximo.
	 * @returns
	 */
	export function range(min: i32 = 0, max: i32 = 0): i32 {
		return (i32(Math.random()) * (max - min)) + min;
	}

	/**
	 * Gerador de números pseudo-aleatórios (*Xorshift*).
	 *
	 * @param seed Seed para o gerador.
	 * @returns
	 */
	export function xorshift(seed: u64): u64 {
		let next: u64 = seed;
	
		next ^= next << 13;
		next ^= next >> 7;
		next ^= next << 17;

		return next;
	}

	/**
	 * Calcula e retorna *flags* de frequência de áudio.
	 * 
	 * @param freq1 Frequência (1/2). De `0x0000` a `0xFFFF`.
	 * @param freq2 Frequência (2/2). De `0x0000` a `0xFFFF`.
	 * @returns
 	 */
	export function frequency(freq1: i32, freq2: i32): u32 {
		return freq1 | (freq2 << 16);
	}

	/**
	 * Calcula e retorna *flags* de duração de áudio.
	 * 
	 * @param atk Ataque sonoro. De `0x00` a `0xFF`.
	 * @param dec Esmaecimento sonoro. De `0x00` a `0xFF`.
	 * @param sus Sustentação da nota. De `0x00` a `0xFF`.
	 * @param rel Soltura da nota. De `0x00` a `0xFF`.
	 * @returns
	 */
	export function duration(atk: i32, dec: i32, sus: i32, rel: i32): u32 {
		return (atk << 24) | (dec << 16) | sus | (rel << 8);
	}

	/**
	 * Calcula e retorna *flags* de volume de áudio.
	 * 
	 * @param peak Pico da nota. De `0` a `100`.
	 * @param vol Volume da nota. De `0` a `100`.
	 * @returns
	 */
	export function volume(peak: i32, vol: i32): u32 {
		return (peak << 8) | vol;
	}

	/**
	 * Calcula e retorna *flags* de canal de áudio.
	 * 
	 * @param channel Canal de áudio. De `0` a `3`.
	 * @param mode Modo de áudio. De `0` a `3`.
	 * @param pan Direção dos auto-falantes (esquerda/direita).
	 * @returns
	 */
	export function channel(channel: i32, mode: i32, pan: i32): u32 {
		return channel | (mode << 2) | (pan << 4);
	}

	/**
	 * Calcula e retorna *flags* de rotação e inversão de desenho.
	 *
	 * @param flags *Flags* de desenho.
	 * @param fx Inverte este quadro horizontalmente.
	 * @param fy Inverte este quadro verticalmente.
	 * @param rot Ângulo de rotação (de 0º a 360º).
	 * @returns
	 */
	export function flip(flags: u32, fx: bool, fy: bool, rot: i32): u32 {
		/** Índice de rotação, alinhado em 90º. */
  	let rotIndex: i32 = i32(Math.floor(Math.abs(rot) / 90)) % 4;

  	// Ajustar rotação para ângulos negativos:
  	if(rot < 0) {
    	rotIndex = (4 - rotIndex) % 4;
  	}

		// Aplicar flags de rotação, de acordo com os valores apropriados...
		if(fx && fy) {
			return flags | load<u8>(rotTable + 12 + rotIndex);
		}
		else if(fx) {
			return flags | load<u8>(rotTable + 4 + rotIndex);
		}
		else if(fy) {
			return flags | load<u8>(rotTable + 8 + rotIndex);
		}
		
		return flags | load<u8>(rotTable + rotIndex);
	}

	/**
	 * Separa um *byte*. em uma *array* de *bits*.
	 * 
	 * @param value *Byte*.
	 * @returns Uma *array* com exatamente 8 valores.
	 */
	export function splitBits(value: u8): StaticArray<u8> {
		/** Resultado a ser retornado. */
		const result: StaticArray<u8> = new StaticArray<u8>(8);

		for(let i: u8 = 0; i < 8; i += 1) {
			unchecked(result[i] = (value >> (7 - i)) & 1);
		}
	
		return result;
	}

	/**
	 * Junta uma *array* de *bits* de volta para um *byte*.
	 * 
	 * @param array *Array* de *bits* com exatamente 8 valores.
	 * @returns 
	 */
	export function joinBits(array: StaticArray<u8>): u8 {
		/** Resultado a ser retornado. */
		let result: u8 = unchecked(array[7]);
		/** Potência. */
		let pow: u8 = 128;

		for(let i: i32 = 7; i > 0; i -= 1) {
			unchecked(result += array[i] * pow);
			pow /= 2;
		}

		return result;
	}

	/**
	 * Separa um *byte* em uma *array* de *half nibbles*.
	 * 
	 * @param value *Byte*.
	 * @returns Uma *array* com exatamente 4 valores.
	 */
	export function splitHalfNibbles(value: u8): StaticArray<u8> {
		/** Resultado a ser retornado. */
		const result: StaticArray<u8> = new StaticArray<u8>(4);
		/** Potência. */
		let pow: u8 = 192;
		/** *Shift register*. */
		let shift: u8 = 6;

		for(let i: i32 = 0; i < 4; i += 1) {
			unchecked(result[i] = (value & pow) >> shift);
			pow /= 4;
			shift -= 2;
		}
	
		return result;
	}

	/**
	 * Junta uma *array* de *half nibbles* de volta para um *byte*.
	 * 
	 * @param array *Array* de *half nibbles* com exatamente 4 valores.
	 * @returns 
	 */
	export function joinHalfNibbles(array: StaticArray<u8>): u8 {
		/** *High byte*. */
		const hi: u8 = unchecked((array[0] * 4) + (array[1]));
		/** *Low byte*. */
		const lo: u8 = unchecked((array[2] * 4) + (array[3]));

		return (hi * 16) + lo;
	}

	/**
	 * Separa um *byte* em uma *array* de *nibbles*.
	 * 
	 * @param value *Byte*.
	 * @returns Uma *array* com exatamente 2 valores.
	 */
	export function splitNibbles(value: u8): StaticArray<u8> {
		/** Resultado a ser retornado. */
		const result: StaticArray<u8> = [
			(value >> 4),
			(value & 15),
		];

		return result;
	}

	/**
	 * Junta uma *array* de *nibbles* de volta para um *byte*.
	 * 
	 * @param array *Array* de *nibbles* com exatamente 2 valores.
	 * @returns 
	 */
	export function joinNibbles(array: StaticArray<u8>): u8 {
		return unchecked((array[0] * 16) + array[1]);
	}
}

//#endregion </util.ts>
//#region <vectors.ts>
/**
 * Representa uma coordenada 2D, com posições `x` e `y`.
 */
export class Vec2 {
	/** Posição X. */
	public x: i32;

	/** Posição Y. */
	public y: i32;

	/**
	 * @param x Posição X.
	 * @param y Posição Y.
	 */
	public constructor(x: i32, y: i32) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Reposiciona este vetor.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns 
	 */
	public to(x: i32, y: i32): this {
		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Movimenta este vetor em uma posição relativa.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns 
	 */
	public move(x: i32, y: i32): this {
		this.x += x;
		this.y += y;

		return this;
	}

	/**
	 * Alinha este vetor, de posicionamento absoluto para grade.
	 * 
	 * @param w Largura.
	 * @param h Altura.
	 * 
	 * @returns 
	 */
	public align(w: i32, h: i32): this {
		this.to(this.x / w, this.y / h);
		return this;
	}

	/**
	 * Desalinha este vetor, de grade para posicionamento absoluto.
	 * 
	 * @param w Largura.
	 * @param h Altura.
	 * 
	 * @returns 
	 */
	public dealign(w: i32, h: i32): this {
		this.to(this.x * w, this.y * h);
		return this;
	}
}

/**
 * Representa uma área retangular 2D, com posições `x` e `y`, e uma área 
 * com dimensões `w` e `h`.
 */
export class Rect extends Vec2 {
	/** Largura. */
	public w: i32;

	/** Altura. */
	public h: i32;

	/**
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param w Largura.
	 * @param h Altura.
	 */
	public constructor(x: i32, y: i32, w: i32, h: i32) {
		super(x, y);
		this.w = w;
		this.h = h;
	}

	/**
	 * Redimensiona este vetor.
	 * 
	 * @param w Largura.
	 * @param h Altura.
	 * @returns 
	 */
	public resize(w: i32, h: i32): this {
		this.w = w;
		this.h = h;

		return this;
	}

	/**
	 * Escala este vetor em um redimensionamento relativo.
	 * 
	 * @param w Largura.
	 * @param h Altura.
	 * @returns 
	 */
	public scale(w: i32, h: i32): this {
		this.w += w;
		this.h += h;

		return this;
	}

	/**
	 * Calcula e retorna uma cópia da posição superior esquerda deste vetor.
	 * 
	 * @returns 
	 */
	public calcTopLeft(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	/**
	 * Calcula e retorna uma cópia da posição superior central deste vetor.
	 * 
	 * @returns 
	 */
	public calcTopCenter(): Vec2 {
		return new Vec2(this.x + (this.w / 2) - 1, this.y);
	}

	/**
	 * Calcula e retorna uma cópia da posição superior direita deste vetor.
	 * 
	 * @returns 
	 */
	public calcTopRight(): Vec2 {
		return new Vec2(this.x + (this.w - 1), this.y);
	}

	/**
	 * Calcula e retorna uma cópia da posição centro esquerda deste vetor.
	 * 
	 * @returns 
	 */
	public calcCenterLeft(): Vec2 {
		return new Vec2(this.x, this.y + (this.h / 2) - 1);
	}

	/**
	 * Calcula e retorna uma cópia da posição central deste vetor.
	 * 
	 * @returns 
	 */
	public calcCenter(): Vec2 {
		return new Vec2(this.x + (this.w / 2) - 1, this.y + (this.h / 2) - 1);
	}

	/**
	 * Calcula e retorna uma cópia da posição centro direita deste vetor.
	 * 
	 * @returns 
	 */
	public calcCenterRight(): Vec2 {
		return new Vec2(this.x + (this.w - 1), this.y + (this.h / 2) - 1);
	}

	/**
	 * Calcula e retorna uma cópia da posição inferior esquerda deste vetor.
	 * 
	 * @returns 
	 */
	public calcBottomLeft(): Vec2 {
		return new Vec2(this.x, this.y + (this.h - 1));
	}

	/**
	 * Calcula e retorna uma cópia da posição inferior central deste vetor.
	 * 
	 * @returns 
	 */
	public calcBottomCenter(): Vec2 {
		return new Vec2(this.x + (this.w / 2) - 1, this.y + (this.h - 1));
	}

	/**
	 * Calcula e retorna uma cópia da posição inferior direita deste vetor.
	 * 
	 * @returns 
	 */
	public calcBottomRight(): Vec2 {
		return new Vec2(this.x + (this.w - 1), this.y + (this.h - 1));
	}

	/**
   * Indica se uma determinada posição está dentro dos limites deste vetor.
   * 
   * @param x Posição X.
   * @param y Posição Y.
   * @returns 
   */
  public within(x: i32, y: i32): bool {
    return (
      	 this.x < x + 1
      && this.x + this.w > x
      && this.y < y + 1
      && this.h + this.y > y
    );
  }

	/**
   * Detecta colisão entre este vetor e outro.
   *
   * @param rect Vetor.
   *
   * @returns 
   */
  public intersect(rect: Rect): bool {
    return (
      	 rect != this
      && this.x < rect.x + rect.w
      && this.x + this.w > rect.x
      && this.y < rect.y + rect.h
      && this.h + this.y > rect.y
    );
  }

  /**
   * Detecta colisão entre este vetor e outro, se estivesse em outra posição.
   *
   * @param rect Vetor.
   * @param x Posição X.
   * @param y Posição Y.
   *
   * @returns 
   */
  public intersectAt(rect: Rect, x: i32, y: i32): bool {
    // Salvar posição atual temporariamente...
    const tempX: i32 = this.x;
    const tempY: i32 = this.y;

    // Mover este vetor...
		this.to(x, y);

    // Obter resultado da colisão:
    const result: bool = this.intersect(rect);

    // Restaurar posição original e retornar o resultado...
		this.to(tempX, tempY);
    return result;
  }
}

//#endregion </vectors.ts>
//#region <grid.ts>
/**
 * Estrutura representativa de uma grade de dados.
 * É equivalente a uma *array* 2D.
 */
export interface Grid {
	/** Referência do endereço de memória dos dados. */
	offset: usize;

	/** Largura da grade. */
	w: i32;

	/** Altura da grade. */
	h: i32;
	
	/**
	 * Obtém o valor de uma posição.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @returns 
	 */
	getAt(x: i32, y: i32): i32;

	/**
	 * Define ou modifica um valor em uma posição.
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param value Valor.
	 * @returns 
	 */
	setAt(x: i32, y: i32, value: i32): bool;
}

/** Formatos de grade suportados pelo {@link DataGrid}. */
export enum GridFormat {
	Bits = 8,
	HalfNibbles = 4,
	Nibbles = 2
}

/**
 * Representa uma grade de dados padrão.
 */
export class DataGrid implements Grid {
	public offset: usize;
	public w: i32;
	public h: i32;

	/** Formato dos dados. */
	public format: GridFormat;

	/**
	 * 
	 * @param offset Referência do endereço de memória dos dados.
	 * @param w Largura da grade.
	 * @param h Altura da grade.
	 * @param format Formato dos dados.
	 */
	public constructor(offset: usize, w: i32, h: i32, format: GridFormat) {
		this.offset = offset;
		this.w = w;
		this.h = h;
		this.format = format;
	}

	/**
	 * Retorna se uma determinada posição está dentro dos limites desta grade.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @returns 
	 */
	public within(x: i32, y: i32): bool {
		return (x >= 0 && x < this.w) && (y >= 0 && y < this.h);
	}

	public getAt(x: i32, y: i32): i32 {
		// Encerrar operação quando a posição não estiver dentro da área...
		if(!this.within(x, y)) {
			return 0;
		}

		/** *Offset* da posição a ser retornada. */
    const offset: i32 = ((y * (this.w / this.format)) + (x / this.format));
		/** Índice do *bit*, *half nibble* ou *nibble* a ser retornado. */
    const index: i32 = x % this.format;
		/** Conteúdo da posição especificada. */
    const content: u8 = load<u8>(this.offset + offset);

		if(this.format === GridFormat.HalfNibbles) {
			return unchecked(util.splitHalfNibbles(content)[index]);
		}
		else if(this.format === GridFormat.Nibbles) {
			return unchecked(util.splitNibbles(content)[index]);
		}
		
    return unchecked(util.splitBits(content)[index]);
	}

	public setAt(x: i32, y: i32, value: i32): bool {
		// Encerrar operação quando a posição não estiver dentro da área...
		if(!this.within(x, y)) {
			return false;
		}

		/** *Offset* da posição a ser modificada. */
    const offset: i32 = ((y * (this.w / this.format)) + (x / this.format));
		/** Índice do *bit*, *half nibble* ou *nibble* a ser modificado. */
    const index: i32 = i32(Math.abs(x % this.format));
		/** Conteúdo da posição especificada. */
    let content: u8 = load<u8>(this.offset + offset);

		if(this.format === GridFormat.Bits) {
    	const chunk: StaticArray<u8> = util.splitBits(content);
			unchecked(chunk[index] = u8(value % 2));
    	content = util.joinBits(chunk);
		}
		else if(this.format === GridFormat.HalfNibbles) {
			const chunk: StaticArray<u8> = util.splitHalfNibbles(content);
			unchecked(chunk[3 - index] = u8(value % 4));
			content = util.joinHalfNibbles(chunk);
		}
		else if(this.format === GridFormat.Nibbles) {
			const chunk: StaticArray<u8> = util.splitNibbles(content);
			unchecked(chunk[1 - index] = u8(value % 16));
			content = util.joinNibbles(chunk);
		}

		store<u8>(this.offset + offset, content);
    return true;
	}
}

//#endregion </grid.ts>
//#region <canvas.ts>
/**
 * Funções de desenho.
 */
export namespace canvas {
	/** *Framebuffer*. */
  export const framebuffer: DataGrid = new DataGrid(w4.FRAMEBUFFER, w4.SCREEN_SIZE, w4.SCREEN_SIZE, GridFormat.HalfNibbles);

	/** *Viewport*. */
	export const view: Rect = new Rect(0, 0, w4.SCREEN_SIZE, w4.SCREEN_SIZE);

	/** Paleta de cores. É uma *array* com exatamente 4 valores.  */
	export const pal: StaticArray<i32> = [0xE0F8CF, 0x86C06C, 0x306850, 0x071821];

	/** Quando `true`, mantém a tela "suja". */
  export let preserveFrameBuffer: bool = false;

  /** Quando `true`, esconde os botões virtuais (*mobile*). */
  export let hideGamepadOverlay: bool = false;

	/**
   * Atualiza a paleta de cores e as *flags* de sistema.
   */
  export function update(): void {
		// Atualizar paleta de cores...
		for(let i: i32 = 0; i < 4; i += 1) {
    	store<i32>(w4.PALETTE + (i * 4), unchecked(pal[i]));
		}

		/** *Flags* de sistema. */
		let systemFlags: u8 = 0;
		
		// Concatenar valores...
		if(hideGamepadOverlay) {
			systemFlags += 2;
		}
		if(preserveFrameBuffer) {
			systemFlags += 1;
		}

    // Atualizar flags...
    store<u8>(w4.SYSTEM_FLAGS, systemFlags);
  }

	/**
   * Calcula uma posição X relativa à *viewport*.
   *
   * @param x Posição X.
   * @returns 
   */
  export function viewX(x: i32): i32 {
    return x - view.x;
  }

  /**
   * Calcula uma posição Y relativa à *viewport*.
   *
   * @param y Posição Y.
   * @returns 
   */
  export function viewY(y: i32): i32 {
    return y - view.y;
  }

	/**
   * Retorna se uma posição ou área está visível na tela.
   *
   * @param x Posição X.
   * @param y Posição Y.
   * @param w Largura.
   * @param h Altura.
   * @returns 
   */
  export function onScreen(x: i32, y: i32, w: i32, h: i32): bool {
    return (
      	 viewX(x) < framebuffer.w
      && viewX(x + w) > 0
      && viewY(y) < framebuffer.h
      && viewY(y + h) > 0
    );
  }

	/**
   * Limpa a tela com uma cor específica.
   *
   * @param colors Ordem de cores da paleta.
   * @param ignoreViewport Permite ignorar o posicionamento da viewport, limpando a tela inteira. O valor padrão é `true`.
   * @returns 
   */
	export function clear(colors: u16, ignoreViewport: bool = true): bool {
		// Alterar ordem de cores da paleta:
		store<u16>(w4.DRAW_COLORS, colors);
	
		// Desenhar retângulo (ignorando viewport)...
		if(ignoreViewport) {
			w4.rect(
				0,
				0,
				framebuffer.w,
				framebuffer.h
			);
		}
		// Desenhar retângulo (dentro da viewport)...
		else {
			w4.rect(
				viewX(0),
				viewY(0),
				view.w,
				view.h
			);
		}
	
		return true;
	}

	/**
   * Desenha uma imagem na tela.
   *
   * @param image Imagem de referência.
   * @param x Posição X.
   * @param y Posição Y.
   * @param width Largura.
   * @param height Altura.
   * @param colors Ordem de cores da paleta.
   * @param flags Flags de desenho da imagem de referência.
	 * @returns 
   */
  export function blit(image: usize, x: i32, y: i32, width: i32, height: i32, colors: u16, flags: u32): bool {
    // Não desenhar fora da tela...
    if(!onScreen(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar imagem...
    w4.blit(
      image,
      viewX(x),
      viewY(y),
      i32(width),
      i32(height),
      flags
    );

    return true;
  }

  /**
   * Desenha um fragmento de uma imagem na tela.
   *
   * @param image Imagem de referência.
   * @param x Posição X.
   * @param y Posição Y.
   * @param width Largura.
   * @param height Altura.
   * @param cutX Posição X de corte.
   * @param cutY Posição Y de corte.
   * @param stride Use a largura da imagem de referência.
   * @param colors Ordem de cores da paleta.
   * @param flags Flags de desenho da imagem de referência.
	 * @returns 
   */
  export function blitSub(image: usize, x: i32, y: i32, width: i32, height: i32, cutX: i32, cutY: i32, stride: i32, colors: u16, flags: u32): bool {
    // Não desenhar fora da tela...
    if(!onScreen(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar imagem...
    w4.blitSub(
      image,
      viewX(x),
      viewY(y),
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
   * @param x1 Posição X inicial.
   * @param y1 Posição Y inicial.
   * @param x2 Posição X final.
   * @param y2 Posição Y final.
   * @param colors Ordem de cores da paleta.
	 * @returns 
   */
  export function line(x1: i32, y1: i32, x2: i32, y2: i32, colors: u16): bool {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.line(
      viewX(x1),
      viewY(y1),
      viewX(x2),
      viewY(y2)
    );

    return true;
  }

  /**
   * Desenha uma linha horizontal na tela.
   *
   * @param x Posição X inicial.
   * @param y Posição Y inicial.
   * @param length Tamanho da linha.
   * @param colors Ordem de cores da paleta.
	 * @returns 
   */
  export function hline(x: i32, y: i32, length: i32, colors: u16): bool {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.hline(
      viewX(x),
      viewY(y),
      length
    );

    return true;
  }

  /**
   * Desenha uma linha vertical na tela.
   *
   * @param x Posição X inicial.
   * @param y Posição Y inicial.
   * @param length Tamanho da linha.
   * @param colors Ordem de cores da paleta.
	 * @returns 
   */
  export function vline(x: i32, y: i32, length: i32, colors: u16): bool {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar linha...
    w4.vline(
      viewX(x),
      viewY(y),
      length
    );

    return true;
  }

  /**
   * Desenha um círculo na tela.
   *
   * @param x Posição X.
   * @param y Posição Y.
   * @param width Largura.
   * @param height Altura.
   * @param colors Ordem de cores da paleta.
	 * @returns 
   */
  export function oval(x: i32, y: i32, width: i32, height: i32, colors: u16): bool {
    // Não desenhar fora da tela...
    if(!onScreen(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar círculo...
    w4.oval(
      viewX(x),
      viewY(y),
      width,
      height
    );

    return true;
  }

  /**
   * Desenha um retângulo na tela.
   *
   * @param x Posição X.
   * @param y Posição Y.
   * @param width Largura.
   * @param height Altura.
   * @param colors Ordem de cores da paleta.
	 * @returns 
   */
  export function rect(x: i32, y: i32, width: i32, height: i32, colors: u16): bool {
    // Não desenhar fora da tela...
    if(!onScreen(x, y, width, height)) {
      return false;
    }

    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Desenhar retângulo...
    w4.rect(
      viewX(x),
      viewY(y),
      width,
      height
    );

    return true;
  }

  /**
   * Escreve um texto na tela usando a fonte padrão.
   *
   * @param text Texto a ser escrito.
   * @param x Posição X.
   * @param y Posição Y.
   * @param colors Ordem de cores da paleta.
   * @returns 
   */
  export function text(text: string, x: i32, y: i32, colors: u16): bool {
    // Alterar ordem de cores da paleta:
    store<u16>(w4.DRAW_COLORS, colors);

    // Escrever texto (com fonte padrão)...
    w4.text(text, viewX(x), viewY(y));

    return true;
  }

  /**
   * Escreve um texto na tela, assumindo que todos os caracteres estejam
   * organizados em apenas uma linha/coluna.
   *
   * @param image Imagem de referência.
   * @param isHorizontal Modo de organização (horizontal/vertical).
   * @param imageSize Tamanho (horizontal/vertical) da imagem.
   * @param charWidth Largura dos caracteres.
   * @param charHeight Altura dos caracteres.
   * @param x Posição X.
   * @param y Posição Y.
   * @param text Texto a ser escrito.
   * @param charset Charset com todos os caracteres a serem usados.
   * @param paddingX Espaçamento horizontal entre cada caractere.
   * @param paddingY Espaçamento vertical entre cada caractere.
   * @param start Índice do quadro de animação do primeiro caractere.
   * @param colors Ordem de cores da paleta.
   * @param flags Flags de desenho da imagem de referência.
	 * @returns 
   */
  export function write(image: usize, isHorizontal: bool, imageSize: i32, charWidth: i32, charHeight: i32, x: i32, y: i32, text: string, charset: string, start: i32, paddingX: i32, paddingY: i32, colors: u16, flags: u32): bool {
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
        rect(
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
      blitSub(
        image,
        x + (column * (frame.w  + paddingX)),
        y + (line   * (frame.h + paddingY)),
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
//#region <gamepad.ts>
/**
 * Representa um dos botões de controle. Útil para obter eventos rápidos, 
 * como checar se foi pressionado ou não.
 */
@final @unmanaged class GamepadButton {
	/** Ciclos de estados de entrada usados pelo método {@link next}. */
	public static cycle: usize = memory.data<u8>([
		1, 2, 2, 1, // Quando recém-pressionado.
		0, 3, 3, 0, // Quando recém-solto.
	]);

  /** Estado de entrada. */
  public state: u8 = 0;

  /**
   * Avança para o próximo estado de botão, a partir de uma situação atual.
   *
   * @param isPressed Indica se o botão de entrada está pressionado.
   */
  public next(isPressed: bool): void {
		let offset: usize = GamepadButton.cycle + usize(this.state);

		if(isPressed) {
			offset += 4;
		}

		this.state = load<u8>(offset);
  }

  /**
	 * Retorna se este botão está inerte.
	 */
  public get isIdle(): bool {
    return this.state === 0;
  }

  /**
	 * Retorna se este botão está recém-pressionado.
	 */
  public get isPressed(): bool {
    return this.state === 1;
  }

  /**
	 * Retorna se este botão está mantido.
	 */
  public get isHeld(): bool {
    return this.state === 2;
  }

  /**
	 * Retorna se este botão está solto.
	 */
  public get isReleased(): bool {
    return this.state === 3;
  }
}

/**
 * Representa um controle de jogador.
 */
@final @unmanaged class Gamepad {
  /** Endereço de memória do estado do controle. */
  private _offset: usize;

  /** Botão para cima. */
  public up: GamepadButton;

  /** Botão para baixo. */
  public down: GamepadButton;

  /** Botáo para esquerda. */
  public left: GamepadButton;

  /** Botáo para direita. */
  public right: GamepadButton;

  /** Botáo 1 (tecla X). */
  public x: GamepadButton;

  /** Botáo 2 (tecla Z). */
  public z: GamepadButton;

  /**
   * @param offset Endereço de memória do estado do controle.
   */
  public constructor(offset: usize) {
    this._offset = offset;
    this.up = new GamepadButton();
    this.down = new GamepadButton();
    this.left = new GamepadButton();
    this.right = new GamepadButton();
    this.x = new GamepadButton();
    this.z = new GamepadButton();
  }

  /**
   * Atualiza todos os estados de tecla.
   */
  public update(): void {
		/** Estado do controle. */
    const state: u8 = load<u8>(this._offset);

		// Aproveitar a entrada do controle para 
		// embaralhar os números aleatórios...
		for(let i: u8 = 0; i < state; i += 1) {
      Math.random();
    }

		// Atualizar estados dos botões:
    this.up.next(bool(state & w4.BUTTON_UP));
    this.down.next(bool(state & w4.BUTTON_DOWN));
    this.left.next(bool(state & w4.BUTTON_LEFT));
    this.right.next(bool(state & w4.BUTTON_RIGHT));
    this.x.next(bool(state & w4.BUTTON_1));
    this.z.next(bool(state & w4.BUTTON_2));
  }
}

/**
 * Representa um controle de *mouse* ou *touch screen*.
 */
export namespace mouse {
	/** Posição do *mouse*. */
	export const pos: Vec2 = new Vec2(0, 0);

  /** Botão esquerdo do* mouse*. */
  export const left: GamepadButton = new GamepadButton();

  /** Botão direito do *mouse*. */
  export const right: GamepadButton = new GamepadButton();

  /** Botão do meio do *mouse*. */
  export const middle: GamepadButton = new GamepadButton();
	
  /**
   * Atualiza todos os estados de tecla.
   */
  export function update(): void {
		/** Estado do controle. */
    const state: u8 = load<u8>(w4.MOUSE_BUTTONS);
		/** Posição X atual do *mouse*. */
		const x: i32 = i32(load<i16>(w4.MOUSE_X));
		/** Posição Y atual do *mouse*. */
		const y: i32 = i32(load<i16>(w4.MOUSE_Y));

		// Atualizar estados dos botões:
    left.next(bool(state & w4.MOUSE_LEFT));
    right.next(bool(state & w4.MOUSE_RIGHT));
    middle.next(bool(state & w4.MOUSE_MIDDLE));
    
		// Atualizar posição do mouse:
		pos.to(x, y);
  }
}

/** Controles do jogador 1. */
export const p1: Gamepad = new Gamepad(w4.GAMEPAD1);

/** Controles do jogador 2. */
export const p2: Gamepad = new Gamepad(w4.GAMEPAD2);

/** Controles do jogador 3. */
export const p3: Gamepad = new Gamepad(w4.GAMEPAD3);

/** Controles do jogador 4. */
export const p4: Gamepad = new Gamepad(w4.GAMEPAD4);

//#endregion </gamepad.ts>
