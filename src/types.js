const {
	BigNumber
} = require('bignumber.js');

function toLE(val, bytes) {
	let r = new VecU8(bytes);
	for (var o = 0; val > 0; ++o) {
		r[o] = val % 256;
		val /= 256;
	}
	return r;
}
function stringToBytes(s) {
	var data = new VecU8(s.length);
	for (var i = 0; i < s.length; i++) {
		data[i] = s.charCodeAt(i);
	}
	return data;
}
function bytesToHex(uint8arr) {
	if (!uint8arr) {
		return '';
	}
	var hexStr = '';
	for (var i = 0; i < uint8arr.length; i++) {
		var hex = (uint8arr[i] & 0xff).toString(16);
		hex = (hex.length === 1) ? '0' + hex : hex;
		hexStr += hex;
	}

	return hexStr.toLowerCase();
}

function bytesToRIHex(uint8arr) {
	if (!uint8arr) {
		return '';
	}
	var hexStr = '';
	for (var i = 0; i < uint8arr.length; i++) {
		var hex = (uint8arr[i] & 0xff).toString(16);
		hex = (hex.length === 1) ? '0' + hex : hex;
		hexStr = hex + hexStr;
	}

	return hexStr.toLowerCase();
}

class VecU8 extends Uint8Array {
	toJSON() {
		return {
			_type: 'VecU8',
			data: Array.from(this)
		}
	}
	toPrimitive() {
		return Buffer.from(this).toString('utf8')
	}
	toString() {
		return Buffer.from(this).toString('utf8')
	}
	toStringBuffer() {
		return Buffer.from(Buffer.from(this).toString('utf8'), 'hex')
	}
}

class AccountId extends Uint8Array {
	toHex() {
		return bytesToHex(Array.from(this))
	}

	toPrimitive() {
		return this.toHex()
	}

	toJSON() {
		return {
			_type: 'AccountId',
			data: Array.from(this)
		}
	}
}

class Hash extends Uint8Array {
	toRightHex() {
		return bytesToRIHex(this)
	}
	toHex() {
		return bytesToHex(this)
	}
	toJSON() {
		return {
			_type: 'Hash',
			data: Array.from(this),
			hash: bytesToHex(this)
		}
	}
}

class VoteThreshold extends String {
	toJSON() {
		return {
			_type: 'VoteThreshold',
			data: this + ''
		}
	}
}

class BlockNumber extends Number {
	toJSON() {
		return {
			_type: 'BlockNumber',
			data: this + 0
		}
	}

	toNumber() {
		return this.valueOf()
	}

	toPrimitive() {
		return this.toString(10)
	}
}

class AccountIndex extends Number {
	toJSON() {
		return {
			_type: 'AccountIndex',
			data: this + 0
		}
	}
}

class Tuple extends Array {
	toJSON() {
		return {
			_type: 'Tuple',
			data: Array.from(this)
		}
	}
}

class SlashPreference extends Number {
	toJSON() {
		return {
			_type: 'SlashPreference',
			data: this + 0
		}
	}
}

class Moment extends Date {
	constructor(seconds) {
		super(seconds * 1000)
		this.number = seconds
	}
	toJSON() {
		return {
			_type: 'Moment',
			data: this.number
		}
	}
}

class Balance extends BigNumber {
	toJSON() {
		return {
			_type: 'Balance',
			data: this + 0
		}
	}
	add(b) {
		return new Balance(this + b)
	}
	sub(b) {
		return new Balance(this - b)
	}
	toPrimitive() {
		return this.toString(10)
	}
}

class Amount extends Balance { }
class Price extends Balance { }
class TokenBalance extends Balance { }

class TransactionEra {
	constructor(period, phase) {
		if (typeof period === 'number' && typeof phase === 'number') {
			this.period = 2 << Math.min(15, Math.max(1, Math.ceil(Math.log2(period)) - 1))
			this.phase = phase % this.period
		}
	}

	encode() {
		if (typeof this.period === 'number' && typeof this.phase === 'number') {
			let l = Math.min(15, Math.max(1, Math.ceil(Math.log2(this.period)) - 1))
			let factor = Math.max(1, this.period >> 12)
			let res = toLE((Math.floor(this.phase / factor) << 4) + l, 2)
			return res
		} else {
			return new Uint8Array([0])
		}
	}
}

class BtcBestHeader {
	constructor(number, hash) {
		if (number instanceof BlockNumber && hash instanceof Hash) {
			this.number = number;
			this.hash = hash;
		}
	}
	toJSON() {
		return {
			_type: 'BtcBestHeader',
			data: {
				'number': this.number,
				'hash': this.hash
			}
		}
	}
}


class BtcBlockHeader {
	constructor(version, parent, merkle, time, bits, nonce) {
		this.version = version
		this.previous_header_hash = parent
		this.merkle_root_hash = merkle
		this.time = time
		this.bits = bits
		this.nonce = nonce
	}
	toJSON() {
		return {
			_type: 'BtcBlockHeader',
			data: {
				'version': this.version,
				'previous_header_hash': this.previous_header_hash,
				'merkle_root_hash': this.merkle_root_hash,
				'merkle_root_hash': this.merkle_root_hash,
				'time': this.time,
				'bits': this.bits,
				'nonce': this.nonce
			}
		}
	}
}

class BtcAddress {
	constructor(kind, network, hash) {
		this.kind = kind
		this.network = network
		this.hash = hash
	}
	toJSON() {
		return {
			_type: 'BtcAddress',
			data: {
				'kind': this.kind,
				'network': this.network,
				'hash': this.hash
			}
		}
	}
}


class BtcUTXO {
	constructor(txid, index, balance, is_spent) {
		this.txid = txid
		this.index = index
		this.balance = balance
		this.is_spent = is_spent
	}
	toJSON() {
		return {
			_type: 'BtcUTXO',
			data: {
				'txid': this.txid.toHex(),
				'index': this.index,
				'balance': this.balance,
				'is_spend': this.is_spent
			}
		}
	}
}

class BtcTxType {
	constructor(txtype) {
		this.txtype = txtype
	}
	toName() {
		if (0 == this.txtype) {
			return 'Withdraw';
		} else if (1 == this.txtype) {
			return 'Deposit';
		} else if (2 == this.txtype) {
			return 'Register';
		} else if (3 == this.txtype) {
			return 'RegisterDeposit';
		}
		return 'NoDefind';
	}
	toJSON() {
		return {
			_type: 'BtcTxType',
			data: {
				'txtype': this.txtype
			}
		}
	}
}

class BtcTranscation {
	constructor() {

	}
	toJSON() {
		return {
			_type: 'BtcTranscation',
			data: {}
		}
	}
}

class OrderPair {
	constructor(first, second, precision) {
		this.first = first;
		this.second = second;
		this.precision = precision;
	}

	toString() {
		return this.first + '/' + this.second + '/' + this.precision;
	}
}

class Token {
	constructor(symbol, token_desc, precision) {
		this.symbol = symbol;
		this.token_desc = token_desc;
		this.precision = precision;
	}
	symbol() {
		return this.symbol.toString();
	}
}

class OrderT {

	constructor(pair, index, ordertype, user, amount, hasfill_amount, price, create_time, lastupdate_time, status, fill_index) {
		this.pair = pair;
		this.index = index;
		this.ordertype = ordertype;
		this.user = user;
		this.amount = amount;
		this.hasfill_amount = hasfill_amount;
		this.price = price;
		this.create_time = create_time;
		this.lastupdate_time = lastupdate_time;
		this.status = status;
		this.fill_index = fill_index;
	}

	toJSON() {
		return {
			_type: 'OrderT',
			data: {
				'pair': this.pair,
				'index': this.index,
				'ordertype': this.ordertype,
				'user': this.user,
				'amount': this.amount,
				'hasfill_amount': this.hasfill_amount,
				'price': this.price,
				'create_time': this.create_time,
				'lastupdate_time': this.lastupdate_time,
				'status': this.status,
				'fill_index': this.fill_index
			}
		}
	}
}

class FillT {
	constructor(pair, index, maker_user, taker_user, maker_user_order_index, taker_user_order_index, price, amount, maker_fee, taker_fee, time) {
		this.pair = pair;
		this.index = index;
		this.maker_user = maker_user;
		this.taker_user = taker_user;
		this.maker_user_order_index = maker_user_order_index;
		this.taker_user_order_index = taker_user_order_index;
		this.price = price;
		this.amount = amount;
		this.maker_fee = maker_fee;
		this.taker_fee = taker_fee;
		this.time = time;
	}

	toJSON() {
		return {
			_type: 'FillT',
			data: {
				'pair': this.pair,
				'index': this.index,
				'maker_user': this.maker_user,
				'taker_user': this.taker_user,
				'maker_user_order_index': this.maker_user_order_index,
				'taker_user_order_index': this.taker_user_order_index,
				'price': this.price,
				'amount': this.amount,
				'maker_fee': this.maker_fee,
				'taker_fee': this.taker_fee,
				'time': this.time
			}
		}
	}
}


class OrderType {
	constructor(_type) {

		switch (_type) {
			case 'Buy':
			case 0:
				this._type = 0;
				this.__type = 'Buy';
				break;
			case 'Sell':
			case 1:
				this._type = 1;
				this.__type = 'Sell';
				break;
			default:
				break;
		}

	}

	toString() {
		return this.__type;
	}
}

class OrderStatus {
	constructor(status) {
		switch (status) {
			case 0:
				this.status = 'FillNo';
				break;
			case 1:
				this.status = 'FillPart';
				break;
			case 2:
				this.status = 'FillAll';
				break;
			case 3:
				this.status = 'FillPartAndCancel';
				break;
			case 4:
				this.status = 'Cancel';
				break;
			default:
				this.status = 'NotDefined';
				break;
		}
	}
	toString() {
		return this.status;
	}

}

class TokenSymbol extends VecU8 { }
class Channel extends VecU8{}

function reviver(key, bland) {
	if (typeof bland == 'object' && bland) {
		switch (bland._type) {
			case 'VecU8':
				return new VecU8(bland.data);
			case 'AccountId':
				return new AccountId(bland.data);
			case 'Hash':
				return new Hash(bland.data);
			case 'VoteThreshold':
				return new VoteThreshold(bland.data);
			case 'SlashPreference':
				return new SlashPreference(bland.data);
			case 'Moment':
				return new Moment(bland.data);
			case 'Tuple':
				return new Tuple(bland.data);
			case 'Balance':
				return new Balance(bland.data);
			case 'BlockNumber':
				return new BlockNumber(bland.data);
			case 'AccountIndex':
				return new AccountIndex(bland.data);
		}
	}
	return bland;
}

class Struct extends Map {
	toJSON() {
		const json = {}
		for (const [key, value] of this.entries()) {
			if (typeof value !== 'object') {
				json[key] = value
			} else if (typeof value.toPrimitive === 'function') {
				json[key] = value.toPrimitive()
			} else if (typeof value.toJSON === 'function') {
				json[key] = value.toJSON()
			}
		}
		return json
	}
}

class IntentionProfsT extends Struct { }

class NominatorProfsT extends Struct { }

class NominationRecordT extends Struct { }

class MultiNodeIndexT extends Struct { }

class MatchNodeT extends Struct { }
class Bid extends Struct { }
class BidDetailT extends Struct { }
class FinancialRecord extends Struct { }
class NominationsT extends Struct { }

module.exports = {
	VecU8,
	AccountId,
	Hash,
	VoteThreshold,
	SlashPreference,
	Moment,
	Balance,
	BlockNumber,
	AccountIndex,
	Tuple,
	TransactionEra,
	reviver,
	BtcBestHeader,
	BtcBlockHeader,
	BtcAddress,
	BtcTxType,
	BtcTranscation,
	BtcUTXO,
	OrderPair,
	OrderType,
	Amount,
	Price,
	TokenSymbol,
	Token,
	TokenBalance,
	OrderT,
	OrderStatus,
	FillT,
	IntentionProfsT,
	NominatorProfsT,
	NominationRecordT,
	MultiNodeIndexT,
	MatchNodeT,
	Bid,
	BidDetailT,
	Channel,
	FinancialRecord,
	NominationsT
}