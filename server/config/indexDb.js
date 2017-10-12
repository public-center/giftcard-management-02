/**
 * Create indexes for a schema
 * @param schema Mongoose schema
 * @param indexes Array of indexes to create
 */
export default function createIndexes(schema, indexes) {
  for (const index of indexes) {
    schema.index(index[0], index.length > 1 ? index[1] : null);
  }
}
