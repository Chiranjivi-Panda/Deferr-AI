/**
 * json-store.ts — Generic file-based JSON storage.
 *
 * Instead of a real database (PostgreSQL, MongoDB, etc.) we store data as
 * JSON files on disk.  This is perfect for prototyping and small projects:
 *   • No database setup required
 *   • Data is human-readable (just open the file!)
 *   • Easy to reset — delete the file and restart
 *
 * The JsonStore class is GENERIC (JsonStore<T>), meaning it works with any
 * TypeScript type — Task, CalendarEvent, or anything else.
 *
 * ⚠️  Limitation: This is NOT safe for concurrent writes from multiple
 *     processes.  For a single-server dev setup, it works great.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from '../config.js';

export class JsonStore<T extends Record<string, any>> {
  /** Full absolute path to the JSON file. */
  private filePath: string;

  /**
   * The name of the property used as the unique identifier.
   * For Tasks this is 'id', for CalendarEvents it's 'event_id'.
   */
  private keyField: string;

  /**
   * @param filename  — Just the filename, e.g. 'tasks.json'. Stored inside DATA_DIR.
   * @param keyField  — Which property is the primary key. Defaults to 'id'.
   */
  constructor(filename: string, keyField: string = 'id') {
    this.filePath = path.join(DATA_DIR, filename);
    this.keyField = keyField;
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  /**
   * Ensures the data directory and the JSON file exist.
   * If the file doesn't exist, it's created with an empty array `[]`.
   *
   * `{ recursive: true }` means mkdir will create parent directories too,
   * and won't throw if the directory already exists.
   */
  private async ensureFile(): Promise<void> {
    // Create the data/ directory if it doesn't exist yet.
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      // fs.access checks if the file exists and is readable.
      // If it throws, the file doesn't exist and we create it below.
      await fs.access(this.filePath);
    } catch {
      // File doesn't exist — create it with an empty JSON array.
      await fs.writeFile(this.filePath, '[]', 'utf-8');
    }
  }

  // ── Public CRUD Methods ─────────────────────────────────────────────────

  /**
   * Read every item from the JSON file.
   * Always returns an array (empty if the file was just created).
   */
  async readAll(): Promise<T[]> {
    await this.ensureFile();

    const raw = await fs.readFile(this.filePath, 'utf-8');

    // Parse the JSON string into a JavaScript array.
    // If the file is somehow corrupted, JSON.parse will throw,
    // which our error-handler middleware will catch.
    return JSON.parse(raw) as T[];
  }

  /**
   * Overwrite the entire file with the given array.
   * Uses 2-space indentation so the file is easy to read manually.
   */
  async writeAll(data: T[]): Promise<void> {
    await this.ensureFile();

    // JSON.stringify's third argument is the indentation level.
    // `null` for the second argument means "no custom replacer function".
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(this.filePath, json, 'utf-8');
  }

  /**
   * Find a single item by its primary key value.
   * Returns undefined if no item matches — the caller should handle that.
   */
  async findById(id: string): Promise<T | undefined> {
    const all = await this.readAll();

    // Array.find returns the first element where the callback is true.
    // We compare the item's key field to the given id.
    return all.find((item) => (item as Record<string, any>)[this.keyField] === id);
  }

  /**
   * Append a new item to the end of the array and save.
   */
  async add(item: T): Promise<void> {
    const all = await this.readAll();
    all.push(item);
    await this.writeAll(all);
  }

  /**
   * Merge partial updates into an existing item identified by its key field.
   *
   * Uses the spread operator to merge:
   *   { ...existingItem, ...updates }
   * This means any property in `updates` overwrites the same property in
   * the existing item, while properties not in `updates` are kept as-is.
   *
   * @returns The updated item, or undefined if no item was found with that id.
   */
  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const all = await this.readAll();

    // Find the index of the item to update.
    const index = all.findIndex(
      (item) => (item as Record<string, any>)[this.keyField] === id
    );

    // If not found, return undefined so the caller can handle it (e.g. 404).
    if (index === -1) {
      return undefined;
    }

    // Merge the updates into the existing item.
    // The spread operator copies all properties from the existing item first,
    // then overwrites with any properties from `updates`.
    all[index] = { ...all[index], ...updates };

    await this.writeAll(all);
    return all[index];
  }

  /**
   * Remove an item by its key field value.
   * @returns true if an item was deleted, false if no match was found.
   */
  async delete(id: string): Promise<boolean> {
    const all = await this.readAll();

    // Filter creates a NEW array with only the items that DON'T match the id.
    const filtered = all.filter(
      (item) => (item as Record<string, any>)[this.keyField] !== id
    );

    // If lengths are the same, nothing was removed.
    if (filtered.length === all.length) {
      return false;
    }

    await this.writeAll(filtered);
    return true;
  }
}
