import {useState } from 'react';
import { goalCategoryLabels } from '../constants/categories.js';

export default function GoalsTab({ goals, collections,onAddGoal, onCompleteGoal, onDeleteGoal, onEditGoal }) {
  const [goalText, setGoalText] = useState('');
  const [category, setCategory] = useState('small');
  const [isFeatured, setIsFeatured] = useState(false);
  const [collectionIds, setCollectionIds] = useState([]);

  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalText, setEditGoalText] = useState('');
  const [editCategory, setEditCategory] = useState('small');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCollectionIds, setEditCollectionIds] = useState([]);

  function startEditingGoal(goal) {
    setEditGoalId(goal.id);
    setEditGoalText(goal.text);
    setEditCategory(goal.category);
    setEditIsFeatured(goal.isFeatured ?? false);
    setEditCollectionIds(goal.collectionIds ?? []);
  }
  async function saveEdit(){
    const trimmedText = editGoalText.trim();
    if(trimmedText === '') return;
    const wasSaved = await onEditGoal(
      editGoalId, trimmedText, editCategory, editIsFeatured, editCollectionIds);
    if (!wasSaved) return;
    setEditGoalId(null);
    setEditGoalText('');
    setEditCategory('small');
    setEditIsFeatured(false);
    setEditCollectionIds([]);
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
    const trimmedGoal = goalText.trim();
    if (trimmedGoal === '') return;
    const wasAdded = await onAddGoal(trimmedGoal, category, isFeatured, collectionIds);
    if (!wasAdded) return;
    setGoalText('');
    setCategory('small');
    setIsFeatured(false);
    setCollectionIds([]);
  }

  return (
    <section>
      <p>What do you want to work toward?</p>
      <form className="entry-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={goalText}
          placeholder="Enter a new goal"
          onChange={(e) => setGoalText(e.target.value)}
        />
        <select 
        value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="small">Small</option>
          <option value="big">Big</option>
          <option value="milestone">Milestone</option>
        </select>
        <fieldset>
          <legend>Collections</legend>
          {collections.length === 0 ? (
            <p>No collections available.</p>
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
        <button type="submit">Add Goal</button>
      </form>

      {goals.length===0 ? (
        <p>No goals yet.</p>
      ) : (
        <ul className="entry-list">
          {goals.map(goal => {
            const isEditing = editGoalId === goal.id;

            return (
              <li key={goal.id} className="entry-card">
                {/*Text*/}
                <h3>
                  {isEditing ? (
                    <input
                      value={editGoalText}
                      placeholder="Edit goal"
                      onChange={(e) => setEditGoalText(e.target.value)}
                    />
                  ) : (
                    goal.text
                  )}
                </h3>
                
                {/*Category*/}
                {isEditing ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                    <option value="milestone">Milestone</option>
                  </select>
                ) : (
                  <p>{goalCategoryLabels[goal.category]}</p>
                )}

                {/*Collections*/}
                {isEditing && (
                  <>
                    <div className="collection-row">
                      <p className="edit-label">Add to collections:</p>
                      <div className="entry-collections">
                        {collections.map(collection => (
                          <span
                            key={collection.id}
                            className={
                              editCollectionIds.includes(collection.id)
                                ? 'collection-chip selected'
                                : 'collection-chip'
                            }
                            onClick={() => {
                              setEditCollectionIds(currentIds =>
                                currentIds.includes(collection.id)
                                  ? currentIds.filter(id => id !== collection.id)
                                  : [...currentIds, collection.id]
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

                <div className="entry-actions goal-actions">
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={() => setEditGoalId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="complete-button" onClick={() => onCompleteGoal(goal.id)}>
                        Complete
                      </button>
                      <div className="goal-edit-delete">
                        <button onClick={() => startEditingGoal(goal)}>Edit</button>
                        <button onClick={() => onDeleteGoal(goal.id)}>Delete</button>
                      </div>
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
