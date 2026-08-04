import { useState } from 'react';
import { accomplishmentCategoryLabels, goalCategoryLabels } from '../constants/categories.js';

export default function CollectionsTab({collections, lifeLogEntries, goals, accomplishments,
  onAddCollection, onDeleteCollection, onEditCollection,}) {

  const [collectionName, setCollectionName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const selectedCollection = collections.find(collection => 
    collection.id === selectedCollectionId
  );

  const [editCollectionId, setEditCollectionId] = useState(null);
  const [editCollectionName, setEditCollectionName] = useState('');

  function startEditing(collection) {
    setEditCollectionId(collection.id);
    setEditCollectionName(collection.name);
  }
  async function saveEdit() {
    const trimmedName = editCollectionName.trim();
    if (trimmedName === '') return;
    const wasSaved = await onEditCollection(editCollectionId, trimmedName);
    if (!wasSaved)
    setEditCollectionId(null);
    setEditCollectionName('');
  }

  function getCollectionItems(collectionId) {
    return [
      ...lifeLogEntries
        .filter(entry => (entry.collectionIds ?? []).includes(collectionId))
        .map(entry => ({ ...entry, itemType: 'life-log', timelineDate: entry.createdAt ?? entry.id })),
      ...goals
        .filter(goal => (goal.collectionIds ?? []).includes(collectionId))
        .map(goal => ({ ...goal, itemType: 'goal', timelineDate: goal.createdAt ?? goal.id })),
      ...accomplishments
        .filter(accomplishment => (accomplishment.collectionIds ?? []).includes(collectionId))
        .map(accomplishment => ({
          ...accomplishment,
          itemType: 'accomplishment',
          timelineDate: accomplishment.completedAt ?? accomplishment.id,
        })),
    ].sort((a, b) => b.timelineDate - a.timelineDate);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = collectionName.trim();
    if (trimmedName === '') return;
    const wasAdded = await onAddCollection(trimmedName);
    if (!wasAdded) return;
    setCollectionName('');
  }

  if (selectedCollection) { /*edit mode */
    const collectionItems = getCollectionItems(selectedCollection.id)
    return (
      <section>
        <button type="button" onClick={()=>setSelectedCollectionId(null)}>
          Back to Collections
        </button>
        <h2>{selectedCollection.name}</h2>
        {collectionItems.length === 0 ? (
          <p>No items in this collection.</p>
        ) : (
          <div className="entry-list">
          {collectionItems.map(item => (
            <CollectionItem key={`${item.itemType}-${item.id}`} item={item}/>
            /* a goal and lifeLogEntry could have same ID, this ensures unique key */
          ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section>
      <p>Organize your entries into collections.</p>
      <form className="entry-form" onSubmit={handleSubmit}>
        <input
          value={collectionName}
          placeholder="Collection name"
          onChange={(e) => setCollectionName(e.target.value)}
        />
        <button type="submit">Add Collection</button>
      </form>

      {collections.length === 0 ? (
        <p>No collections yet.</p>
      ) : (
        <div className="collection-grid">
          {collections.map(collection => {
            const itemCount = getCollectionItems(collection.id).length;
            return (
              <article key={collection.id} className="collection-card">
                {editCollectionId === collection.id ? ( 
                  <> {/*if editing collection name*/}
                    <input
                      value={editCollectionName}
                      onChange={(e) => setEditCollectionName(e.target.value)}
                    />
                    <button onClick={saveEdit}>Save</button>
                  </>
                ) : (
                  <> {/*if displaying collection normally*/}
                    <h3>{collection.name}</h3>
                    <p>{itemCount} {itemCount === 1 ? 'item': 'items'}</p>
                    <div className="collection-actions">
                      <button type="button" onClick={()=>setSelectedCollectionId(collection.id)}>
                        Open
                      </button>
                      <button onClick={() => startEditing(collection)}>Rename</button>
                      <button onClick={() => onDeleteCollection(collection.id)}>Delete</button>
                    </div>
                  </> 
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CollectionItem({ item }) {
  return (
    <article className="entry-card">
      <small> 
        {/* display type of item and date */}
        {item.itemType === 'life-log' && 'Life Log'}
        {item.itemType === 'goal' && 'Goal'}
        {item.itemType === 'accomplishment' && 'Accomplishment'}
        {' · '}

        {new Date(item.timelineDate).toLocaleDateString()}
      </small>
      {item.itemType === 'life-log' ? (
        <>
          {item.title && <h3>{item.title}</h3>}
          <p>{item.text}</p>
        </>
      ) : (
        <>
          <h3>{item.text}</h3>
          <p>
            {item.itemType === 'goal'
              ? goalCategoryLabels[item.category]
              : accomplishmentCategoryLabels[item.category]}
          </p>
        </>
      )}
    </article>
  );
}
