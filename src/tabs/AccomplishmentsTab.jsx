import { useState } from 'react';
import { accomplishmentCategoryLabels } from '../constants/categories.js';

export default function AccomplishmentsTab({ accomplishments, collections, onToggleFeatured, onDeleteAccomplishment, onEditAccomplishment }) {
  const [editAccomplishmentId, setEditAccomplishmentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('small');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCollectionIds, setEditCollectionIds] = useState([]);

  function startEditing(accomplishment) {
    setEditAccomplishmentId(accomplishment.id);
    setEditText(accomplishment.text);
    setEditCategory(accomplishment.category);
    setEditIsFeatured(accomplishment.isFeatured ?? false);
    setEditCollectionIds(accomplishment.collectionIds ?? []);
  }

  async function saveEdit() {
    const trimmedText = editText.trim();
    if (trimmedText === '') return;
    const wasSaved = await onEditAccomplishment(
      editAccomplishmentId,
      trimmedText,
      editCategory,
      editIsFeatured,
      editCollectionIds
    );
    if (!wasSaved) return;
    setEditAccomplishmentId(null);
    setEditText('');
    setEditCategory('small');
    setEditIsFeatured(false);
    setEditCollectionIds([]);
  }

  function cancelEdit() {
    setEditAccomplishmentId(null);
    setEditText('');
    setEditCategory('small');
    setEditIsFeatured(false);
    setEditCollectionIds([]);
  }

  function toggleCollectionSelection(collectionId) {
    setEditCollectionIds(currentIds =>
      currentIds.includes(collectionId)
        ? currentIds.filter(id => id !== collectionId)
        : [...currentIds, collectionId]
    );
  }

  return (
    <section>
      <p>Look how far you've come.</p>

      {accomplishments.length === 0 ? (
        <p>No accomplishments yet.</p>
      ) : (
        <ul className="entry-list">
          {accomplishments.map(accomplishment => {
            const isEditing = editAccomplishmentId === accomplishment.id;
            return (
              <li key={accomplishment.id} className="entry-card accomplishment-card">
                <h3 className={!isEditing ? 'accomplishment-title' : ''}>
                  {isEditing ? (
                    <input
                      value={editText}
                      placeholder="Edit accomplishment"
                      onChange={(e) => setEditText(e.target.value)}
                    />
                  ) : (
                    accomplishment.text
                  )}
                  {!isEditing && <span className="completed-check">✓</span>}
                </h3>

              {isEditing ? (
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="big">Big</option>
                  <option value="milestone">Milestone</option>
                </select>
              ) : (
                <small>
                  {accomplishmentCategoryLabels[accomplishment.category]} · Completed{' '}
                  {new Date(accomplishment.completedAt).toLocaleDateString()}
                </small>
              )}

              {isEditing && (
                <>
                  <div className="collection-row">
                    <p className="edit-label">Add to collections:</p>
                    <div className="entry-collections">
                      {collections.length === 0 ? (
                        <p>No collections available.</p>
                      ) : (
                        collections.map(collection => (
                          <span
                            key={collection.id}
                            className={
                              editCollectionIds.includes(collection.id)
                                ? 'collection-chip selected'
                                : 'collection-chip'
                            }
                            onClick={() => toggleCollectionSelection(collection.id)}
                          >
                            {collection.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <label>
                    <input
                      type="checkbox"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                    />
                    Feature on Profile
                  </label>
                </>
              )}

              <div className="entry-actions">
                {isEditing ? (
                  <>
                    <button type="button" onClick={saveEdit}>Save</button>
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => startEditing(accomplishment)}>Edit</button>
                    <button type="button" onClick={() => onDeleteAccomplishment(accomplishment.id)}>Delete</button>
                  </>
                )}
              </div>

            </li>
          );
        })}
        </ul>
      )}
    </section>
  );
}