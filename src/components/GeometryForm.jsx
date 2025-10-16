import { useState } from 'react';
import './GeometryForm.css';

const GeometryForm = ({ onSave, onCancel, geometryType }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metadata: {},
  });

  const [metadataFields, setMetadataFields] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMetadataField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const handleMetadataChange = (index, field, value) => {
    const newFields = [...metadataFields];
    newFields[index][field] = value;
    setMetadataFields(newFields);
  };

  const handleRemoveMetadataField = (index) => {
    const newFields = metadataFields.filter((_, i) => i !== index);
    setMetadataFields(newFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const metadata = {};
    metadataFields.forEach(field => {
      if (field.key) {
        metadata[field.key] = field.value;
      }
    });

    onSave({
      ...formData,
      metadata,
    });
  };

  return (
    <div className="geometry-form-overlay">
      <div className="geometry-form">
        <h3>Add {geometryType} Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Metadata</label>
            <button 
              type="button" 
              onClick={handleAddMetadataField}
              className="add-metadata-btn"
            >
              + Add Field
            </button>
            
            {metadataFields.map((field, index) => (
              <div key={index} className="metadata-field">
                <input
                  type="text"
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveMetadataField(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeometryForm;
