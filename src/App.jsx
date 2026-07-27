import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/lifebud-logo.png';
import GoalsTab from './tabs/GoalsTab.jsx';
import AccomplishmentsTab from './tabs/AccomplishmentsTab.jsx';
import CollectionsTab from './tabs/CollectionsTab.jsx';
import LifeLogTab from './tabs/LifeLogTab.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';
import { loadData, saveData } from './services/storage.js';

const tabs = [
  'Profile',
  'Life Log', // {id: date.now(), title, text, isFeatured, collectionIds: [], imageData}
  'Goals', // {id: date.now(), text, category}
  'Accomplishments', // {id: date.now(), text, category, isFeatured, completedAt: date.now()}
  'Custom Collections', // {id: date.now(), collectionName, entryIds: []}
];

function removeCollectionFromItems(items, collectionId) {
  return items.map(item => ({
    ...item,
    collectionIds: (item.collectionIds ?? []).filter(id => id !== collectionId),
  }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Profile');

  const [profile, setProfile] = useState(()=>
    loadData('lifebud-profile',{name:'',bio:'',imageData:''})
  );
  const [lifeLogEntries, setLifeLogEntries] = useState(() => 
    loadData('lifebud-life-log',[])
  );
  const [goals, setGoals] = useState(() => 
    loadData('lifebud-goals',[])
  );
  const [accomplishments, setAccomplishments] = useState(() => 
    loadData('lifebud-accomplishments',[])
  );
  const [collections, setCollections] = useState(() => 
    loadData('lifebud-collections',[])
  );
  
  useEffect(() => {saveData('lifebud-profile',profile);}, [profile]);
  useEffect(() => {saveData('lifebud-life-log', lifeLogEntries);}, [lifeLogEntries]);
  useEffect(() => {saveData('lifebud-goals', goals);}, [goals]);
  useEffect(() => {saveData('lifebud-accomplishments', accomplishments);}, [accomplishments]);
  useEffect(() => {saveData('lifebud-collections', collections);}, [collections]);

  function updateProfile(updatedProfile) {
    setProfile(updatedProfile);
  }

  function addLifeLogEntry(title, text, isFeatured, collectionIds, imageData) {
    const newEntry = {id: Date.now(), title, text, createdAt: Date.now(),
      collectionIds, isFeatured, imageData };
    setLifeLogEntries(currentEntries => [...currentEntries, newEntry]);
  }
  function deleteLifeLogEntry(entryId) {
    setLifeLogEntries(lifeLogEntries.filter(entry => entry.id !== entryId));
  }
  function editLifeLogEntry(entryId, newTitle, newText, newIsFeatured, newCollectionIds, newImageData) {
    setLifeLogEntries(lifeLogEntries=>
      lifeLogEntries.map(entry => entry.id === entryId ? 
        {...entry, title: newTitle, text: newText, isFeatured: newIsFeatured, 
        collectionIds: newCollectionIds, imageData: newImageData} : entry
    ));
  }

  function addGoal(goalText, category, isFeatured, collectionIds) {
    const newGoal = {id: Date.now(), text: goalText, category, createdAt: Date.now(), //id determined by time added
      collectionIds, isFeatured}; 
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
  function editGoal(goalId, newText, newCategory, newIsFeatured, newCollectionIds) {
    setGoals(goals.map(goal => 
      goal.id === goalId ? {...goal, text: newText, category: newCategory, isFeatured: newIsFeatured, collectionIds: newCollectionIds} : goal
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
    // Remove the collection from all associated items
    setLifeLogEntries(removeCollectionFromItems(lifeLogEntries, collectionId));
    setGoals(removeCollectionFromItems(goals, collectionId));
    setAccomplishments(removeCollectionFromItems(accomplishments, collectionId));
  }
  function editCollection(collectionId, newName) {
    setCollections(collections.map(col => 
      col.id === collectionId ? {...col, name: newName} : col
    ));
  }

  function exportBackup() {
    const backup = {version: 1, exportedAt: new Date().toISOString(), profile,
      lifeLogEntries, goals, accomplishments, collections,}; /*page data*/

    const backupText = JSON.stringify(backup, null, 2); /*convert to string*/
    const file = new Blob([backupText], { /*create temporary file*/
      type: 'application/json',
    });
    const fileUrl = URL.createObjectURL(file); /*create temporary URL for file*/
    const link = document.createElement('a'); /*create download link*/
    link.href = fileUrl; /*make download link point to URL*/
    link.download = `lifebud-backup-${new Date() /*give the file a name*/
      .toISOString()
      .slice(0, 10)}.json`;
    link.click(); /*trigger the download*/
    URL.revokeObjectURL(fileUrl); /*clean up temporary URL*/
  }

  function importBackup(e) {
    const file = e.target.files[0]; /*get file*/
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result); /*convert to JSON object*/
        const isValidBackup = backup.profile && Array.isArray(backup.lifeLogEntries) &&
          Array.isArray(backup.goals) && Array.isArray(backup.accomplishments) &&
          Array.isArray(backup.collections);
        if (!isValidBackup) {throw new Error('Invalid Lifebud backup')}

        const shouldImport = window.confirm(
          'Importing this backup will replace your current Lifebud data. Continue?'
        );
        if (!shouldImport) {
          fileInput.value = '';
          return;
        }

        /*replace current app data with imported data*/
        setProfile(backup.profile);
        setLifeLogEntries(backup.lifeLogEntries);
        setGoals(backup.goals);
        setAccomplishments(backup.accomplishments);
        setCollections(backup.collections);
        alert('Backup imported successfully.');
        
      } catch (error) {
        console.error(error);
        alert('This file is not a valid Lifebud backup.');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
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
          <button key={tab} className={activeTab === tab ? 'tab active-tab' : 'tab'}
            onClick={() => setActiveTab(tab)}> {tab} </button>
        ))}
      </nav>
      
      <section className="tab-content">
        {activeTab === 'Profile' ? (
          <ProfileTab 
            profile={profile}
            onUpdateProfile={updateProfile}
            entries={lifeLogEntries} 
            onExportBackup={exportBackup}
            onImportBackup={importBackup}
            goals={goals} 
            accomplishments={accomplishments} />
        ) : activeTab === 'Life Log' ? (
          <LifeLogTab 
            lifeLogEntries={lifeLogEntries} 
            collections={collections} 
            onAddEntry={addLifeLogEntry} 
            onDeleteEntry={deleteLifeLogEntry} 
            onEditEntry={editLifeLogEntry} />
        ) : activeTab === 'Goals' ? (
          <GoalsTab 
            goals={goals} 
            collections={collections}
            onAddGoal={addGoal} 
            onCompleteGoal={completeGoal} 
            onDeleteGoal={deleteGoal} 
            onEditGoal={editGoal} />
        ) : activeTab === 'Accomplishments' ? (
          <AccomplishmentsTab 
            accomplishments={accomplishments} 
            onToggleFeatured={toggleAccomplishmentFeatured} 
            onDeleteAccomplishment={deleteAccomplishment} />
        ) : activeTab === 'Custom Collections' ? (
          <CollectionsTab 
            collections={collections} 
            lifeLogEntries={lifeLogEntries}
            goals={goals}
            accomplishments={accomplishments}
            onAddCollection={addCollection} 
            onDeleteCollection={deleteCollection} 
            onEditCollection={editCollection} />
        ) : null}
      </section>
    </main>
  );
}
