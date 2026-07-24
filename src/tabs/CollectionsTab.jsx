import { useState } from 'react';
import { accomplishmentCategoryLabels, goalCategoryLabels } from '../constants/categories.js';

export default function CollectionsTab({
  collections,
  lifeLogEntries,
  goals,
  accomplishments = [],
  onAddCollection,
  onDeleteCollection,
}) {
  const [collectionName, setCollectionName] = useState('');

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

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = collectionName.trim();
    if (trimmedName === '') return;
    onAddCollection(trimmedName);
    setCollectionName('');
  }

  return (
    <section>
      <h2>Custom Collections</h2>
      <p>Organize your entries into collections.</p>
      <form onSubmit={handleSubmit}>
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
            const collectionItems = getCollectionItems(collection.id);

            return (
              <article key={collection.id} className="collection-card">
                <h3>{collection.name}</h3>
                {collectionItems.length === 0 ? (
                  <p>No items in this collection.</p>
                ) : (
                  <div className="collection-items">
                    {collectionItems.map(item => (
                      <article key={`${item.itemType}-${item.id}`} className="entry-card">
                        <small>
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
                    ))}
                  </div>
                )}
                <button onClick={() => onDeleteCollection(collection.id)}>Delete</button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
