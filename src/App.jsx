import { useState } from 'react';

const tabs = [
  'Profile',
  'Life Log',
  'Goals', // {id: date.now(), text: 'Goal', category: 'smth'}
  'Accomplishments', // {id: date.now(), text: 'Goal', category: 'smth', completedAt: date.now()}
  'Custom Collections',
];

const goalCategoryLabels = {
  small: 'Small Step',
  big: 'Big Goal',
  milestone: 'Milestone',
}

const accomplishmentCategoryLabels = {
  small: 'Small Win',
  big: 'Big Win',
  milestone: 'Milestone',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [goals, setGoals] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);

  function addGoal(goalText, category) {
    const newGoal = {id: Date.now(), text: goalText, category: category}; //id determined by time added
    setGoals([...goals, newGoal]);
  }

  function completeGoal(goalId) {
    const completedGoal = goals.find(goal => goal.id === goalId);
    if (completedGoal) {
      setAccomplishments([...accomplishments, {...completedGoal, completedAt: Date.now()}]);
      setGoals(goals.filter(goal => goal.id !== goalId));
    }

  }

  return (
    <main>
      <header>
        <h1>Lifebud</h1>
        <p>Your private space to remember, reflect, and grow.</p>
      </header>

      <nav>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Goals' ? (
       <GoalsTab goals={goals} onAddGoal={addGoal} onCompleteGoal={completeGoal} />
      ) : activeTab === 'Accomplishments' ? (
        <AccomplishmentsTab accomplishments={accomplishments} />
      ) :(
        <PlaceholderTab name={activeTab} />
      )}

    </main>
  );
}

function GoalsTab({ goals, onAddGoal, onCompleteGoal }) {
  const [goalText, setGoalText] = useState('');
  const [category, setCategory] = useState('small');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedGoal = goalText.trim();
    if (trimmedGoal === '') return;
    onAddGoal(trimmedGoal, category);
    setGoalText('');
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
          <option value="small">Small Step</option>
          <option value="big">Big Goal</option>
          <option value="milestone">Milestone</option>
        </select>
        <button type="submit">Add Goal</button>
      </form>

      {goals.length===0 ? (
        <p>No goals yet.</p>
      ) : (
        <ul>
          {goals.map(goal => (
            <li key={goal.id}>
              {goal.text} - ({goalCategoryLabels[goal.category]})
              <button onClick={() => onCompleteGoal(goal.id)}>Complete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AccomplishmentsTab({ accomplishments }) {
  return (
    <section>
      <h2>Accomplishments</h2>
      <p>Look how far you've come.</p>

      {accomplishments.length === 0 ? (
        <p>No accomplishments yet.</p>
      ) : (
        <ul>
          {accomplishments.map(accomplishment => (
            <li key={accomplishment.id}>
              {accomplishment.text} - ({accomplishmentCategoryLabels[accomplishment.category]}) 
              (Completed: {new Date(accomplishment.completedAt).toLocaleDateString()})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PlaceholderTab({ name }) {
  return (
    <section>
      <h2>{name}</h2>
      <p>This section is coming soon.</p>
    </section>
  );
}