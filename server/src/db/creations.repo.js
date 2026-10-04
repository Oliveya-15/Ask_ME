import { query } from './pool.js';

const COLUMNS = 'id, user_id, prompt, content, type, publish, likes, created_at, updated_at';

export async function createCreation({ userId, prompt, content, type, publish = false }) {
  const { rows } = await query(
    `INSERT INTO creations (user_id, prompt, content, type, publish)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
    [userId, prompt, content, type, publish],
  );
  return rows[0];
}

export async function listByUser(userId, limit = 100) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM creations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function listPublished(limit = 100) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM creations WHERE publish = TRUE AND type = 'image'
     ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByUserAndTypes(userId, types) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS count FROM creations WHERE user_id = $1 AND type = ANY($2::text[])',
    [userId, types],
  );
  return rows[0].count;
}

/** Atomically add/remove the user's like. Returns null when the creation isn't public/doesn't exist. */
export async function toggleLike(id, userId) {
  const { rows } = await query(
    `UPDATE creations
        SET likes = CASE WHEN $2 = ANY(likes) THEN array_remove(likes, $2) ELSE array_append(likes, $2) END
      WHERE id = $1 AND publish = TRUE
      RETURNING likes`,
    [id, userId],
  );
  if (!rows[0]) return null;
  return { likes: rows[0].likes, liked: rows[0].likes.includes(userId) };
}

/** Delete a specific creation ensuring it belongs to the authenticated user. */
export async function deleteCreation(id, userId) {
  const { rowCount } = await query(
    'DELETE FROM creations WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rowCount > 0;
}