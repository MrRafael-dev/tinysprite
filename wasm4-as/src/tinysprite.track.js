/**
 * @name TinySprite Track Script for WASM-4
 * @author Mr.Rafael
 * @license MIT
 * @version 1.0.2
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
  SET        : 0xFA,
  ADD        : 0xF9,
  SUB        : 0xF8,
  EQUAL      : 0xF7,
  LT         : 0xF6,
  GT         : 0xF5,
  LTEQUAL    : 0xF4,
  GTEQUAL    : 0xF3,
  TICKS      : 0xF2,
  TICKS16    : 0xF1,
  WAIT       : 0xF0,
  WAIT16     : 0xEF,
  INSTRUMENT : 0xEE,
  PLAY       : 0xED,
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
	return Math.abs(value) % 256;
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
	const hi = (Math.abs(value) % 65536) >> 8;
	const lo = (Math.abs(value) % 65536) - hi;

	return (lo * 0x100) | hi;
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
	bytecode.push(Opcode.JUMP, u16(value));
}

/**
 * @opcode IFJUMP
 * Salta para um outro offset, quando o valor do acumulador
 * é igual a `true`.
 * 
 * @param {u16} value Offset.
 */
function ifjump(value) {
	bytecode.push(Opcode.IFJUMP, u16(value));
}

/**
 * @opcode IFNOTJUMP
 * Salta para um outro offset, quando o valor do acumulador
 * é igual a `false`.
 * 
 * @param {u16} value Offset.
 */
function ifnotjump(value) {
	bytecode.push(Opcode.IFNOTJUMP, u16(value));
}

/**
 * @opcode SYSCALL @requests requestedSyscall
 * Solicita uma *syscall* externa.
 * 
 * @param {u16} value Código da *syscall*.
 */
function syscall(value) {
	bytecode.push(Opcode.SYSCALL, u16(value));
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
 * @param {u16} value Valor.
 */
function equal(value) {
	bytecode.push(Opcode.EQUAL, u16(value));
}

/**
 * @opcode LT
 * Compara se o registrador é menor que o valor.
 * 
 * @param {u16} value Valor.
 */
function lt(value) {
	bytecode.push(Opcode.LT, u16(value));
}

/**
 * @opcode GT
 * Compara se o registrador é maior que o valor.
 * 
 * @param {u16} value Valor.
 */
function gt(value) {
	bytecode.push(Opcode.GT, u16(value));
}

/**
 * @opcode LTEQUAL
 * Compara se o registrador é menor ou igual ao valor.
 * 
 * @param {u16} value Valor.
 */
function ltequal(value) {
	bytecode.push(Opcode.LTEQUAL, u16(value));
}

/**
 * @opcode GTEQUAL
 * Compara se o registrador é maior ou igual ao valor.
 * 
 * @param {u16} value Valor.
 */
function gtequal(value) {
	bytecode.push(Opcode.GTEQUAL, u16(value));
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
	bytecode.push(Opcode.TICKS16, u16(value));
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
	bytecode.push(Opcode.WAIT16, u16(value));
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
	bytecode.push(Opcode.INSTRUMENT, u8(value));
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
		play
	};
}
