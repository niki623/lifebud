import {useState } from 'react';
import { goalCategoryLabels } from '../constants/categories.js';

export default function GoalsTab({ goals, onAddGoal, onCompleteGoal, onDeleteGoal, onEditGoal }) {
  const [goalText, setGoalText] = useState('');
  const [category, setCategory] = useState('small');
  const [isFeatured, setIsFeatured] = useState(false);

  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalText, setEditGoalText] = useState('');
  const [editCategory, setEditCategory] = useState('small');
  const [editIsFeatured, setEditIsFeatured] = useState(false);

  function startEditingGoal(goal) {
    setEditGoalId(goal.id);
    setEditGoalText(goal.text);
    setEditCategory(goal.category);
    setEditIsFeatured(goal.isFeatured ?? false);
  }
  function saveEdit(){
    const trimmedText = editGoalText.trim();
    if(trimmedText === '') return;
    onEditGoal(editGoalId, trimmedText, editCategory, editIsFeatured);
    setEditGoalId(null);
    setEditGoalText('');
    setEditCategory('small');
    setEditIsFeatured(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedGoal = goalText.trim();
    if (trimmedGoal === '') return;
    onAddGoal(trimmedGoal, category, isFeatured);
    setGoalText('');
    setIsFeatured(false);
  }

  return (
    <section>
      <h2>Goals</h2>
      <p>What do you want to work toward?</p>
      <form onSubmit={handleSubmit}>
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
          {goals.map(goal => (
            <li key={goal.id} className="entry-card">
              {editGoalId === goal.id ? (
                <>
                  <input
                    value={editGoalText}
                    placeholder="Edit goal"
                    onChange={(e) => setEditGoalText(e.target.value)}
                  />
                  <select 
                    value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                    <option value="milestone">Milestone</option>
                  </select>
                  <label>
                    <input
                      type="checkbox"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                    />
                    Feature on Profile
                  </label>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditGoalId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <p>{goal.text} - ({goalCategoryLabels[goal.category]})</p>
                  <button onClick={() => startEditingGoal(goal)}>Edit</button> {' '}
                  <button onClick={() => onCompleteGoal(goal.id)}>Complete</button> {' '}
                  <button onClick={() => onDeleteGoal(goal.id)}>Delete</button> {' '}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
