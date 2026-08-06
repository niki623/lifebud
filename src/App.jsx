import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/lifebud-logo.png';
import GoalsTab from './tabs/GoalsTab.jsx';
import AccomplishmentsTab from './tabs/AccomplishmentsTab.jsx';
import CollectionsTab from './tabs/CollectionsTab.jsx';
import LifeLogTab from './tabs/LifeLogTab.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';

import { loadData, saveData } from './services/storage.js';
import {supabase} from './lib/supabase.js'
import AuthForm from './components/AuthForm.jsx';

//imagePath created and used in App.jsx only, imageData exists in state but not supabase
const tabs = [
  'Profile', // {name, bio, imagePath, imageData}
  'Life Log', // {id, title, text, isFeatured, createdAt, collectionIds, imagePath, imageData}
  'Goals', // {id, text, category, isFeatured, createdAt, collectionIds}
  'Accomplishments', // {id, text, category, isFeatured, createdAt, completedAt, collectionIds}
  'Custom Collections', // {id, name, createdAt}
];

function removeCollectionFromItems(items, collectionId) {
  return items.map(item => ({
    ...item,
    collectionIds: (item.collectionIds ?? []).filter(id => id !== collectionId),
  }));
}

async function handleLogout() {
  const {error} = await supabase.auth.signOut();
  if (error) console.error('Logout failed:', error);
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const [profile, setProfile] = useState({
    name:'',bio:'',imagePath: '', imageData:''});
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
  const [isLoading, setIsLoading] = useState(false);

  async function withLoading(action) {
    setIsLoading(true);
    try {
      return await action();
    } finally {
      setIsLoading(false);
    }
  }

  /* run once (for initial render, log in/out) */
  useEffect(() => { 
    async function loadSession() { /* only runs once when app starts */
      try {
        const {data} = await supabase.auth.getSession(); /* checks supabase if alr logged in */
        setSession(data.session); /* set session (either object or null) */
      } catch (error) {
        console.error('Could not load Supabase session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    }
    loadSession();

    const {
      data: {subscription}, /* listener for log in/out*/
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession); /* set session for when user logs in/out */
    });

    return () => {
      subscription.unsubscribe(); /*stop listening when app disappears*/
    };
  },[]);

  /* Ensure user's supabase profile row exists -> update state. */
  useEffect(() => { 
    /* returns for log out/first render */
    if (!session) return;

    /*for log in*/
    async function loadProfile() {
      const {data, error} = await supabase
        .from('profiles')
        .upsert( 
          {id: session.user.id}, /*choose the profile row you’re trying to create/use. */
          {onConflict: 'id'} /* If this profile ID already exists, use that row*/
        )
        .select('name, bio, image_path')
        .single()
      if (error) {
        console.error('Could not create profile:', error);
        return;
      }
      /* Copy the database values into React state. */
      setProfile(currentProfile => ({
        ...currentProfile,
        name: data.name ?? '',
        bio: data.bio ?? '',
        imagePath: data.image_path ?? ''
      }));
    }
    loadProfile();
  }, [session])  

  /* turn "imagePath" into a displayable signed URL */
  /* URL is temporary, imagePath remains unchanged */
  useEffect(()=>{
    if (!profile.imagePath) return;
    async function loadProfileImage() {
      const {data, error} = await supabase.storage
        .from('lifebud-images')
        .createSignedUrl(profile.imagePath, 60*60); //URL lasts one hour
      if (error) {
        console.error('Could not load profile image', error);
        return;
      }
      setProfile(currentProfile=>({
        ...currentProfile, imageData: data.signedUrl
      }));
    }
    loadProfileImage();
  }, [profile.imagePath])
  
  /* load user's goals */
  useEffect(()=> {
    if (!session) return;
    async function loadGoals() {
      const {data, error} = await supabase
        .from('goals')
        .select(`id, text, category, is_featured, created_at,
          goal_collection_memberships(collection_id)`)
        .eq('user_id', session.user.id)
        .order('created_at', {ascending: false})
      if (error) {
        console.error('Could not load goals:', error);
        return;
      }
      setGoals(data.map(goal=>({
        id: goal.id, text: goal.text, category: goal.category, isFeatured: goal.is_featured, 
        createdAt: new Date(goal.created_at).getTime(), 
        collectionIds: goal.goal_collection_memberships.map(membership=>membership.collection_id),
      })));
    }
    loadGoals();
  }, [session]) 

  /* load user's accomplishments */
  useEffect(()=>{
    if (!session) return;
    
    async function loadAccomplishments() {
      const {data, error} = await supabase
        .from('accomplishments')
        .select(`id, text, category, is_featured, created_at, completed_at,
          accomplishment_collection_memberships(collection_id)`)
        .eq('user_id', session.user.id)
        .order('completed_at', {ascending: false});
      if (error) {
        console.error('Could not load accomplishments:', error);
        return;
      }

      setAccomplishments(
        data.map(accomplishment => ({
          id: accomplishment.id, text: accomplishment.text, category: accomplishment.category,
          isFeatured: accomplishment.is_featured, createdAt: new Date(accomplishment.created_at).getTime(),
          completedAt: new Date(accomplishment.completed_at).getTime(), 
          collectionIds: accomplishment.accomplishment_collection_memberships.map(
            membership=>membership.collection_id),
        }))
      );
    }
  loadAccomplishments();
}, [session]);
  
  /* load user's collections */
  useEffect(()=> {
    if (!session) return;
    async function loadCollections() {
      const {data, error} = await supabase
        .from('collections')
        .select('id, name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', {ascending: false})
      if (error) {
        console.error('Could not load collections:', error);
        return;
      }
      setCollections(data.map(collection=>({
        id:collection.id, name:collection.name, 
        createdAt: new Date(collection.created_at).getTime()})))
    }
    loadCollections();
  }, [session])
  
  /* load user's life log entries */
  useEffect(() => {
    if (!session) return;

    async function loadLifeLogEntries() {
      //load all entries
      const { data: entriesData, error: entriesError } =
        await supabase
          .from('life_log_entries')
          .select(`id, title, text, image_path, is_featured, created_at, 
            life_log_collection_memberships (collection_id)` //converts into array of {collection_id: collection_name}
          )
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
      if (entriesError) {
        console.error('Could not load Life Log entries:',entriesError);
        return;
      }

      //create URLs
      const formattedEntries = await Promise.all( //waits until all URLs are ready
        entriesData.map(async(entry)=>{
          let imageData = '';
          if (entry.image_path) {
            const {data:signedUrlData, error: signedUrlError} =
              await supabase.storage
                .from('lifebud-images')
                .createSignedUrl(entry.image_path, 60*60) 
            if (signedUrlError) {
              console.error('Could not create signed URL:', signedUrlError)
            } else {
              imageData = signedUrlData.signedUrl
            }
          }
          return {id: entry.id, title: entry.title ?? '', text: entry.text ?? '', imagePath: entry.image_path ?? '',
            imageData, isFeatured: entry.is_featured, createdAt: new Date(entry.created_at).getTime(),
            collectionIds: entry.life_log_collection_memberships.map(membership=>membership.collection_id)
          }
        })
      )

      setLifeLogEntries(formattedEntries);
    }

    loadLifeLogEntries();
  }, [session]);

  /* update app/supabase profile */
  async function updateProfile(updatedProfile) {
    if (!session) return false;
    return withLoading(async () => {
      const newName = updatedProfile.name.trim();
      const newBio = updatedProfile.bio.trim();
      let newImagePath = profile.imagePath;
      let uploadedPath = null; //newly uploaded file to remove in case of failure
    //if keeping old photo, do nothing for image stuff. else either remove old photo or add new one

    //fix newImagePath
    if (updatedProfile.shouldRemoveImage) { //remove old photo only
      newImagePath='';
    } else if (updatedProfile.imageFile) { //add new photo 
      const extension = updatedProfile.imageFile.name.split('.').pop() || 'jpg';
      const imagePath = `${session.user.id}/profile/${crypto.randomUUID()}.${extension}`
      const {data: uploadData, error: uploadError} = 
        await supabase.storage
          .from('lifebud-images')
          .upload(imagePath, updatedProfile.imageFile, {contentType: updatedProfile.imageFile.type});
      if (uploadError) {
        console.error('Could not upload profile image:', uploadError);
        return false;
      }
      newImagePath = uploadData.path;
      uploadedPath = uploadData.path;
    }

    //update supabase profile
    const {error} = await supabase 
      .from('profiles')
      .update({
        name: updatedProfile.name || null,
        bio: updatedProfile.bio || null,
        image_path: newImagePath || null,
        updated_at: new Date().toISOString(),
    }).eq('id', session.user.id);
    if (error) {
      console.error('Could not update profile:', error);
      //undo image upload if saving the profile failed
      if (uploadedPath) {
        await supabase.storage
          .from('lifebud-images')
          .remove([uploadedPath]);
      }
      return false;
    }

    //delete old picture?
    if (profile.imagePath && ( //if old image exists AND
      updatedProfile.shouldRemoveImage || //user removed photo OR
      (uploadedPath && profile.imagePath !== uploadedPath) // user replaced photo
    )) {
      const {error: removeOldImageError} = 
        await supabase.storage
          .from('lifebud-images')
          .remove([profile.imagePath]);
      if (removeOldImageError) {
        console.error('Could not delete old profile image:', removeOldImageError)
      }
    }

    setProfile(currentProfile => ({
      ...currentProfile,
      name: newName,
      bio: newBio,
      imagePath: newImagePath,
      imageData: updatedProfile.shouldRemoveImage
        ? '' //no image
        : updatedProfile.imageData, //replaced image
    }));
      return true;
    });
  }

  async function addLifeLogEntry(title, text, isFeatured, collectionIds, imageData, imageFile) {
    if (!session) return false;
    return withLoading(async () => {
      const entryId = crypto.randomUUID();
    let imagePath = '';
    let signedImageUrl = imageData;

    if (imageFile) {
      //upload image
      const extension = imageFile.name.split('.').pop() || 'jpg';
      const storagePath = `${session.user.id}/life-log/${entryId}/${crypto.randomUUID()}.${extension}`;
      const {data: uploadData, error: uploadError} = await supabase.storage
        .from('lifebud-images')
        .upload(storagePath, imageFile, {contentType: imageFile.type,});
      if (uploadError) {
        console.error('Could not upload Life Log image:',uploadError);
        return false;
      }
      imagePath = uploadData.path;
    
      //get signed url
      const {data: signedUrlData, error: signedUrlError} = 
        await supabase.storage
          .from('lifebud-images')
          .createSignedUrl(imagePath, 60*60);
      if (signedUrlError) {
        console.error('Could not create signed URL:', signedUrlError);
        return false;
      }
      signedImageUrl = signedUrlData.signedUrl;
    }

    //add entry to supabase
    const {data, error} = await supabase
      .from('life_log_entries')
      .insert({
        id: entryId,
        user_id: session.user.id, 
        title:title.trim() || null,
        text:text.trim() || null,
        image_path: imagePath || null,
        is_featured: isFeatured,
      })
      .select('id, title, text, is_featured, created_at')
      .single();
    if (error) {
      console.error('Could not add Life Log entry:', error);
      //remove image if can't add life log entry
      if (imagePath) {
        await supabase.storage
          .from('lifebud-images')
          .remove([imagePath]);
      }
      return false;
    }

    //add to life_log_collection_memberships
    if (collectionIds.length > 0) {
      const membershipRows = collectionIds.map(collectionId => ({
        life_log_entry_id: data.id,
        collection_id: collectionId,
      }));
      const {error: membershipError} = await supabase 
        .from('life_log_collection_memberships')
        .insert(membershipRows);

      if (membershipError) {
        console.error('Could not save Life Log collections:', membershipError);
        //if error, remove the entry AND picture
        await supabase
          .from('life_log_entries')
          .delete()
          .eq('id', data.id);
        if (imagePath) { 
          await supabase.storage
            .from('lifebud-images')
            .remove([imagePath]);
        }
        return false;
      }
    }

    const newEntry = {id: data.id, title: data.title ?? '', text: data.text ?? '',
      isFeatured: data.is_featured, createdAt: new Date(data.created_at).getTime(),
      collectionIds, imagePath, imageData: signedImageUrl,
    };

    setLifeLogEntries(currentEntries => [
      newEntry,
      ...currentEntries,
    ]);
    return true;
    });
  }

  async function editLifeLogEntry(entryId, newTitle, newText, newIsFeatured, 
    newCollectionIds, newImageData, newImageFile, shouldRemoveImage) {
    if (!session) return false;
    return withLoading(async () => {
      const currentEntry = lifeLogEntries.find(entry=>entry.id===entryId);
      if (!currentEntry) return false;
      let newImagePath = currentEntry.imagePath;
      let uploadedPath = null;
      
      //update newImagePath 
      if (shouldRemoveImage) { //remove image ONLY
        newImagePath = '';
      } else if (newImageFile) { //replace image
        const extension = newImageFile.name.split('.').pop() || 'jpg';
        const storagePath = `${session.user.id}/life-log/${entryId}/${crypto.randomUUID()}.${extension}`;
        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from('lifebud-images')
            .upload(storagePath, newImageFile, {
              contentType: newImageFile.type,
            });
        if (uploadError) {
          console.error('Could not upload Life Log image:', uploadError);
          return false;
        }
        newImagePath = uploadData.path;
        uploadedPath = uploadData.path;
      }

      //update supabase
      const { data, error } = await supabase
        .from('life_log_entries')
        .update({
          title: newTitle.trim() || null,
          text: newText.trim() || null,
          image_path: newImagePath || null,
          is_featured: newIsFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select('id, title, text, is_featured, created_at')
        .single();
      if (error) {
        console.error('Could not edit Life Log entry:', error);
        if (uploadedPath) {
          await supabase.storage
            .from('lifebud-images')
            .remove([uploadedPath]);
        }
        return false;
      }
      
      //delete old picture?
      if (currentEntry.imagePath && ( //if old image exists AND
        shouldRemoveImage || //user removed photo OR
        (uploadedPath && currentEntry.imagePath !== uploadedPath) // user replaced photo
      )) {
        const {error: removeOldImageError} = await supabase.storage
          .from('lifebud-images')
          .remove([currentEntry.imagePath]);
        if (removeOldImageError) {
          console.error('Could not delete old Life Log image:', removeOldImageError)
        }
      }

      //delete all membership rows for this entry
      const {error: deleteMembershipsError} = await supabase
        .from('life_log_collection_memberships')
        .delete()
        .eq('life_log_entry_id', entryId);
      if (deleteMembershipsError) {
        console.error('Could not remove old Life Log collections:', deleteMembershipsError);
        return false;
      }
      //add new set of membership rows
      if (newCollectionIds.length>0) {
        const newMembershipRows = newCollectionIds.map(collectionId=>({
          life_log_entry_id: entryId,
          collection_id: collectionId,
        }));
        const {error: insertMembershipsError} = await supabase
          .from('life_log_collection_memberships')
          .insert(newMembershipRows);
        if (insertMembershipsError) {
          console.error('Could not save new Life Log collections:', insertMembershipsError);
          return false;
        }
      }

      setLifeLogEntries(currentEntries => currentEntries.map(entry => entry.id === entryId
        ? {...entry, title: data.title ?? '',text: data.text ?? '', isFeatured: data.is_featured, 
          collectionIds: newCollectionIds, imagePath: newImagePath, 
          imageData: shouldRemoveImage? '' : newImageData}
        : entry
      )
    );

      return true;
    });
  }
  async function deleteLifeLogEntry(entryId) {
    const entryToDelete = lifeLogEntries.find(entry=>entry.id===entryId);
    if (!entryToDelete) return false;

    // if image exists, delete
    if (entryToDelete.imagePath) {
      const {error: removeImageError} = await supabase.storage
        .from('lifebud-images')
        .remove([entryToDelete.imagePath]);
      if (removeImageError) {
        console.error('Could not delete Life Log image:', removeImageError);
        return false;
      }
    }
    //delete database row
    if (!session) return false;
    const { error } = await supabase
      .from('life_log_entries')
      .delete()
      .eq('id', entryId);
    if (error) {
      console.error('Could not delete Life Log entry:', error);
      return false;
    }
    //update state
    setLifeLogEntries(currentEntries =>
      currentEntries.filter(entry => entry.id !== entryId));
  return true;
  }

  async function addGoal(goalText, category, isFeatured, collectionIds) {
    if (!session) return false;
    return withLoading(async () => {
      const {data, error} = await supabase
      .from('goals')
      .insert({user_id: session.user.id, text:goalText, category, is_featured:isFeatured})
      .select('id,text,category,is_featured,created_at') 
      .single();
    if (error) {
      console.error('Could not add goal:', error);
      return false;
    }

    //add to goal_collection_memberships
    if (collectionIds.length > 0) {
      const membershipRows = collectionIds.map(collectionId => ({
        goal_id: data.id,
        collection_id: collectionId,
      }));
      const {error: membershipError} = await supabase 
        .from('goal_collection_memberships')
        .insert(membershipRows);

      if (membershipError) {
        console.error('Could not save goal collections:', membershipError);
        //if error, remove the entry so it isn't only partially saved
        await supabase
          .from('goals')
          .delete()
          .eq('id', data.id);
        return false;
      }
    }

    const newGoal = {id:data.id, text:data.text, category:data.category, isFeatured:data.is_featured,
      createdAt: new Date(data.created_at).getTime(), collectionIds,
    }
    setGoals(currentGoals => [newGoal, ...currentGoals]);
      return true;
    });
  }
  async function completeGoal(goalId) {
    if (!session) return false;

    const completedGoal = goals.find(goal=>goal.id===goalId);
    if (!completedGoal) return false;
    const {data, error: insertError} = await supabase
      .from('accomplishments')
      .insert({user_id: session.user.id, text: completedGoal.text, category: completedGoal.category,
        is_featured: false, created_at: new Date(completedGoal.createdAt).toISOString()})
      .select('id, text, category, is_featured, created_at, completed_at')
      .single();
    if (insertError) {
      console.error('Could not complete goal:', insertError);
      return false;
    }
    const {error: deleteError} = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);
    if (deleteError) {
      console.error('Could not remove complete goal:', deleteError);
      return false;
    }
    const newAccomplishment = {id:data.id, text:data.text, category: data.category, 
      isFeatured: data.is_featured, createdAt: new Date(data.created_at).getTime(), 
      completedAt: new Date(data.completed_at).getTime(), collectionIds:completedGoal.collectionIds ?? [],
    };
    setAccomplishments(current=>[newAccomplishment, ...current]);

    //transfer goal collections to accomplishment collections
    const completedGoalCollectionIds = completedGoal.collectionIds ?? [];
    if (completedGoalCollectionIds.length > 0) {
      const membershipRows = completedGoalCollectionIds.map(
        collectionId => ({accomplishment_id: data.id, collection_id: collectionId,})
      )
      const { error: membershipError } = await supabase
        .from('accomplishment_collection_memberships')
        .insert(membershipRows);
      if (membershipError) {
        console.error('Could not transfer goal collections:',membershipError);
        await supabase
          .from('accomplishments')
          .delete()
          .eq('id', data.id);
        return false;
      }
    }
    setGoals(current=>current.filter(goal=>goal.id!==goalId));
    return true;
  }
  async function editGoal(goalId, newText, newCategory, newIsFeatured, newCollectionIds) {
    if (!session) return false;
    return withLoading(async () => {
      const {data, error} = await supabase
      .from('goals')
      .update({text:newText, category: newCategory, is_featured: newIsFeatured, updated_at: new Date().toISOString(),})
      .eq('id', goalId)
      .select('id, text, category, is_featured, created_at')
      .single()
    if (error) {
      console.error('Could not edit goal:',error);
      return false;
    }

    //delete all collections for this entry
    const {error: deleteMembershipsError} = await supabase
      .from('goal_collection_memberships')
      .delete()
      .eq('goal_id', goalId);
    if (deleteMembershipsError) {
      console.error('Could not remove old goal collections:', deleteMembershipsError);
      return false;
    }
    //add new set of collections
    if (newCollectionIds.length>0) {
      const newMembershipRows = newCollectionIds.map(collectionId=>({
        goal_id: goalId,
        collection_id: collectionId,
      }))
      const {error: insertMembershipsError} = await supabase
        .from('goal_collection_memberships')
        .insert(newMembershipRows)
      if (insertMembershipsError) {
        console.error('Could not save new goal collections:', insertMembershipsError);
        return false;
      } 
    }

    setGoals(currentGoals => currentGoals.map(goal=> goal.id === goalId
      ? {...goal, text:data.text, category: data.category, isFeatured: data.is_featured, 
        collectionIds: newCollectionIds,}
      : goal
    ))
      return true;
    });
  }
  async function editAccomplishment(accomplishmentId, newText, newCategory, newIsFeatured, newCollectionIds) {
    if (!session) return false;
    const {data, error} = await supabase
      .from('accomplishments')
      .update({text: newText, category: newCategory, is_featured: newIsFeatured, updated_at: new Date().toISOString()})
      .eq('id', accomplishmentId)
      .select('id, text, category, is_featured, completed_at')
      .single();
    if (error) {
      console.error('Could not edit accomplishment:', error);
      return false;
    }

    const {error: deleteMembershipsError} = await supabase
      .from('accomplishment_collection_memberships')
      .delete()
      .eq('accomplishment_id', accomplishmentId);
    if (deleteMembershipsError) {
      console.error('Could not remove old accomplishment collections:', deleteMembershipsError);
      return false;
    }

    if (newCollectionIds.length > 0) {
      const newMembershipRows = newCollectionIds.map(collectionId => ({
        accomplishment_id: accomplishmentId,
        collection_id: collectionId,
      }));
      const {error: insertMembershipsError} = await supabase
        .from('accomplishment_collection_memberships')
        .insert(newMembershipRows);
      if (insertMembershipsError) {
        console.error('Could not save new accomplishment collections:', insertMembershipsError);
        return false;
      }
    }

    setAccomplishments(currentAccomplishments => currentAccomplishments.map(acc =>
      acc.id === accomplishmentId
        ? {...acc, text: data.text, category: data.category, isFeatured: data.is_featured,
          collectionIds: newCollectionIds,}
        : acc
    ));
    return true;
  }
  async function deleteGoal(goalId) {
    if (!session) return false;
    const {error} = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
    if (error) {
      console.error('Could not delete goal:', error);
      return false;
    } 
    setGoals(currentGoals => currentGoals.filter(goal=>goal.id!==goalId));
    return true;
  }

  async function toggleAccomplishmentFeatured(accomplishmentId) {
    if (!session) return;
    const accomplishment = accomplishments.find(acc=>acc.id===accomplishmentId);
    if (!accomplishment) return;
    const {data, error} = await supabase
      .from('accomplishments')
      .update({is_featured: !accomplishment.isFeatured, updated_at: new Date().toISOString()})
      .eq('id', accomplishmentId)
      .select('is_featured')
      .single();
    if (error) {
      console.error('Could not update accomplishment:', error);
      return;
    }
    setAccomplishments(currentAccomplishments =>
      currentAccomplishments.map(acc => acc.id === accomplishmentId
      ? { ...acc, isFeatured: data.is_featured }: acc));
  }
  
  async function deleteAccomplishment(accomplishmentId) {
    if (!session) return;
    const {error} = await supabase
      .from('accomplishments')
      .delete()
      .eq('id', accomplishmentId)
    if (error) {
      console.error('Could not delete accomplishment:', error);
      return;
    }
    setAccomplishments(current => current.filter(acc=>acc.id!==accomplishmentId))
  }

  async function addCollection(collectionName) {
    if (!session) return false;
    const {data, error} = await supabase
      .from('collections')
      .insert({user_id: session.user.id, name:collectionName})
      .select('id, name, created_at')
      .single();
    if (error) {
      console.error('Could not add collection:', error);
      return false;
    }
    const newCollection = {id: data.id, name: data.name, createdAt: new Date(data.created_at).getTime()};
  
    setCollections(currentCollections => [newCollection,...currentCollections,]);
    return true;
  }
  async function editCollection(collectionId, newName) {
    if (!session) return false;
    return withLoading(async () => {

      const { data, error } = await supabase
      .from('collections')
      .update({name: newName, updated_at: new Date().toISOString(),})
      .eq('id', collectionId)
      .select('id, name, created_at')
      .single();
    if (error) {
      console.error('Could not edit collection:', error);
      return false;
    }

    setCollections(currentCollections => currentCollections.map(
      collection => collection.id === collectionId
          ? {...collection, name: data.name} : collection));
      return true;
    });
  }
  async function deleteCollection(collectionId) {
    if (!session) return;
    const {error} = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
    if (error) {
      console.error('Could not delete collection:', error);
      return;
    }
    setCollections(currentCollections =>currentCollections.filter(
      collection => collection.id !== collectionId));
    setLifeLogEntries(currentEntries =>
      removeCollectionFromItems(currentEntries, collectionId));
    setGoals(currentGoals =>
      removeCollectionFromItems(currentGoals, collectionId));
    setAccomplishments(currentAccomplishments =>
      removeCollectionFromItems(currentAccomplishments,collectionId));
    return;
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
    const fileInput = e.target;
    const file = fileInput.files[0]; /*get file*/
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

  if (isCheckingSession) return <p>Loading...</p>
  if(!session) return <AuthForm />

  return (
    <main>
      <header>
        <h1> 
          <img src={logo} alt="Lifebud Logo" className="lifebud-logo" />
          Lifebud
        </h1>
        <p>Your private space to remember, reflect, and grow.</p>
        <button type="button" onClick={handleLogout}>Log Out</button>
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
            collections={collections}
            onToggleFeatured={toggleAccomplishmentFeatured} 
            onDeleteAccomplishment={deleteAccomplishment}
            onEditAccomplishment={editAccomplishment} />
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
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </main>
  );
}
