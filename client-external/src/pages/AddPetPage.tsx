import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, BottomNavigation } from "../components";
import { useCreatePet } from "../hooks/usePets";

const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "rabbit", label: "Rabbit" },
  { value: "bird", label: "Bird" },
  { value: "other", label: "Other" },
];

const BREED_OPTIONS = {
  dog: [
    { value: "labrador", label: "Labrador Retriever" },
    { value: "golden", label: "Golden Retriever" },
    { value: "german_shepherd", label: "German Shepherd" },
    { value: "beagle", label: "Beagle" },
  ],
  cat: [
    { value: "persian", label: "Persian" },
    { value: "siamese", label: "Siamese" },
    { value: "bengal", label: "Bengal" },
    { value: "mixed", label: "Mixed" },
  ],
};

export const AddPetPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trigger: createPetTrigger, isCreating: isLoading } = useCreatePet();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    gender: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validation
      const newErrors: Record<string, string> = {};
      if (!formData.name) newErrors.name = "Pet name is required";
      if (!formData.species) newErrors.species = "Species is required";
      if (!formData.breed) newErrors.breed = "Breed is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.date_of_birth)
        newErrors.date_of_birth = "Date of birth is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await createPetTrigger({
        data: {
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          color: formData.color,
          gender: formData.gender as "male" | "female",
          date_of_birth: formData.date_of_birth,
        },
        file: avatarFile || undefined,
      });

      navigate("/pets");
    } catch (error: unknown) {
      console.error("Create pet error:", error);
      setErrors({ general: "Failed to create pet. Please try again." });
    }
  };

  const breedOptions =
    BREED_OPTIONS[formData.species as keyof typeof BREED_OPTIONS] || [];

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">
              arrow_back
            </span>
          </button>
          <h1 className="text-headline-md text-on-surface font-600">
            Add New Pet
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative"
            >
              <div
                className={`
                  w-40 h-40 rounded-3xl border-4 border-dashed border-surface-variant
                  flex items-center justify-center cursor-pointer
                  hover:border-primary hover:bg-primary-fixed/10 transition-all
                  overflow-hidden
                  ${avatarPreview ? "border-solid" : ""}
                `}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Pet preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">
                      camera_alt
                    </span>
                    <p className="text-label-md text-on-surface-variant">
                      Upload Pet Photo
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
          </div>
          <p className="text-center text-body-md text-on-surface-variant">
            {avatarPreview ? "Photo added" : "No photo selected"}
          </p>

          {errors.avatar && (
            <p className="text-center text-label-sm text-error">
              {errors.avatar}
            </p>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Identity Section */}
          <div className="space-y-4">
            <h2 className="text-headline-md text-on-surface font-600">
              Identity
            </h2>

            <Input
              label="Pet Name"
              type="text"
              name="name"
              placeholder="e.g. Bella"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Select
              label="Species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              options={SPECIES_OPTIONS}
              placeholder="Select species"
              error={errors.species}
              required
            />

            <Select
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              options={breedOptions}
              placeholder="Start typing to search breeds..."
              error={errors.breed}
              required
              disabled={!formData.species}
            />

            <Input
              label="Color / Markings"
              type="text"
              name="color"
              placeholder="e.g. Black and white"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          {/* Physical Details Section */}
          <div className="space-y-4">
            <h2 className="text-headline-md text-on-surface font-600">
              Physical Details
            </h2>

            <div>
              <label className="block text-label-md text-on-surface mb-3">
                Gender <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female"].map((option) => (
                  <label
                    key={option}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer text-center transition-all
                      ${
                        formData.gender === option
                          ? "border-primary bg-primary-fixed/10"
                          : "border-surface-variant hover:border-primary"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-body-md font-600 text-on-surface capitalize">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-label-sm text-error mt-1">{errors.gender}</p>
              )}
            </div>

            <Input
              label="Date of Birth / Est. Age"
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              error={errors.date_of_birth}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Submit"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
          </div>
          <Button
            type="button"
            variant="tertiary"
            fullWidth
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
};
