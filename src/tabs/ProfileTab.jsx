import {goalCategoryLabels, accomplishmentCategoryLabels} from '../constants/categories.js';
import {useState} from 'react';
import logo from '../assets/lifebud-logo.png';

export default function ProfileTab({ profile, onUpdateProfile, entries, goals, accomplishments }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [imageData, setImageData] = useState(profile.imageData)
  const [isEditing, setIsEditing] = useState(false);

  const featuredItems = [
    ...entries.filter(entry => entry.isFeatured)
    .map(entry => ({...entry, itemType: 'life-log', timelineDate: entry.createdAt})),

    ...goals.filter(goal => goal.isFeatured)
    .map(goal => ({...goal, itemType: 'goal', timelineDate: goal.createdAt})),

    ...accomplishments.filter(accomplishment => accomplishment.isFeatured)
    .map(accomplishment => ({...accomplishment, itemType: 'accomplishment', timelineDate: accomplishment.completedAt}))
  
  ].sort((a, b) => b.timelineDate - a.timelineDate);

  function handleProfileSubmit(e) {
    e.preventDefault();
    onUpdateProfile({...profile, name: name.trim(), bio: bio.trim(), imageData})
    setIsEditing(false);
  }
  function startEditingProfile() {
    setName(profile.name ?? '');
    setBio(profile.bio ?? '');
    setImageData(profile.imageData ?? '');
    setIsEditing(true);
  }
  function cancelEditingProfile() {
    setName(profile.name ?? '');
    setBio(profile.bio ?? '');
    setImageData(profile.imageData ?? '');
    setIsEditing(false);
  }

  function readImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert('Please choose an image smaller than 2 MB.');
      return;
    }
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
          <img src={imageData||logo} alt="Profile preview" className="profile-image"/>
          <button type="button" onClick={()=>setImageData('')}>Remove Photo</button>
          <input type="file" accept="image/*" onChange={readImageFile}/>
          <input type="text" value={name} placeholder="Your Name" onChange={(e)=>setName(e.target.value)} />
          <textarea value={bio} placeholder="Write a short bio" onChange={(e)=>setBio(e.target.value)} />
          <button type="submit">Save Profile</button>
          <button type="button" onClick={cancelEditingProfile}> Cancel </button>
        </form>
      ) : (
        <div className="profile-header">
          <img src={profile.imageData || logo} alt={profile.imageData ? 'Profile' : 'Default Lifebud profile'}
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
    </section>
  );
}