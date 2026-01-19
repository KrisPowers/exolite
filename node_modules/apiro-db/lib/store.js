const crypto = require("crypto");
const { readFile, writeFile } = require("./file");
const { encrypt, decrypt } = require("./crypto");
const { generateMasterKey, encryptMasterKey, decryptMasterKey } = require("./masterKey");
const {
  getByPath,
  setByPath,
  deleteByPath
} = require("./path");

class SecureStore {
  constructor(options = {}) {
    this.file = options.file || "./secure.db";
    this.data = {};
    this.masterKey = null;
    this.ready = this._init();
  }

  async _init() {
    const existing = await readFile(this.file);

    if (!existing) {
      this.masterKey = crypto.randomBytes(32);
      const encryptedKey = encryptMasterKey(this.masterKey);

      const payload = encrypt(JSON.stringify({}), this.masterKey);

      await writeFile(this.file, JSON.stringify({
        _meta: { key: encryptedKey },
        payload
      }));

      return;
    }

    const parsed = JSON.parse(existing);
    this.masterKey = decryptMasterKey(parsed._meta.key);
    const decrypted = decrypt(parsed.payload, this.masterKey);
    this.data = JSON.parse(decrypted);
  }

  async _save() {
    const payload = encrypt(JSON.stringify(this.data), this.masterKey);

    await writeFile(this.file, JSON.stringify({
      _meta: { key: encryptMasterKey(this.masterKey) },
      payload
    }));
  }

  async get(key) {
    await this.ready;
    return getByPath(this.data, key);
  }

  async set(key, value) {
    await this.ready;
    setByPath(this.data, key, value);
    await this._save();
    return value;
  }

  async delete(key) {
    await this.ready;
    const existed = deleteByPath(this.data, key);
    await this._save();
    return existed;
  }

  async add(key, amount) {
    await this.ready;

    let current = getByPath(this.data, key);
    if (typeof current !== "number") current = 0;

    const next = current + amount;
    setByPath(this.data, key, next);

    await this._save();
    return next;
  }

  async subtract(key, amount) {
    await this.ready;

    let current = getByPath(this.data, key);
    if (typeof current !== "number") current = 0;

    const next = current - amount;
    setByPath(this.data, key, next);

    await this._save();
    return next;
  }

  async push(key, value) {
    await this.ready;

    let arr = getByPath(this.data, key);
    if (!Array.isArray(arr)) arr = [];

    arr.push(value);
    setByPath(this.data, key, arr);

    await this._save();
    return arr;
  }

  async has(path, value) {
    await this.ready;

    const current = getByPath(this.data, path);

    if (current === undefined) return false;

    if (value === undefined) return true;

    // If current is an array, check includes
    if (Array.isArray(current)) {
      return current.includes(value);
    }

    return current === value;
  }

}

module.exports = { SecureStore };
