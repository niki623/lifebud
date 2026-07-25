import { accomplishmentCategoryLabels } from '../constants/categories.js';

export default function AccomplishmentsTab({ accomplishments, onToggleFeatured, onDeleteAccomplishment }) {
  return (
    <section>
      <p>Look how far you've come.</p>

      {accomplishments.length === 0 ? (
        <p>No accomplishments yet.</p>
      ) : (
        <ul className="entry-list">
          {accomplishments.map(accomplishment => (
            <li key={accomplishment.id} className="entry-card">
              <h3>{accomplishment.text}</h3>
              <small>
                {accomplishmentCategoryLabels[accomplishment.category]} · Completed{' '}
                {new Date(accomplishment.completedAt).toLocaleDateString()}
              </small>
              
              <div className="entry-actions">
                <label>
                  <input type="checkbox" checked={accomplishment.isFeatured ?? false}
                    onChange={() => onToggleFeatured(accomplishment.id)}
                  />
                  Feature on Profile
                </label>
                <button onClick={() => onDeleteAccomplishment(accomplishment.id)}>Delete</button>
              </div> 

            </li>
          ))}
        </ul>
      )}
    </section>
  );
}