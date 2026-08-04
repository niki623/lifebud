import {goalCategoryLabels, accomplishmentCategoryLabels} from '../constants/categories.js';
import {useState} from 'react';
import defaultProfile from '../assets/default-profile.png';

export default function ProfileTab({ profile, onUpdateProfile, entries, onExportBackup, onImportBackup, goals, accomplishments }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [imageFile, setImageFile] = useState(null); //actual file for supabase
  const [imageData, setImageData] = useState(profile.imageData) //image preview in browser (string)
  const [isEditing, setIsEditing] = useState(false); 
  //True: no picture, false: replace or use old picture
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);  

  const featuredItems = [
    ...entries.filter(entry => entry.isFeatured)
    .map(entry => ({...entry, itemType: 'life-log', timelineDate: entry.createdAt})),

    ...goals.filter(goal => goal.isFeatured)
    .map(goal => ({...goal, itemType: 'goal', timelineDate: goal.createdAt})),

    ...accomplishments.filter(accomplishment => accomplishment.isFeatured)
    .map(accomplishment => ({...accomplishment, itemType: 'accomplishment', timelineDate: accomplishment.completedAt}))
  
  ].sort((a, b) => b.timelineDate - a.timelineDate);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    const wasSaved = await onUpdateProfile({
      name: name.trim(), bio: bio.trim(), imageData, imageFile, shouldRemoveImage})
    if (wasSaved) {
      setIsEditing(false);
    }
  }
  function startEditingProfile() {
    setName(profile.name ?? '');
    setBio(profile.bio ?? '');
    setImageFile(null);
    setImageData(profile.imageData ?? '');
    setIsEditing(true);
    setShouldRemoveImage(false);
  }
  function cancelEditingProfile() {
    setName(profile.name ?? '');
    setBio(profile.bio ?? '');    
    setImageFile(null);
    setImageData(profile.imageData ?? '');
    setIsEditing(false);
    setShouldRemoveImage(false);
  }

  function readImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert('Please choose an image smaller than 2 MB.');
      return;
    }
    setImageFile(file);
    setShouldRemoveImage(false);

    const reader = new FileReader(); 
    reader.onload = () => { 
      setImageData(reader.result);
    }
    reader.readAsDataURL(file) /*convert image to string */
  }

  return (
    <section>
      {isEditing ? (
        <form className="entry-form" onSubmit={handleProfileSubmit}>
          <img src={imageData||defaultProfile} alt="Profile preview" className="profile-image"/>
          <button type="button" onClick={()=>{setImageData(''); setImageFile(null); setShouldRemoveImage(true)}}>
            Remove Photo
          </button>
          <input type="file" accept="image/*" onChange={readImageFile}/>
          <input type="text" value={name} placeholder="Your Name" onChange={(e)=>setName(e.target.value)} />
          <textarea value={bio} placeholder="Write a short bio" onChange={(e)=>setBio(e.target.value)} />
          <button type="submit">
            Save Profile
          </button>
          <button type="button" onClick={cancelEditingProfile}> 
            Cancel 
          </button>
        </form>
      ) : (
        <div className="profile-header">
          <img src={profile.imageData || defaultProfile} alt={profile.imageData ? 'Profile' : 'Default Lifebud profile'}
            className="profile-image"/>     
        <div>
          <h3>{profile.name || 'Your name'}</h3>
          {profile.bio && <p>{profile.bio}</p>}
        </div>     
        
        <button type="button" onClick={startEditingProfile} className='edit-profile-button'>
          Edit Profile</button>
        </div>
      )}

      {/*----------*/}

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
                  {item.imageData && (
                    <img src={item.imageData} alt={item.title || 'Life Log entry'} className="entry-image"/>
                  )}
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
      <section className="backup-section">
        <h3>Data Backup</h3>
        <p>Download a copy of all your Lifebud data.</p>
        <button type="button" onClick={onExportBackup}>
          Export Backup
        </button>
        <input type="file" accept=".json,application/json" onChange={onImportBackup}/>
      </section>
    </section>
  );
}