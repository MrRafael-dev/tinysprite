/**
 * @name TinySprite Track Script for WASM-4
 * @author Mr.Rafael
 * @license MIT
 * @version 1.0.4
 *
 * @description
 * Função que ajudam a entender e criar trilhas sonoras para a classe `Track`.
 */

/** Opcodes usados pelas trilhas. */
const Opcode = {
  NOP        : 0x00,
  HALT       : 0xFF,
  JUMP       : 0xFE,
  IFJUMP     : 0xFD,
  IFNOTJUMP  : 0xFC,
  SYSCALL    : 0xFB,
  RESET      : 0xFA,
  SET        : 0xF9,
  ADD        : 0xF8,
  SUB        : 0xF7,
  EQUAL      : 0xF6,
  LT         : 0xF5,
  GT         : 0xF4,
  LTEQUAL    : 0xF3,
  GTEQUAL    : 0xF2,
  TICKS      : 0xF1,
  TICKS16    : 0xF0,
  WAIT       : 0xEF,
  WAIT16     : 0xEE,
  INSTRUMENT : 0xED,
  PLAY       : 0xEC,
};

/** Bytecode resultante. Exporte-o como `memory.data<u8>([ ... ]);` */
const bytecode = [];

/**
 * Representa um valor de 8-bits.
 * 
 * @param {number} value Valor a ser convertido.
 * 
 * @returns {u8}
 */
function u8(value) {
	const u8value = Math.abs(value) % 256;
	return isNaN(u8value)? 0: u8value;
}

/**
 * Separa um valor de 16-bits em uma array com os 2 bytes separados.
 * 
 * @param {u16} value Valor a ser separado.
 * 
 * @returns {u8[]}
 */
function u16hilo(value) {
  const hi = u8((Math.abs(value) % 65536) >> 8);
	const lo = u8((Math.abs(value) % 65536) - hi);

  return [hi, lo];
}

/**
 * Representa um valor de 16-bits.
 * Os valores são convertidos para uma ordem diferente.
 * 
 * Ex: `0xFFAA` se transformará em `0xAAFF`.
 * 
 * @param {number} value Valor a ser convertido.
 * 
 * @returns {u8}
 */
function u16(value) {
	const hi = u8((Math.abs(value) % 65536) >> 8);
	const lo = u8((Math.abs(value) % 65536) - hi);

	return (lo * 0x100) | hi;
}

/**
 * Representa o valor unitário da arquitetura da plataforma.
 * Por conveniência, este valor será o mesmo que um do tipo `u16`.
 * 
 * @param {number} value Valor a ser convertido.
 * 
 * @returns {u16}
 */
function usize(value) {
  return u16(value);
}

/**
 * Implementação da função `memory.load<u8>([])`, do AssemblyScript.
 * 
 * @param {number} offset Offset de memória.
 * 
 * @returns {u8}
 */
function loadu8(offset) {
  return u8(Math.abs(bytecode[offset]) % 256);
}

/**
 * Implementação da função `memory.load<u16>([])`, do AssemblyScript.
 * 
 * @param {number} offset Offset de memória.
 * 
 * @returns {u16}
 */
function loadu16(offset) {
  const lo = u8((Math.abs(bytecode[offset    ])) % 256);
  const hi = u8((Math.abs(bytecode[offset + 1])) % 256);

  return (hi * 0x100) | lo;
}

/**
 * Retorna o total de bytes escritos.
 * 
 * @returns {number}
 */
function len() {
	return bytecode.length;
}

/**
 * Insere uma série de bytes diretamente.
 * 
 * @param  {...u8} Bytes a serem inseridos.
 */
function db(...bytes) {
	for(let byte of bytes) {
		bytecode.push(u8(byte));
	}
}

/**
 * @opcode NOP
 * Operação vazia.
 */
function nop() {
	bytecode.push(Opcode.NOP);
}

/**
 * @opcode HALT @requests requestedToHalt
 * Solicita o encerramento da execução.
 */
function halt() {
	bytecode.push(Opcode.HALT);
}

/**
 * @opcode JUMP
 * Salta para um outro offset.
 * 
 * @param {u16} value Offset.
 */
function jump(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.JUMP, bytes[1], bytes[0]);
}

/**
 * @opcode IFJUMP
 * Salta para um outro offset, quando o valor do acumulador
 * é igual a `true`.
 * 
 * @param {u16} value Offset.
 */
function ifjump(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.IFJUMP, bytes[1], bytes[0]);
}

/**
 * @opcode IFNOTJUMP
 * Salta para um outro offset, quando o valor do acumulador
 * é igual a `false`.
 * 
 * @param {u16} value Offset.
 */
function ifnotjump(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.IFNOTJUMP, bytes[1], bytes[0]);
}

/**
 * @opcode SYSCALL @requests requestedSyscall
 * Solicita uma *syscall* externa.
 * 
 * @param {u16} value Código da *syscall*.
 */
function syscall(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.SYSCALL, bytes[1], bytes[0]);
}

/**
 * @opcode RESET
 * Reseta todos os valores desta trilha de volta aos originais.
 */
function reset() {
	bytecode.push(Opcode.RESET);
}

/**
 * @opcode SET
 * Define um valor para o registrador.
 * 
 * @param {u8} value Valor.
 */
function set(value) {
	bytecode.push(Opcode.SET, u8(value));
}

/**
 * @opcode ADD
 * Adiciona um valor para o registrador.
 * 
 * @param {u8} value Valor.
 */
function add(value) {
	bytecode.push(Opcode.ADD, u8(value));
}

/**
 * @opcode SUB
 * Subtrai um valor do registrador.
 * 
 * @param {u8} value Valor.
 */
function sub(value) {
	bytecode.push(Opcode.SUB, u8(value));
}

/**
 * @opcode EQUAL
 * Compara se o registrador é igual ao valor.
 * 
 * @param {u8} value Valor.
 */
function equal(value) {
	bytecode.push(Opcode.EQUAL, u8(value));
}

/**
 * @opcode LT
 * Compara se o registrador é menor que o valor.
 * 
 * @param {u8} value Valor.
 */
function lt(value) {
	bytecode.push(Opcode.LT, u8(value));
}

/**
 * @opcode GT
 * Compara se o registrador é maior que o valor.
 * 
 * @param {u8} value Valor.
 */
function gt(value) {
	bytecode.push(Opcode.GT, u8(value));
}

/**
 * @opcode LTEQUAL
 * Compara se o registrador é menor ou igual ao valor.
 * 
 * @param {u8} value Valor.
 */
function ltequal(value) {
	bytecode.push(Opcode.LTEQUAL, u8(value));
}

/**
 * @opcode GTEQUAL
 * Compara se o registrador é maior ou igual ao valor.
 * 
 * @param {u8} value Valor.
 */
function gtequal(value) {
	bytecode.push(Opcode.GTEQUAL, u8(value));
}

/**
 * @opcode TICKS
 * Define uma taxa de ticks de execução.
 * 
 * @param {u8} value Taxa de ticks.
 */
function ticks(value) {
	bytecode.push(Opcode.TICKS, u8(value));
}

/**
 * @opcode TICKS
 * Define uma taxa de ticks de execução (16-bits).
 * 
 * @param {u16} value Taxa de ticks.
 */
 function ticks16(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.TICKS16, bytes[1], bytes[0]);
}

/**
 * @opcode WAIT
 * Define um período de espera até a próxima instrução.
 * 
 * @param {u8} value Índice do instrumento.
 */
function wait(value) {
	bytecode.push(Opcode.WAIT, u8(value));
}

/**
 * @opcode WAIT16
 * Define um período de espera até a próxima instrução (16-bits).
 * 
 * @param {u16} value Índice do instrumento.
 */
function wait16(value) {
  const bytes = u16hilo(value);
	bytecode.push(Opcode.WAIT16, bytes[1], bytes[0]);
}

/**
 * @opcode INSTRUMENT
 * Define um índice de instrumento para uso.
 * 
 * @param {u8} value Índice do instrumento.
 */
function instrument(value) {
	bytecode.push(Opcode.INSTRUMENT, u8(value));
}

/**
 * @opcode PLAY @requests requestedToPlay
 * Define um índice de instrumento para uso.
 * 
 * @param {u8} value Índice do instrumento.
 */
function play(value) {
	bytecode.push(Opcode.PLAY, u8(value));
}

/**
 * @class Track
 * 
 * Representa uma trilha sonora, que funciona a partir de uma série de eventos
 * controlados por opcodes.
 */
class Track {
	/**
	 * @constructor
	 * 
	 * @param {usize} data Ponteiro de referência.
	 */
	constructor(data) {
    /** Ponteiro de referência. */
	  this.data = data;

    /** Cursor responsável por coletar as instruções. */
	  this.cursor = u16(0);

    /** Contador interno de ticks. Pode ser controlado com `wait`. */
	  this.counter = u16(0);
    
    /** Registrador único. Usado para operações simples. */
	  this.register = u8(0);

    /** Acumulador único. Salva comparações feitas no registrador. */
	  this.accumulator = false;

    /** Índice do instrumento selecionado. */
	  this.instrument = u8(0);

    /** Nota do instrumento solicitada para tocar. */
	  this.note = u8(0);

    /** Código de *syscall*. Usado para se comunicar externamente. */
	  this.syscode = u16(0);

    /** Atraso de ticks por quadro. */
	  this.ticks = u16(0);

    /** Período de espera. usado para pausar o tempo de execução. */
	  this.wait = u16(0);
    
    /** Indica se foi solicitado o encerramento da execução. */
	  this.sentHalt = false;

    /** Indica se foi solicitada uma *syscall*. */
	  this.sentSyscall = false;

    /** Indica se foi solicitado o toque da nota. */
	  this.sentPlay = false;
	}

	/**
	 * Reseta todos os valores desta trilha de volta aos originais.
	 */
	reset() {
		this.cursor      = u16(0);
    	this.counter     = u16(0);
    	this.register    = u8(0);
    	this.accumulator = false;
    	this.instrument  = u8(0);
    	this.note        = u8(0);
    	this.syscode     = u16(0);
    	this.ticks       = u16(0);
    	this.wait        = u16(0);
    	this.sentHalt    = false;
    	this.sentSyscall = false;
    	this.sentPlay    = false;
	}
  
	/**
	 * @event halt
	 * Evento acionado ao encerrar a execução.
	 */
	halt() {
	}
  
	/**
	 * @event syscall
	 * Evento acionado ao receber um código de *syscall*.
	 * 
	 * @param {u16} syscode Código de *syscall*.
	 */
	syscall(syscode) {
	}
  
	/**
	 * @event play
	 * Evento acionado ao receber uma nota para tocar.
	 * 
	 * @param {u8} note Nota a ser tocada.
	 */
	play(note) {
	}
  
	/**
	 * @event update
	 * Evento de *update* para esta trilha sonora.
	 */
	update() {
	  // Não executar quando o encerramento tiver sido solicitado...
	  if(this.sentHalt) {
		this.halt();
		return;
	  }
  
	  // Não executar até sincronizar com a taxa de ticks por ciclo...
	  if(this.counter > 0) {
		this.counter -= 1;
  
		// Escutar syscall...
		if(this.sentSyscall) {
		  this.syscall(this.syscode);
		}
  
		// Escutar notas...
		if(this.sentPlay) {
		  this.play(this.note);
		}
  
		return;
	  }
  
	  // Redefinir taxa de ticks:
	  this.counter = this.ticks;
  
	  // Este valor poderão ser alterados novamente
	  // até o encerramento da função...
	  this.sentSyscall = false;
	  this.sentPlay    = false;
  
	  // Não executar enquanto estiver em um período de espera...
	  if(this.wait > 0) {
		this.wait -= 1;
		return;
	  }
  
	  // Executar código (com recursão de até 255 loops)...
	  for(let index = 0; index < 255; index += 1) {
		// Offset e opcode da instrução a ser executada.
		const offset  = this.data + this.cursor;
		const opcode = loadu8(offset);
  
		// Operação vazia.
		if(opcode === Opcode.NOP) {
		  this.cursor += 1;
		  break;
		}
  
		// Solicita o encerramento da execução.
		if(opcode === Opcode.HALT) {
		  this.sentHalt = true;
		  this.cursor += 1;
  
		  this.halt();
		  break;
		}
  
		// Salta para um outro offset.
		if(opcode === Opcode.JUMP) {
		  this.cursor = loadu16(offset + 1);
		  continue;
		}
  
		// Salta para um outro offset, quando o valor do acumulador
		// é igual a `true`.
		if(opcode === Opcode.IFJUMP) {
		  if(this.accumulator === true) {
			this.cursor = loadu16(offset + 1);
			continue;
		  }
				  
		  this.cursor += 2;
		  break;
		}

		// Salta para um outro offset, quando o valor do acumulador
		// é igual a `false`.
		if(opcode === Opcode.IFNOTJUMP) {
		  if(this.accumulator === false) {
			this.cursor = loadu16(offset + 1);
			continue;
		  }
				  
		  this.cursor += 2;
		  break;
		}
  
		// Solicita a execução de uma syscall.
		if(opcode === Opcode.SYSCALL) {
		  this.syscode = loadu16(offset + 1);
		  this.sentSyscall = true;
		  this.cursor += 3;
  
		  this.syscall(this.syscode);
		  break;
		}
  
		// Define um valor para o registrador.
		if(opcode === Opcode.SET) {
		  this.register = loadu8(offset + 1);
		  this.cursor += 2;
		  continue;
		}
  
		// Adiciona um valor para o registrador.
		if(opcode === Opcode.ADD) {
		  this.register += loadu8(offset + 1);
		  this.cursor += 2;
		  continue;
		}
  
		// Subtrai um valor do registrador.
		if(opcode === Opcode.SUB) {
		  this.register -= loadu8(offset + 1);
		  this.cursor += 2;
		  continue;
		}
  
		// Compara se o registrador é igual ao valor.
		if(opcode === Opcode.EQUAL) {
		  const value = loadu8(offset + 1);
		  this.accumulator = this.register === value;
		  this.cursor += 2;
		  continue;
		}
  
		// Compara se o registrador é menor que o valor.
		if(opcode === Opcode.LT) {
		  const value = loadu8(offset + 1);
		  this.accumulator = this.register < value;
		  this.cursor += 2;
		  continue;
		}
  
		// Compara se o registrador é maior que o valor.
		if(opcode === Opcode.GT) {
		  const value = loadu8(offset + 1);
		  this.accumulator = this.register > value;
		  this.cursor += 2;
		  continue;
		}
  
		// Compara se o registrador é menor ou igual que o valor.
		if(opcode === Opcode.LTEQUAL) {
		  const value = loadu8(offset + 1);
		  this.accumulator = this.register <= value;
		  this.cursor += 2;
		  continue;
		}
  
		// Compara se o registrador é maior ou igual que o valor.
		if(opcode === Opcode.GTEQUAL) {
		  const value = loadu8(offset + 1);
		  this.accumulator = this.register >= value;
		  this.cursor += 2;
		  continue;
		}
  
		// Define uma taxa de ticks de execução.
		if(opcode === Opcode.TICKS) {
		  this.ticks = loadu8(offset + 1);
		  this.counter = this.ticks;
		  this.cursor += 2;
		  break;
		}
  
		// Define uma taxa de ticks de execução. (16-bits).
		if(opcode === Opcode.TICKS16) {
		  this.ticks = loadu16(offset + 1);
		  this.counter = this.ticks;
		  this.cursor += 3;
		  break;
		}
  
		// Define um período de espera até a próxima instrução.
		if(opcode === Opcode.WAIT) {
		  this.wait = loadu8(offset + 1);
		  this.cursor += 2;
		  break;
		}
  
		// Define um período de espera até a próxima instrução (16-bits).
		if(opcode === Opcode.WAIT16) {
		  this.wait = loadu16(offset + 1);
		  this.cursor += 3;
		  break;
		}
		
		  // Define um índice de instrumento para uso.
		if(opcode === Opcode.INSTRUMENT) {
		  this.instrument = loadu8(offset + 1);
		  this.cursor += 2;
		  continue;
		}
  
		// Solicita o toque de uma nota do instrumento.
		if(opcode === Opcode.PLAY) {
		  this.note = loadu8(offset + 1);
		  this.sentPlay = true;
		  this.cursor += 2;
  
		  this.play(this.note);
		  break;
		}
  
		// Quando um opcode não se associa a uma determinada instrução, ele
		// será considerado uma nota:
		this.note = loadu8(offset);
		this.sentPlay = true;
		this.cursor += 1;
		
		this.play(this.note);
		break;
	  }
	}
}

if(globalThis.hasOwnProperty("module")) {
	/** Exportação de módulos (Node.js). */
	module.exports = {
		Opcode, 
		bytecode, 
		u8, 
		u16,
		len, 
		db, 
		nop, 
		halt, 
		jump, 
		ifjump, 
		ifnotjump, 
		syscall, 
		reset, 
		set, 
		add, 
		sub,
		equal, 
		lt, 
		gt, 
		ltequal, 
		gtequal, 
		ticks, 
		ticks16, 
		wait, 
		wait16, 
		instrument, 
		play,
    Track
	};
}
