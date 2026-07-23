import {goalCategoryLabels, accomplishmentCategoryLabels} from '../constants/categories.js';

export default function ProfileTab({ entries, goals, accomplishments }) {
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