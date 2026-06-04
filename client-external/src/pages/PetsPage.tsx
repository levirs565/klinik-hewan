import { Link } from "react-router-dom";
import { Avatar, BottomNavigation, Card } from "../components";
import { usePets } from "../hooks/usePets";

export const PetsPage = () => {
  const { pets, isLoading } = usePets();

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-headline-md text-on-surface font-600">My Pets</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">
                hourglass_empty
              </span>
            </div>
            <p className="text-body-md text-on-surface">Loading pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">
              pets
            </span>
            <h2 className="text-headline-md text-on-surface mb-2">
              No pets yet
            </h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Add your first pet to get started
            </p>
            <Link to="/add-pet">
              <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:bg-primary-container transition-colors">
                Add Pet
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {pets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex gap-4">
                    <Avatar
                      src={pet.avatar_url}
                      alt={pet.name}
                      size="lg"
                      initials={pet.name.substring(0, 2).toUpperCase()}
                    />
                    <div className="flex-1">
                      <h3 className="text-headline-sm text-on-surface font-600">
                        {pet.name}
                      </h3>
                      <p className="text-body-md text-on-surface-variant">
                        {pet.species} • {pet.breed}
                      </p>
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        {pet.gender} •{" "}
                        {new Date().getFullYear() -
                          new Date(pet.birth_date).getFullYear()}{" "}
                        years old
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            <Link to="/add-pet">
              <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer flex items-center justify-center py-8">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-primary block mb-2">
                    add
                  </span>
                  <p className="text-body-md text-primary font-600">
                    Add Another Pet
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
