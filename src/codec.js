const {
	ss58Decode
} = require('./ss58')
const {
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
	BtcBestHeader,
	BtcBlockHeader,
	BtcAddress,
	BtcTxType,
	BtcTranscation,
	BtcUTXO,
	OrderPair,
	OrderType,
	TokenSymbol,
	Token,
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
	FinancialRecord,
	Nominations
} = require('./types')
const {
	toLE,
	leToNumber,
	hexToBytes,
	bytesToHex,
	stringToBytes
} = require('./utils')
//const metadata = require('./metadata')
const TextDecoder = process.browser ? window.TextDecoder : require('util').TextDecoder;

const transforms = {
	RuntimeMetadata: {
		outerEvent: 'OuterEventMetadata',
		modules: 'Vec<RuntimeModuleMetadata>'
	},
	RuntimeModuleMetadata: {
		prefix: 'String',
		module: 'ModuleMetadata',
		storage: 'Option<StorageMetadata>'
	},
	StorageFunctionModifier: {
		_enum: ['None', 'Default', 'Required']
	},
	StorageFunctionTypeMap: {
		key: 'Type',
		value: 'Type'
	},
	StorageFunctionType: {
		_enum: {
			Plain: 'Type',
			Map: 'StorageFunctionTypeMap'
		}
	},
	StorageFunctionMetadata: {
		name: 'String',
		modifier: 'StorageFunctionModifier',
		type: 'StorageFunctionType',
		documentation: 'Vec<String>'
	},
	StorageMetadata: {
		prefix: 'String',
		items: 'Vec<StorageFunctionMetadata>'
	},
	EventMetadata: {
		name: 'String',
		arguments: 'Vec<Type>',
		documentation: 'Vec<String>'
	},
	OuterEventMetadata: {
		name: 'String',
		events: 'Vec<(String, Vec<EventMetadata>)>'
	},
	ModuleMetadata: {
		name: 'String',
		call: 'CallMetadata'
	},
	CallMetadata: {
		name: 'String',
		functions: 'Vec<FunctionMetadata>'
	},
	FunctionMetadata: {
		id: 'u16',
		name: 'String',
		arguments: 'Vec<FunctionArgumentMetadata>',
		documentation: 'Vec<String>'
	},
	FunctionArgumentMetadata: {
		name: 'String',
		type: 'Type'
	},

	NewAccountOutcome: {
		_enum: ['NoHint', 'GoodHint', 'BadHint']
	},
	UpdateBalanceOutcome: {
		_enum: ['Updated', 'AccountKilled']
	},

	Transaction: {
		version: 'u8',
		sender: 'Address',
		signature: 'Signature',
		index: 'Index',
		era: 'TransactionEra',
		call: 'Call'
	},
	Phase: {
		_enum: {
			ApplyExtrinsic: 'u32',
			Finalization: undefined
		}
	},
	EventRecord: {
		phase: 'Phase',
		event: 'Event'
	}
};

var decodePrefix = 0;

function decode(input, type) {
	//console.log('decode='+type+' '+typeof type)

	if (typeof input.data === 'undefined') {
		input = {
			data: input
		};
	}
	if (typeof type === 'object') {
		return type.map(t => decode(input, t));
	}
	while (type.startsWith('T::')) {
		type = type.slice(3);
	}
	if (type == 'EventRecord<Event>') {
		type = 'EventRecord'
	}
	// if( '(H256, keys::Address, AccountId, BlockNumber, String, TxType)' == type.trim() )
	// {
	// 	console.log('len='+input.data.length)
	// 	for( var i=0;i<input.data.length;i++)
	// 		console.log(input.data[i])
	// 	//let dataHex = bytesToHex(input.data);
	// 	//console.log(decodePrefix + 'des >>>', type, dataHex);
	// }

	//	decodePrefix +=  "   ";

	let res;
	let transform = transforms[type];

	if (transform) {
		if (typeof transform == 'string') {
			res = decode(input, transform);
		} else if (typeof transform == 'object') {
			if (transform instanceof Array) {
				// just a tuple
				res = new Tuple(...decode(input, transform));
			} else if (!transform._enum) {
				// a struct
				res = {};
				Object.keys(transform).forEach(k => {
					res[k] = decode(input, transform[k]);
				});
			} else if (transform._enum instanceof Array) {
				// simple enum
				let n = input.data[0];
				input.data = input.data.slice(1);
				res = {
					option: transform._enum[n]
				};
			} else if (transform._enum) {
				// enum
				let n = input.data[0];
				input.data = input.data.slice(1);
				let option = Object.keys(transform._enum)[n];
				res = {
					option,
					value: typeof transform._enum[option] === 'undefined' ? undefined : decode(input, transform._enum[option])
				};
			}
		}
		res._type = type;
	} else {

		switch (type.trim()) {

			case 'Event':
				{
					let events = metadata.outerEvent.events
					let moduleIndex = decode(input, 'u8')
					let module = events[moduleIndex][0]
					let eventIndex = decode(input, 'u8')
					let name = events[moduleIndex][1][eventIndex].name
					let args = decode(input, events[moduleIndex][1][eventIndex].arguments)
					res = {
						_type: 'Event',
						module,
						name,
						args
					}
					break
				}
			case 'AccountId':
				{
					res = new AccountId(input.data.slice(0, 32));
					input.data = input.data.slice(32);
					break;
				}
			case 'H256':
			case 'Hash':
				{
					res = new Hash(input.data.slice(0, 32));
					input.data = input.data.slice(32);
					break;
				}
			case 'TokenBalance':
				{
					console.log(input.data)
					res = leToNumber(input.data.slice(0, 16));
					console.log(res)
					input.data = input.data.slice(16);
					res = new Balance(res);
					break;
				}
			case 'Amount':
			case 'Price':
			case 'Balance':
				{
					res = leToNumber(input.data.slice(0, 16));
					input.data = input.data.slice(16);
					res = new Balance(res);
					break;
				}
			case 'BlockNumber':
				{
					res = leToNumber(input.data.slice(0, 8));
					input.data = input.data.slice(8);
					res = new BlockNumber(res);
					break;
				}
			case 'AccountIndex':
				{
					res = leToNumber(input.data.slice(0, 4));
					input.data = input.data.slice(4);
					res = new AccountIndex(res);
					break;
				}
			case 'Moment':
				{
					let n = leToNumber(input.data.slice(0, 8));
					input.data = input.data.slice(8);
					res = new Moment(n);
					break;
				}
			case 'VoteThreshold':
				{
					const VOTE_THRESHOLD = ['SuperMajorityApprove', 'NotSuperMajorityAgainst', 'SimpleMajority'];
					res = new VoteThreshold(VOTE_THRESHOLD[input.data[0]]);
					input.data = input.data.slice(1);
					break;
				}
			case 'SlashPreference':
				{
					res = new SlashPreference(decode(input, 'u32'));
					break;
				}
			case 'Compact<u128>':
			case 'Compact<u64>':
			case 'Compact<u32>':
			case 'Compact<u16>':
			case 'Compact<u8>':
				{
					let len;
					if (input.data[0] % 4 == 0) {
						// one byte
						res = input.data[0] >> 2;
						len = 1;
					} else if (input.data[0] % 4 == 1) {
						res = leToNumber(input.data.slice(0, 2)) >> 2;
						len = 2;
					} else if (input.data[0] % 4 == 2) {
						res = leToNumber(inpuzt.data.slice(0, 4)) >> 2;
						len = 4;
					} else {
						let n = (input.data[0] >> 2) + 4;
						res = leToNumber(input.data.slice(1, n + 1));
						len = 5 + n;
					}
					input.data = input.data.slice(len);
					break;
				}
			case 'u8':
				res = leToNumber(input.data.slice(0, 1));
				input.data = input.data.slice(1);
				break;
			case 'u16':
				res = leToNumber(input.data.slice(0, 2));
				input.data = input.data.slice(2);
				break;
			case 'u32':
			case 'VoteIndex':
			case 'PropIndex':
			case 'ReferendumIndex':
				{
					res = leToNumber(input.data.slice(0, 4));
					input.data = input.data.slice(4);
					break;
				}
			case 'u64':
			case 'Index':
				{
					res = leToNumber(input.data.slice(0, 8));
					input.data = input.data.slice(8);
					break;
				}
			case 'BidId':
			case 'u128':
				{
					res = leToNumber(input.data.slice(0, 16));
					input.data = input.data.slice(16);
					break;
				}
			case 'bool':
				{
					res = !!input.data[0];
					input.data = input.data.slice(1);
					break;
				}
			case 'KeyValue':
				{
					res = decode(input, '(Vec<u8>, Vec<u8>)');
					break;
				}
			case 'Vec<bool>':
				{
					let size = decode(input, 'Compact<u32>');
					res = [...input.data.slice(0, size)].map(a => !!a);
					input.data = input.data.slice(size);
					break;
				}
			case 'TokenSymbol':
			case 'Vec<u8>':
				{
					let size = decode(input, 'Compact<u32>');
					res = input.data.slice(0, size);
					input.data = input.data.slice(size);
					break;
				}
			case 'String':
				{
					let size = decode(input, 'Compact<u32>');
					res = input.data.slice(0, size);
					input.data = input.data.slice(size);
					res = new TextDecoder("utf-8").decode(res);
					break;
				}
			case 'Type':
				{
					res = decode(input, 'String');
					while (res.indexOf('T::') != -1) {
						res = res.replace('T::', '');
					}
					res = res.match(/^Box<.*>$/) ? res.slice(4, -1) : res;
					break;
				}
			case 'BestHeader':
				{
					let n = leToNumber(input.data.slice(0, 4));
					n = new BlockNumber(n);
					input.data = input.data.slice(4);
					let h = new Hash(input.data.slice(0, 32));
					input.data = input.data.slice(32);
					res = new BtcBestHeader(n, h);
					break;
				}
			case 'BlockHeader':
				{
					//console.log(input.data)
					//input.data = input.data.slice(2);
					decode(input, 'Compact<u32>');
					let version = decode(input, 'u32');
					let parent = decode(input, 'H256');
					let merkle = decode(input, 'H256');
					let time = decode(input, 'u32');
					let bits = decode(input, 'u32');
					let nonce = decode(input, 'u32');


					res = new BtcBlockHeader(version, parent, merkle, time, bits, nonce);

					break;
				}
			case 'keys::Address':
				{

					let kind = leToNumber(input.data.slice(0, 1));
					kind = new BlockNumber(kind);
					input.data = input.data.slice(1);

					let network = leToNumber(input.data.slice(0, 1));
					network = new BlockNumber(kind);
					input.data = input.data.slice(1);

					let hash = new Hash(input.data.slice(0, 20));
					input.data = input.data.slice(20);

					res = new BtcAddress(kind, network, hash);
					break;
				}
			case 'TxType':
				{
					let txtype = leToNumber(input.data.slice(0, 1));
					res = new BtcTxType(txtype);
					input.data = input.data.slice(1);

					break;
				}
			case 'BTCTransaction':
				{
					res = new BtcTranscation();
					break;
				}
			case 'UTXO':
				{
					let txid = decode(input, 'H256');
					let index = decode(input, 'u32');
					let balance = decode(input, 'u64');
					let is_spent = decode(input, 'bool');

					res = new BtcUTXO(txid, index, balance, is_spent);
					break;
				}
			case 'Token':
				{
					let symbol = decode(input, 'Vec<u8>');
					let token_desc = decode(input, 'Vec<u8>');
					let precision = decode(input, 'u16');

					res = new Token(symbol, token_desc, precision);
					break;
				}
			case 'OrderPair':
				{
					let first = decode(input, 'Vec<u8>');
					let second = decode(input, 'Vec<u8>');
					let precision = decode(input, 'u32');

					res = new OrderPair(first, second, precision);
					break;
				}
			case 'OrderType':
				{

					let orderttype = decode(input, 'u8');
					res = new OrderType(orderttype);

					break;
				}
			case 'OrderStatus':
				{
					let status = decode(input, 'u8');
					res = new OrderStatus(status);
					break;
				}
			case 'OrderT<T>':
				{
					//console.log(input)
					let pair = decode(input, 'OrderPair');
					let index = decode(input, 'u64');
					let ordertype = decode(input, 'OrderType');
					let user = decode(input, 'AccountId');
					let amount = decode(input, 'Amount');
					let channel = decode(input, 'AccountId')
					let hasfill_amount = decode(input, 'Amount');
					let price = decode(input, 'Price');
					let create_time = decode(input, 'BlockNumber');
					let lastupdate_time = decode(input, 'BlockNumber');
					let status = decode(input, 'OrderStatus');
					let fill_index = decode(input, 'Vec<u128>');

					res = new OrderT(pair, index, ordertype, user, amount, channel, hasfill_amount, price, create_time, lastupdate_time, status, fill_index);

					break;
				}
			case 'FillT<T>':
				{
					let pair = decode(input, 'OrderPair');
					let index = decode(input, 'u128');
					let maker_user = decode(input, 'AccountId');
					let taker_user = decode(input, 'AccountId');
					let maker_user_order_index = decode(input, 'u64');
					let taker_user_order_index = decode(input, 'u64');
					let price = decode(input, 'Price');
					let amount = decode(input, 'Amount');
					let maker_fee = decode(input, 'Amount');
					let taker_fee = decode(input, 'Amount');
					let time = decode(input, 'BlockNumber');

					res = new FillT(pair, index, maker_user, taker_user, maker_user_order_index, taker_user_order_index, price, amount, maker_fee, taker_fee, time);

					break;
				}
			case 'IntentionProfs<AccountId, Balance, BlockNumber>':
				{
					res = new IntentionProfsT(new Map([
						['name', decode(input, 'Vec<u8>')],
						['url', decode(input, 'Vec<u8>')],
						['is_active', decode(input, 'bool')],
						['jackpot', decode(input, 'Balance')],
						['nominators', decode(input, 'Vec<AccountId>')],
						['total_nomination', decode(input, 'Balance')],
						['last_total_vote_weight', decode(input, 'u64')],
						['last_total_vote_weight_update', decode(input, 'BlockNumber')],
					]))
					break;
				}
			case 'NominatorProfs<AccountId, Balance>':
				{
					res = new NominatorProfsT(new Map([
						['total_nomination', decode(input, 'Balance')],
						['locked', decode(input, 'Balance')],
						['nominees', decode(input, 'Vec<AccountId>')],
					]))
					break;
				}
			case 'NominationRecord<Balance, BlockNumber>':
				{
					res = new NominationRecordT(new Map([
						['nomination', decode(input, 'Balance')],
						['last_vote_weight', decode(input, 'u64')],
						['last_vote_weight_update', decode(input, 'BlockNumber')],
					]))
					break;
				}
			case 'MultiNodeIndex<(OrderPair, OrderType), BidT<T>>':
				{
					res = new MultiNodeIndexT(new Map([
						['multi_key', decode(input, '(OrderPair, OrderType)')],
						['index', decode(input, 'u128')],

					]))
					break;
				}
			case 'Bid':
				{

					res = new Bid(new Map([
						['nodeid', decode(input, 'u128')],
						['price', decode(input, 'Price')],
						['sum', decode(input, 'Amount')],
						['list', decode(input, 'Vec<BidId>')],
					]))
					break;
				}
			case 'BidDetailT<T>':
				{
					res = new BidDetailT(new Map([
						['id', decode(input, 'BidId')],
						['pair', decode(input, 'OrderPair')],
						['order_type', decode(input, 'OrderType')],
						['user', decode(input, 'AccountId')],
						['order_index', decode(input, 'u64')],
						['price', decode(input, 'Price')],
						['amount', decode(input, 'Amount')],
						['time', decode(input, 'BlockNumber')],
					]))
					break;
				}
			case 'Node<BidT<T>>':
				{
					res = new MatchNodeT(new Map([
						['data', decode(input, 'Bid')],
						['prev', decode(input, 'Option<u128>')],
						['next', decode(input, 'Option<u128>')],
					]))
					break;
				}
			case 'Record<Symbol, TokenBalance, BlockNumber>':
				{

					res = new FinancialRecord(new Map([
						['action', decode(input, 'u8')],
						['symbol', decode(input, 'Symbol')],
						['balance', decode(input, 'Balance')],
						['init_blocknum', decode(input, 'BlockNumber')],
					]))
					break;
				}
			case 'Nominations<T>':
			{
				res = new Nominations(new Map([
					['data',decode(input,'CodecBTreeMap<(AccountId,NominationRecord<Balance, BlockNumber>)>')]
				]))
				break;
			}
			default:
				{
					let m= type.match(/CodecBTreeMap<(.*)>/);
					if( m ) {
						let size = decode(input, 'Compact<u32>');
						res = [...new Array(size)].map(() => decode(input, m[1]));
						break;
					}
					let v = type.match(/^Vec<(.*)>$/);
					if (v) {
						let size = decode(input, 'Compact<u32>');
						res = [...new Array(size)].map(() => decode(input, v[1]));
						break;
					}
					let o = type.match(/^Option<(.*)>$/);
					if (o) {
						let some = decode(input, 'bool');
						if (some) {
							res = decode(input, o[1]);
						} else {
							res = null;
						}
						break;
					}
					let t = type.match(/^\((.*)\)$/);
					if (t) {
						res = new Tuple(...decode(input, t[1].split(', ')));
						break;
					}
					throw 'Unknown type to decode: ' + type;
				}
		}
	}
	//	decodePrefix = decodePrefix.substr(3);
	//	console.log(decodePrefix + 'des <<<', type, res);
	return res;
}

function encode(value, type = null) {
	//console.log('encode='+type+','+typeof type+ ','+ value)
	// if an array then just concat
	if (type instanceof Array) {

		if (value instanceof Array) {
			let x = value.map((i, index) => encode(i, type[index]));
			let res = new Uint8Array();
			x.forEach(x => {
				r = new Uint8Array(res.length + x.length);
				r.set(res)
				r.set(x, res.length)
				res = r
			})
			return res
		} else {

			throw 'If type is array, value must be too'
		}
	}
	if (typeof value == 'object' && !type && value._type) {
		type = value._type
	}
	if (typeof type != 'string') {
		throw 'type must be either an array or a string'
	}

	if (typeof value == 'string' && value.startsWith('0x')) {
		value = hexToBytes(value)
	}

	if (transforms[type]) {
		let transform = transforms[type]
		if (transform instanceof Array) {
			// just a tuple
			return encode(value, transform)
		} else if (!transform._enum) {
			// a struct
			let keys = []
			let types = []
			Object.keys(transform).forEach(k => {
				keys.push(value[k])
				types.push(transform[k])
			})
			return encode(keys, types)
		} else if (transform._enum instanceof Array) {
			// simple enum
			return new Uint8Array([transform._enum.indexOf(value.option)])
		} else if (transform._enum) {
			// enum
			let index = Object.keys(transform._enum).indexOf(value.option)
			let value = encode(value.value, transform._enum[value.option])
			return new Uint8Array([index, ...value])
		}
	}

	// other type-specific transforms
	if (type == 'Vec<u8>' || type.trim() == 'Symbol') {
		if (typeof value == 'object' && value instanceof Uint8Array) {
			return new Uint8Array([...encode(value.length, 'Compact<u32>'), ...value])
		}
	}
	if (type.trim() == 'Channel') {
		if (typeof value == 'string') {
			return new Uint8Array([...encode(value.length, 'Compact<u32>'), ...value])
		}
	}

	if (type == 'Address' || type == 'RawAddress<AccountId, AccountIndex>' || type == 'Address<AccountId, AccountIndex>') {
		if (typeof value == 'string') {
			value = ss58Decode(value)
		}
		if (typeof value == 'object' && value instanceof Uint8Array && value.length == 32) {
			return new Uint8Array([0xff, ...value])
		}
		if (typeof value == 'number' || value instanceof AccountIndex) {
			if (value < 0xf0) {
				return new Uint8Array([value])
			} else if (value < 1 << 16) {
				return new Uint8Array([0xfc, ...toLE(value, 2)])
			} else if (value < 1 << 32) {
				return new Uint8Array([0xfd, ...toLE(value, 4)])
			} else if (value < 1 << 64) {
				return new Uint8Array([0xfe, ...toLE(value, 8)])
			}
		}
	}


	if ((type == 'AccountId') || (type.toString().trim() == 'AccountId')) {

		if (typeof value == 'string') {
			return ss58Decode(value);
		}
		if (value instanceof Uint8Array && value.length == 32) {
			return value
		}
	}

	if (typeof value == 'number') {
		switch (type.trim()) {
			case 'TokenBalance':
			case 'Price':
			case 'Amount':
			case 'Balance':
			case 'BidId':
			case 'u128':
				return toLE(value, 16)
			case 'Index':
			case 'u64':
				return toLE(value, 8)
			case 'AccountIndex':
			case 'u32':
				return toLE(value, 4)
			case 'u16':
				return toLE(value, 2)
			case 'u8':
				return toLE(value, 1)
			default:
				break
		}
	}

	if (value instanceof AccountIndex && type == 'AccountIndex') {
		return toLE(value, 4)
	}

	if (value instanceof Uint8Array) {
		if (type == 'Signature' && value.length == 64) {
			return value
		}
		if (type == 'Hash' && value.length == 32) {
			return value
		}
		if (type == 'H256' && value.length == 32) {
			return value
		}
	}

	if (type == 'TransactionEra' && value instanceof TransactionEra) {
		return value.encode()
	} else if (type == 'TransactionEra') {
		console.error("TxEra::encode bad", type, value)
	}

	if (type.match(/^Compact<u[0-9]*>$/)) {
		if (value < 1 << 6) {
			return new Uint8Array([value << 2])
		} else if (value < 1 << 14) {
			return toLE((value << 2) + 1, 2)
		} else if (value < 1 << 30) {
			return toLE((value << 2) + 2, 4)
		} else {
			var v = [3, ...toLE(value, 4)]
			let n = value >> 32
			while (n > 0) {
				v[0]++
				v.push(n % 256)
				n >>= 8
			}
			return new Uint8Array(v)
		}
	}

	if (type == 'bool') {
		return new Uint8Array([value ? 1 : 0])
	}

	if (typeof type == 'string' && type.match(/\(.*\)/)) {
		return encode(value, type.substr(1, type.length - 2).split(','))
	}

	if (type.trim() == 'OrderPair' && typeof value == 'object') {

		return new Uint8Array([...encode(value.first.length, 'Compact<u32>'), ...stringToBytes(value.first), ...encode(value.second.length, 'Compact<u32>'), ...stringToBytes(value.second), ...toLE(value.precision, 4)]);
	}
	if (type.trim() == 'Token' && typeof value == 'object') {

		return new Uint8Array([...encode(value.symbol.length, 'Compact<u32>'), ...stringToBytes(value.symbol), ...encode(value.token_desc.length, 'Compact<u32>'), ...stringToBytes(value.token_desc), ...toLE(value.precision, 2)]);
	}
	if (type.trim() == 'OrderType') {
		return toLE(value._type, 1);
	}


	// Maybe it's pre-encoded?
	if (typeof value == 'object' && value instanceof Uint8Array) {
		switch (type) {
			case 'Call':
				break
			default:
				console.warn(`Value passed apparently pre-encoded without whitelisting ${type}`)
		}
		return value
	}


	throw `Value cannot be encoded as type: ${value},${type}`
}

module.exports = {
	decode,
	encode
}