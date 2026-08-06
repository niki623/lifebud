import { useState, useRef } from 'react';

function readImageFile(fileInput, updateImageData, updateImageFile) {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return;
  if (file.size > 2 * 1024 * 1024) { /*reject large files*/
    alert('Please choose an image smaller than 2 MB.');
    fileInput.value = '';
    return;
  }
  updateImageFile(file);
  const reader = new FileReader(); /*FileReader tool reads content of file*/
  reader.onload = () => { /*set image data after reading(wait for reader.readAsDataURL(file))*/
    updateImageData(reader.result);
  }
  reader.readAsDataURL(file) /*convert image to string */

}

export default function LifeLogTab({ lifeLogEntries, collections, onAddEntry, onDeleteEntry, onEditEntry }) {
  const [title, setTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [collectionIds, setCollectionIds] = useState([]);
  const [imageData, setImageData] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [editEntryId, setEditEntryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCollectionIds, setEditCollectionIds] = useState([]);
  const [editImageData, setEditImageData] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const editFileInputRef = useRef(null);

  const [shouldRemoveEditImage, setShouldRemoveEditImage] = useState(false)

  function handleImageChange(e) {
    readImageFile(e.target, setImageData, setImageFile)
  }
  function handleEditImageChange(e) {
    readImageFile(e.target, setEditImageData, setEditImageFile);
    setShouldRemoveEditImage(false);
  }

  function removeSelectedImage() {
    setImageData('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
  function removeEditImage() {
    setEditImageData('');
    setEditImageFile(null);
    setShouldRemoveEditImage(true);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  }

  function startEditingEntry(entry) {
    setEditEntryId(entry.id);
    setEditTitle(entry.title);
    setEditText(entry.text);
    setEditIsFeatured(entry.isFeatured ?? false);
    setEditCollectionIds(entry.collectionIds ?? []);
    setEditImageData(entry.imageData ?? '');
    setEditImageFile(null);
    setShouldRemoveEditImage(false);
  }
  async function saveEdit(){
    const trimmedTitle = editTitle.trim();
    const trimmedText = editText.trim();
    if (trimmedTitle==='' && trimmedText==='' && editImageData === '') return;
    const wasSaved = await onEditEntry(
      editEntryId, editTitle, trimmedText, editIsFeatured, editCollectionIds, 
      editImageData, editImageFile, shouldRemoveEditImage);
    if (!wasSaved) return;
    setEditEntryId(null);
  }

  function toggleCollectionSelection(collectionId) {
    setCollectionIds(currentIds => 
      currentIds.includes(collectionId)
        ? currentIds.filter(id => id !== collectionId)
        : [...currentIds, collectionId]
    );
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedEntry = entryText.trim();
    if (trimmedTitle === '' && trimmedEntry === '' && imageData==='') return;
    const wasSaved = await onAddEntry(
      trimmedTitle, trimmedEntry, isFeatured, collectionIds, imageData, imageFile);
    if (!wasSaved) return;
    setTitle('');
    setEntryText('');
    setIsFeatured(false);
    setCollectionIds([]);
    setImageData('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <section>
        <p>Slow down and reflect.</p>

      <form className="entry-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          placeholder="Entry Title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          value={entryText}
          placeholder="Write your thoughts here"
          onChange={(e) => setEntryText(e.target.value)}
        />
        <label>
          Add photo
          <input className="file-input" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}/>
        </label>
        {imageData && (
          <>
            <img src={imageData} alt="Entry preview" className="entry-image-preview"/>
            <button type="button" onClick={removeSelectedImage}>
              Remove Photo
            </button>
          </>
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
      
      {/*Display entries*/}
      {lifeLogEntries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <ul className="entry-list">
          {lifeLogEntries.map(entry => {
            const isEditing = editEntryId === entry.id;

            return (
              <li key={entry.id} className="entry-card">
                {/*Title*/}
                <h3>
                  {isEditing ? (
                    <input
                      value={editTitle}
                      placeholder="Entry Title (optional)"
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  ) : (
                    entry.title
                  )}
                </h3>
              
              {/*Text*/}
              {isEditing ? (
                <textarea
                  value={editText}
                  placeholder="Write your thoughts here"
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <p>{entry.text}</p>
              )}

              {/*Image*/}
              {(isEditing? editImageData : entry.imageData) && ( //render image at all?
                <img 
                  src={isEditing ? editImageData : entry.imageData} //if so, which image?
                  alt={entry.title || 'Life Log entry'} 
                  className="entry-image"
                />
              )}

              {isEditing && (
                <>
                  <label>
                    Change photo
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      ref={editFileInputRef}
                    />
                  </label>
                  {editImageData && (
                    <button type="button" onClick={removeEditImage}>
                      Remove Photo
                    </button>
                  )}

                  <div className="collection-row">
                    <p className="edit-label">Add to collections:</p>

                    <div className="entry-collections">
                      {collections.map(collection => (
                        <span
                          key={collection.id}
                          className={
                            editCollectionIds.includes(collection.id)
                              ? "collection-chip selected"
                              : "collection-chip"
                          }
                          onClick={() => {
                            setEditCollectionIds(current =>
                              current.includes(collection.id)
                                ? current.filter(id => id !== collection.id)
                                : [...current, collection.id]
                            );
                          }}
                        >
                          {collection.name}
                        </span>
                      ))}
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

              <small>{new Date(entry.createdAt).toLocaleDateString()}</small>

              <div className="entry-actions">
                {isEditing ? (
                  <>
                    <button type="button" onClick={saveEdit}>Save</button>
                    <button type="button" onClick={() => setEditEntryId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => startEditingEntry(entry)}>
                      Edit
                    </button>

                    <button type="button" onClick={() => onDeleteEntry(entry.id)}>
                      Delete
                    </button>
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
