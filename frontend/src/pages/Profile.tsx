import { useState, type ChangeEvent, type FormEvent } from "react";

import "../styles/Profile.css";

type Gender = "" | "male" | "female" | "prefer-not";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very-active";

type UserProfile = {
  fullName: string;
  email: string;
  bio: string;
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  photo: string;
};

const defaultProfile: UserProfile = {
  fullName: "",
  email: "",
  bio: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  activityLevel: "moderate",
  photo: "",
};

// Load a previously saved profile
function loadProfile(): UserProfile {
  try {
    const savedProfile = localStorage.getItem("userProfile");

    if (!savedProfile) {
      return defaultProfile;
    }

    return {
      ...defaultProfile,
      ...JSON.parse(savedProfile),
    };
  } catch {
    return defaultProfile;
  }
}

// Return the activity multiplier used for TDEE
function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case "sedentary":
      return 1.2;

    case "light":
      return 1.375;

    case "active":
      return 1.725;

    case "very-active":
      return 1.9;

    case "moderate":
    default:
      return 1.55;
  }
}

// Return the BMI weight category
function getBmiCategory(bmi: number | null): string {
  if (bmi === null) {
    return "Enter height and weight";
  }

  if (bmi < 18.5) {
    return "Below normal range";
  }

  if (bmi < 25) {
    return "Normal range";
  }

  if (bmi < 30) {
    return "Above normal range";
  }

  return "High range";
}

function Profile() {
  // Load the saved profile when the page opens
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Track page messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Convert number fields from strings
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);

  // Calculate BMI
  const bmi =
    height > 0 && weight > 0 ? weight / Math.pow(height / 100, 2) : null;

  // Calculate BMR using the Mifflin-St Jeor equation
  let bmr: number | null = null;

  if (
    age > 0 &&
    height > 0 &&
    weight > 0 &&
    (profile.gender === "male" || profile.gender === "female")
  ) {
    bmr =
      profile.gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Calculate estimated daily energy expenditure
  const tdee =
    bmr !== null ? bmr * getActivityMultiplier(profile.activityLevel) : null;

  // Update one profile field
  function updateProfile(field: keyof UserProfile, value: string) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));

    setMessage("");
  }

  // Upload a profile picture
  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Keep the file small enough for localStorage
    if (file.size > 2 * 1024 * 1024) {
      setError("The profile image must be smaller than 2 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a JPG or PNG image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        photo: reader.result as string,
      }));

      setError("");
      setMessage("");
    };

    reader.readAsDataURL(file);
  }

  // Save the profile
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));

      // Update the profile information displayed in the sidebar
      window.dispatchEvent(new Event("profileUpdated"));

      setError("");
      setMessage("Your profile was saved.");
    } catch {
      setMessage("");
      setError(
        "Could not save your profile. Try using a smaller profile image.",
      );
    }
  }

  // Remove the current profile picture
  function removePhoto() {
    setProfile((currentProfile) => ({
      ...currentProfile,
      photo: "",
    }));

    setMessage("");
  }

  return (
    <main className="profile-main">
      {/* Page heading */}
      <header className="profile-header">
        <div>
          <p className="profile-label">Health profile</p>

          <h1>My Profile</h1>

          <p>Manage your personal and health information.</p>
        </div>

        <div className="profile-header-icon">
          <i className="bi bi-person" aria-hidden="true" />
        </div>
      </header>

      {/* Status messages */}
      {message && (
        <div className="profile-message profile-success" role="status">
          <i className="bi bi-check-circle-fill" aria-hidden="true" />

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="profile-message profile-error" role="alert">
          <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />

          <span>{error}</span>
        </div>
      )}

      {/* Health calculations */}
      <section className="profile-stat-grid">
        {/* BMI */}
        <article className="profile-stat bmi-stat">
          <div>
            <span>BMI</span>

            <strong>{bmi !== null ? bmi.toFixed(1) : "—"}</strong>

            <small>{getBmiCategory(bmi)}</small>
          </div>

          <i className="bi bi-heart-pulse" aria-hidden="true" />
        </article>

        {/* BMR */}
        <article className="profile-stat bmr-stat">
          <div>
            <span>BMR</span>

            <strong>{bmr !== null ? Math.round(bmr) : "—"}</strong>

            <small>Estimated calories per day</small>
          </div>

          <i className="bi bi-fire" aria-hidden="true" />
        </article>

        {/* TDEE */}
        <article className="profile-stat tdee-stat">
          <div>
            <span>TDEE</span>

            <strong>{tdee !== null ? Math.round(tdee) : "—"}</strong>

            <small>Estimated daily calorie needs</small>
          </div>

          <i className="bi bi-lightning-charge" aria-hidden="true" />
        </article>
      </section>

      {/* Profile form */}
      <form className="profile-card" onSubmit={handleSubmit}>
        {/* Profile picture */}
        <section className="profile-photo-section">
          <div className="profile-photo">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={`${profile.fullName || "User"} profile`}
              />
            ) : (
              <i className="bi bi-person" aria-hidden="true" />
            )}
          </div>

          <div className="profile-photo-actions">
            <label className="profile-upload-button">
              <i className="bi bi-camera" aria-hidden="true" />
              Upload Photo
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handlePhotoChange}
              />
            </label>

            {profile.photo && (
              <button
                className="profile-remove-photo"
                type="button"
                onClick={removePhoto}
              >
                Remove
              </button>
            )}
          </div>

          <small>JPG or PNG. Maximum size: 2 MB.</small>
        </section>

        {/* Personal information */}
        <section className="profile-form-section">
          <div className="profile-section-heading">
            <i className="bi bi-person" aria-hidden="true" />

            <h2>Personal Details</h2>
          </div>

          <div className="profile-form-grid">
            {/* Full name */}
            <div className="profile-field">
              <label htmlFor="profileName">Full name</label>

              <input
                id="profileName"
                type="text"
                value={profile.fullName}
                onChange={(event) =>
                  updateProfile("fullName", event.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div className="profile-field">
              <label htmlFor="profileEmail">Email address</label>

              <input
                id="profileEmail"
                type="email"
                value={profile.email}
                onChange={(event) => updateProfile("email", event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Biography */}
            <div className="profile-field profile-full-field">
              <label htmlFor="profileBio">Bio (optional)</label>

              <textarea
                id="profileBio"
                value={profile.bio}
                onChange={(event) => updateProfile("bio", event.target.value)}
                placeholder="Tell us a little about yourself..."
                rows={4}
              />
            </div>

            {/* Age */}
            <div className="profile-field">
              <label htmlFor="profileAge">Age</label>

              <input
                id="profileAge"
                type="number"
                min="13"
                max="120"
                value={profile.age}
                onChange={(event) => updateProfile("age", event.target.value)}
                placeholder="Enter your age"
                required
              />
            </div>

            {/* Gender */}
            <div className="profile-field">
              <label htmlFor="profileGender">Gender</label>

              <select
                id="profileGender"
                value={profile.gender}
                onChange={(event) =>
                  updateProfile("gender", event.target.value)
                }
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            {/* Height */}
            <div className="profile-field">
              <label htmlFor="profileHeight">Height (cm)</label>

              <input
                id="profileHeight"
                type="number"
                min="50"
                max="260"
                step="0.1"
                value={profile.height}
                onChange={(event) =>
                  updateProfile("height", event.target.value)
                }
                placeholder="For example, 172"
                required
              />
            </div>

            {/* Weight */}
            <div className="profile-field">
              <label htmlFor="profileWeight">Weight (kg)</label>

              <input
                id="profileWeight"
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={profile.weight}
                onChange={(event) =>
                  updateProfile("weight", event.target.value)
                }
                placeholder="For example, 68"
                required
              />
            </div>

            {/* Activity level */}
            <div className="profile-field profile-full-field">
              <label htmlFor="activityLevel">Activity level</label>

              <select
                id="activityLevel"
                value={profile.activityLevel}
                onChange={(event) =>
                  updateProfile("activityLevel", event.target.value)
                }
              >
                <option value="sedentary">
                  Sedentary — little or no exercise
                </option>

                <option value="light">
                  Light — exercise 1–3 days per week
                </option>

                <option value="moderate">
                  Moderate — exercise 3–5 days per week
                </option>

                <option value="active">
                  Active — exercise 6–7 days per week
                </option>

                <option value="very-active">
                  Very active — intense daily exercise
                </option>
              </select>

              <small>
                Activity level affects the estimated TDEE calculation.
              </small>
            </div>
          </div>
        </section>

        {/* Form buttons */}
        <div className="profile-actions">
          <button
            className="profile-reset-button"
            type="button"
            onClick={() => {
              setProfile(defaultProfile);
              setMessage("");
              setError("");
            }}
          >
            Reset
          </button>

          <button className="profile-save-button" type="submit">
            <i className="bi bi-check-lg" aria-hidden="true" />
            Save Profile
          </button>
        </div>
      </form>

      {/* Health calculation note */}
      <p className="profile-disclaimer">
        BMI, BMR, and TDEE are general estimates and are not medical advice.
      </p>
    </main>
  );
}

export default Profile;
