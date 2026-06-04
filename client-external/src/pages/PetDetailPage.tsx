import { useParams, useNavigate } from "react-router-dom";
import { Avatar, BottomNavigation, Card, Button } from "../components";
import { usePetDetail } from "../hooks/usePets";

export const PetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pet, isLoading, isError } = usePetDetail(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-md text-on-surface">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center px-6">
          <span className="material-symbols-outlined text-6xl text-error mb-4 block">
            error
          </span>
          <h1 className="text-headline-md text-on-surface mb-2">
            Pet not found
          </h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            We couldn't find the pet you're looking for.
          </p>
          <Button onClick={() => navigate("/pets")} variant="primary">
            Back to Pets
          </Button>
        </div>
      </div>
    );
  }

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
            Pet Profile
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar
            src={pet.avatar_url}
            alt={pet.name}
            size="xl"
            initials={pet.name.substring(0, 2).toUpperCase()}
          />
          <h2 className="text-display-sm text-on-surface font-600 mt-4">
            {pet.name}
          </h2>
          <p className="text-title-medium text-on-surface-variant">
            {pet.species} • {pet.breed}
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-variant bg-surface-container-low">
              <h3 className="text-title-medium text-on-surface font-600 flex items-center gap-2">
                <span className="material-symbols-outlined">info</span>
                Information
              </h3>
            </div>
            <div className="divide-y divide-surface-variant">
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-body-md text-on-surface-variant">
                  Species
                </span>
                <span className="text-body-md text-on-surface font-500 capitalize">
                  {pet.species}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-body-md text-on-surface-variant">
                  Breed
                </span>
                <span className="text-body-md text-on-surface font-500">
                  {pet.breed}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-body-md text-on-surface-variant">
                  Gender
                </span>
                <span className="text-body-md text-on-surface font-500 capitalize">
                  {pet.gender}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-body-md text-on-surface-variant">
                  Date of Birth
                </span>
                <span className="text-body-md text-on-surface font-500">
                  {new Date(pet.birth_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {pet.initial_medical_history && (
            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-variant bg-surface-container-low">
                <h3 className="text-title-medium text-on-surface font-600 flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    medical_information
                  </span>
                  Initial Medical History
                </h3>
              </div>
              <div className="px-6 py-6">
                <p className="text-body-md text-on-surface whitespace-pre-wrap">
                  {pet.initial_medical_history}
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
