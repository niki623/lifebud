import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/lifebud-logo.png';
import GoalsTab from './tabs/GoalsTab.jsx';
import { accomplishmentCategoryLabels, goalCategoryLabels } from './constants/categories.js';

const tabs = [
  'Profile',
  'Life Log', // {id: date.now(), title, text, isFeatured, collectionIds: []}
  'Goals', // {id: date.now(), text, category}
  'Accomplishments', // {id: date.now(), text, category, isFeatured, completedAt: date.now()}
  'Custom Collections', // {id: date.now(), collectionName, entryIds: []}
];
export default function App() {
  const [activeTab, setActiveTab] = useState('Profile');
  
  const [lifeLogEntries, setLifeLogEntries] = useState(() => {
    const savedEntries = localStorage.getItem('lifebud-life-log');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('lifebud-goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  const [accomplishments, setAccomplishments] = useState(() => {
    const savedAccomplishments = localStorage.getItem('lifebud-accomplishments');
    return savedAccomplishments ? JSON.parse(savedAccomplishments) : [];
  });
  const [collections, setCollections] = useState(() => {
    const savedCollections = localStorage.getItem('lifebud-collections');
    return savedCollections ? JSON.parse(savedCollections) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('lifebud-life-log', JSON.stringify(lifeLogEntries));
  }, [lifeLogEntries]);
  useEffect(() => {
    localStorage.setItem('lifebud-goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem('lifebud-accomplishments', JSON.stringify(accomplishments));
  }, [accomplishments]);
  useEffect(() => {
    localStorage.setItem('lifebud-collections', JSON.stringify(collections));
  }, [collections]);

  function addLifeLogEntry(title, entryText, isFeatured, collectionIds) {
    const newEntry = {id: Date.now(), title: title, text: entryText, createdAt: Date.now(),
      collectionIds, isFeatured: isFeatured, };
    setLifeLogEntries(currentEntries => [...currentEntries, newEntry]);
  }
  function deleteLifeLogEntry(entryId) {
    setLifeLogEntries(lifeLogEntries.filter(entry => entry.id !== entryId));
  }
  function editLifeLogEntry(entryId, newTitle, newText, newIsFeatured, newCollectionIds) {
    setLifeLogEntries(lifeLogEntries.map(entry => 
      entry.id === entryId ? {...entry, title: newTitle, text: newText, isFeatured: newIsFeatured, collectionIds: newCollectionIds} : entry
    ));
  }

  function addGoal(goalText, category, isFeatured) {
    const newGoal = {id: Date.now(), text: goalText, category: category, createdAt: Date.now(), //id determined by time added
      collectionIds: [], isFeatured}; 
    setGoals([...goals, newGoal]);
  }
  function deleteGoal(goalId) {
    setGoals(goals.filter(goal => goal.id !== goalId));
  }
  function completeGoal(goalId) {
    const completedGoal = goals.find(goal => goal.id === goalId);
    if (completedGoal) {
      setAccomplishments([...accomplishments, {...completedGoal, isFeatured: false, completedAt: Date.now()}]);
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  }
  function editGoal(goalId, newText, newCategory, newIsFeatured) {
    setGoals(goals.map(goal => 
      goal.id === goalId ? {...goal, text: newText, category: newCategory, isFeatured: newIsFeatured} : goal
    ));
  }

  function deleteAccomplishment(accomplishmentId) {
    setAccomplishments(accomplishments.filter(acc => acc.id !== accomplishmentId));
  }
  function toggleAccomplishmentFeatured(accomplishmentId) {
    setAccomplishments(accomplishments.map(acc => 
      acc.id === accomplishmentId ? {...acc, isFeatured: !acc.isFeatured} : acc
    ));
  }

  function addCollection(collectionName) {
    const newCollection = {id: Date.now(), name: collectionName, entryIds: []};
    setCollections([...collections, newCollection]);
  }
  function deleteCollection(collectionId) {
    setCollections(collections.filter(col => col.id !== collectionId));
  }

  return (
    <main>
      <header>
        <h1> 
          <img src={logo} alt="Lifebud Logo" className="lifebud-logo" />
          Lifebud
        </h1>
        <p>Your private space to remember, reflect, and grow.</p>
      </header>

      <nav className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active-tab' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      
      <section className="tab-content">
        {activeTab === 'Goals' ? (
          <GoalsTab goals={goals} onAddGoal={addGoal} onCompleteGoal={completeGoal} onDeleteGoal={deleteGoal} onEditGoal={editGoal} />
        ) : activeTab === 'Accomplishments' ? (
          <AccomplishmentsTab accomplishments={accomplishments} onToggleFeatured={toggleAccomplishmentFeatured} onDeleteAccomplishment={deleteAccomplishment} />
        ) : activeTab === 'Life Log' ? (
          <LifeLogTab lifeLogEntries={lifeLogEntries} collections={collections} onAddEntry={addLifeLogEntry} onDeleteEntry={deleteLifeLogEntry} onEditEntry={editLifeLogEntry} />
        ) : activeTab === 'Profile' ? (
          <ProfileTab entries={lifeLogEntries} goals={goals} accomplishments={accomplishments} />
        ) : activeTab === 'Custom Collections' ? (
          <CollectionsTab collections={collections} onAddCollection={addCollection} onDeleteCollection={deleteCollection} />
        ) : null}
      </section>
    </main>
  );
}

function LifeLogTab({ lifeLogEntries, collections, onAddEntry, onDeleteEntry, onEditEntry }) {
  const [title, setTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

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
    setSelectedCollectionIds(currentIds => 
      currentIds.includes(collectionId)
        ? currentIds.filter(id => id !== collectionId)
        : [...currentIds, collectionId]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedEntry = entryText.trim();
    if (trimmedEntry === '') return;
    onAddEntry(title, trimmedEntry, isFeatured, selectedCollectionIds);
    setTitle('');
    setEntryText('');
    setIsFeatured(false);
    setSelectedCollectionIds([]);
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
        <fieldset>
          <legend>Add to collections</legend>
          {collections.length === 0 ? (
            <p>No collections yet.</p>
          ) : (
            collections.map(collection => (
              <label key={collection.id}>
                <input
                  type="checkbox"
                  checked={selectedCollectionIds.includes(collection.id)}
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
              {editEntryId === entry.id ? (
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
              ) : (
                <>
                  {entry.title && <h3>{entry.title}</h3>} {/*render the heading only when entry.title is not empty*/}
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

function ProfileTab({ entries, goals, accomplishments }) {
  const featuredItems = [
    ...entries.filter(entry => entry.isFeatured)
    .map(entry => ({...entry, itemType: 'life-log', timelineDate: entry.createdAt})),

    ...goals.filter(goal => goal.isFeatured)
    .map(goal => ({...goal, itemType: 'goal', timelineDate: goal.createdAt})),

    ...accomplishments.filter(accomplishment => accomplishment.isFeatured)
    .map(accomplishment => ({...accomplishment, itemType: 'accomplishment', timelineDate: accomplishment.completedAt}))
  
  ].sort((a, b) => b.timelineDate - a.timelineDate);

  return (
    <section>
      <h2>Profile</h2>
      <p>What matters most to you.</p>

      {featuredItems.length === 0 ? (
        <p>Nothing featured yet.</p>
      ) : (
        <div className="entry-list">
          {featuredItems.map(item => (
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
    </section>
  );
}

function AccomplishmentsTab({ accomplishments, onToggleFeatured, onDeleteAccomplishment }) {
  return (
    <section>
      <h2>Accomplishments</h2>
      <p>Look how far you've come.</p>

      {accomplishments.length === 0 ? (
        <p>No accomplishments yet.</p>
      ) : (
        <ul className="entry-list">
          {accomplishments.map(accomplishment => (
            <li key={accomplishment.id} className="entry-card">
              {accomplishment.text} - ({accomplishmentCategoryLabels[accomplishment.category]}) 
              <small>(Completed:{''} {new Date(accomplishment.completedAt).toLocaleDateString()})</small>
              <label>
                <input type="checkbox" checked={accomplishment.isFeatured ?? false}
                  onChange={() => onToggleFeatured(accomplishment.id)}
                />
                <small>Feature on Profile</small>
              </label>
              <button onClick={() => onDeleteAccomplishment(accomplishment.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CollectionsTab({ collections, onAddCollection, onDeleteCollection }) {
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
