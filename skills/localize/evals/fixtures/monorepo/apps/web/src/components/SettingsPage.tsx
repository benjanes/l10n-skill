import React, { useState } from 'react';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>
      <p>Manage your account preferences and security options.</p>

      <section>
        <h2>Notifications</h2>
        <label>
          <input type="checkbox" /> Email notifications
        </label>
        <label>
          <input type="checkbox" /> Push notifications
        </label>
      </section>

      <section>
        <h2>Danger Zone</h2>
        <p>Once you delete your account, there is no going back.</p>
        <button className="btn-danger">Delete Account</button>
      </section>

      <div className="actions">
        <button onClick={handleSave}>Save</button>
        <button>Cancel</button>
        {saved && <span className="toast">Changes saved successfully!</span>}
      </div>
    </div>
  );
}
