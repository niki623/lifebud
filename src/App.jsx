import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/lifebud-logo.png';
import GoalsTab from './tabs/GoalsTab.jsx';
import AccomplishmentsTab from './tabs/AccomplishmentsTab.jsx';
import CollectionsTab from './tabs/CollectionsTab.jsx';
import LifeLogTab from './tabs/LifeLogTab.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';

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