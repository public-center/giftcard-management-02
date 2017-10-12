import Batch from './batch.model';

/**
 * Get all batches (admin)
 */
export function getAllBatches(req, res) {
  Batch.find()
  .then(batches => res.json(batches))
}
