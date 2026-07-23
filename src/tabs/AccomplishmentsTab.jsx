import { accomplishmentCategoryLabels } from '../constants/categories.js';

export default function AccomplishmentsTab({ accomplishments, onToggleFeatured, onDeleteAccomplishment }) {
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