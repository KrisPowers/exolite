# Apiro DB

A lightweight, zero-dependency, encrypted data store for Node.js.

No configuration. No secrets. Just import and use.

---

## Features

* Zero dependencies
* Fully asynchronous API
* AES-256-GCM encrypted storage
* Automatic key generation
* Machine-bound encryption
* Human-unreadable data at rest
* Simple, familiar database methods

---

## Installation

```bash
npm install apiro-db
```

---

## Usage

```js
import { SecureStore } from "apiro-db";

const db = new SecureStore({
  file: "./data.db", // Optional
});

await db.set("coins", 100);
await db.add("coins", 25);
await db.push("items", "shield");

console.log(await db.get("coins")); // 125
```

---

## Configuration

| Option   | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| `file`   | string | No       | Path to the encrypted data file     |

---

## API Reference

### `get(key)`

Returns the value stored under the key.

### `set(key, value)`

Sets a value for the key.

### `delete(key)`

Deletes a key and returns `true` if it existed.

### `add(key, number)`

Adds a number to an existing numeric value.

### `subtract(key, number)`

Subtracts a number from a value.

### `push(key, value)`

Pushes a value onto an array.

### `has(key, value) or has(key)`

Checks for a value in a directory, or for the directory itself.

---

## Security

* Uses AES-256-GCM authenticated encryption
* Key derivation via `scrypt`
* Tamper detection built in
* No plaintext data stored on disk
* No external crypto dependencies

---

## Limitations

* Single-file storage
* Not designed for concurrent multi-process writes
* Entire store is encrypted as a single unit

---

## License

MIT
