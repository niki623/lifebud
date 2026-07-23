import { useState } from "react";

export default function CollectionsTab({ collections, onAddCollection, onDeleteCollection }) {
  const [collectionName, setCollectionName] = useState('');
  function handleSubmit(e) { 
    e.preventDefault();
    const trimmedName = collectionName.trim();
    if(trimmedName === '') return;
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
          {collections.map(collection => (
            <article key={collection.id} className="collection-card">
              <h3>{collection.name}</h3>
              <p>0 items</p>
              <button onClick={() => onDeleteCollection(collection.id)}>Delete</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );  
}