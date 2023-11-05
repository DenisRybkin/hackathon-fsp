const {randomUUID} = require('node:crypto');
const {Client} = require('pg');

const cl = new Client({
	host: '127.0.0.1',
	port: 5432,
	database: "r-journal1",
	password: 'deniskaSUPER12345',
	user: "postgres"
})

async function main() {
	await cl.connect()

	for (let i = 0; i < 90000; i++){
		await cl.query(
			'INSERT INTO "FakeTable" (id, name, json) VALUES ($1, $2, $3)',
			[randomUUID(), `${Math.random()}`, JSON.stringify({test: 123, sukae: "blyat", teste: 123, suka: "blyat", test2: 123, sukav: "blyat"})]
		)
	}

	cl.end()
}

main()