import { useState } from 'react';

export default function LifeLogTab({ lifeLogEntries, collections, onAddEntry, onDeleteEntry, onEditEntry }) {
  const [title, setTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [collectionIds, setCollectionIds] = useState([]);
  const [imageData, setImageData] = useState('');

  const [editEntryId, setEditEntryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCollectionIds, setEditCollectionIds] = useState([]);

  function startEditingEntry(entry) {
    setEditEntryId(entry.id);
    setEditTitle(entry.title);
    setEditText(entry.text);
    setEditIsFeatured(entry.isFeatured ?? false);
    setEditCollectionIds(entry.collectionIds ?? []);
  }
  function saveEdit(){
    const trimmedText = editText.trim();
    if(trimmedText === '') return;
    onEditEntry(editEntryId, editTitle, trimmedText, editIsFeatured, editCollectionIds);
    setEditEntryId(null);
  }

  function toggleCollectionSelection(collectionId) {
    setCollectionIds(currentIds => 
      currentIds.includes(collectionId)
        ? currentIds.filter(id => id !== collectionId)
        : [...currentIds, collectionId]
    );
  }

  function handleImageChange(e) {
    const file = e.target.files[0] /*0 for "first selected file"*/
    if (!file) {setImageData(''); return;}
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader(); /*FileReader tool reads content of file*/
    reader.onload = () => { /*set image data after reading(wait for reader.readAsDataURL(file))*/
      setImageData(reader.result);
    }
    reader.readAsDataURL(file) /*convert image to string */
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedEntry = entryText.trim();
    if (trimmedEntry === '') return;
    onAddEntry(title, trimmedEntry, isFeatured, collectionIds, imageData);
    setTitle('');
    setEntryText('');
    setIsFeatured(false);
    setCollectionIds([]);
    setImageData('')
  }

  return (
    <section>
      <h2>Life Log</h2>
      <p>Slow down and reflect.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          placeholder="Entry Title (optional)"
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          value={entryText}
          placeholder="Write your thoughts here"
          onChange={(e) => setEntryText(e.target.value)}
        />
        <label>
          Add photo
          <input type="file" accept="image/*" onChange={handleImageChange}/>
        </label>
        {imageData && ( 
          <img src={imageData} alt="Entry preview" className="entry-image-preview"/>
        )}

        <fieldset>
          <legend>Add to collections</legend>
          {collections.length === 0 ? (
            <p>No collections yet.</p>
          ) : (
            collections.map(collection => (
              <label key={collection.id}>
                <input
                  type="checkbox"
                  checked={collectionIds.includes(collection.id)}
                  onChange={() => toggleCollectionSelection(collection.id)}
                />
                {collection.name}
              </label>
            ))
          )}
        </fieldset>
        <label>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Feature on Profile
        </label>
        <button type="submit">Add Entry</button>
      </form>

      {lifeLogEntries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <ul className="entry-list">
          {lifeLogEntries.map(entry => (
            <li key={entry.id} className="entry-card">
              {editEntryId === entry.id ? ( /*edit mode*/
                <>
                  <input
                    value={editTitle}
                    placeholder="Entry Title (optional)"
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    value={editText}
                    placeholder="Write your thoughts here"
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <fieldset>
                    <legend>Add to collections</legend>
                    {collections.length === 0 ? (
                      <p>No collections yet.</p>
                    ) : ( 
                      collections.map(collection => (
                        <label key={collection.id}>
                          <input
                            type="checkbox"
                            checked={editCollectionIds.includes(collection.id)}
                            onChange={() => {
                              setEditCollectionIds(currentIds => 
                                currentIds.includes(collection.id)
                                  ? currentIds.filter(id => id !== collection.id)
                                  : [...currentIds, collection.id]
                              );
                            }}
                          />
                          {collection.name}
                        </label>
                      ))
                    )}
                  </fieldset>
                  <label>
                    <input
                      type="checkbox"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                    />
                    Feature on Profile
                  </label>  
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditEntryId(null)}>Cancel</button>
                </>
              ) : ( /*normal mode*/
                <>
                  {entry.title && <h3>{entry.title}</h3>} {/*render the heading only when entry.title is not empty*/}
                  {entry.imageData && (
                    <img src={entry.imageData} alt={entry.title || 'Life Log entry'} className="entry-image"/>
                  )}

                  <p>{entry.text}</p>
                  <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
                  <button onClick={() => startEditingEntry(entry)}>Edit</button>
                  {' '}
                  <button onClick={() => onDeleteEntry(entry.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
