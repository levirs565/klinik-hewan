import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge, Avatar, BottomNavigation } from "../components";
import { usePets } from "../hooks/usePets";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { pets, isError: error, isLoading } = usePets();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-md text-on-surface">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary fill-1">
                pets
              </span>
            </div>
            <span className="text-headline-md text-on-surface font-600">
              VetConnect
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-on-surface">
              logout
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-6 space-y-8">
        {/* Greeting */}
        <section>
          <h1 className="text-headline-lg text-on-surface mb-2">
            Hello, {user?.full_name.split(" ")[0]}.
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Here is the latest update on your companions. Everything looks good
            today.
          </p>
        </section>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg">
            Failed to load pets. Please try again.
          </div>
        )}

        {/* Book a Visit CTA */}
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-primary to-primary-container overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="text-white/20">
              <span className="material-symbols-outlined text-6xl">pets</span>
            </div>
            <div className="flex-1">
              <h2 className="text-headline-md text-on-primary mb-2">
                Book a Visit
              </h2>
              <p className="text-body-md text-on-primary mb-4 opacity-90">
                Schedule a checkup, vaccination, or grooming session.
              </p>
              <Link to="/appointments">
                <Button variant="secondary" size="sm">
                  Book Now
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Active Appointment */}
        {pets.length > 0 && (
          <section>
            <h2 className="text-headline-md text-on-surface mb-4">
              Active Appointment
            </h2>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={pets[0].avatar_url}
                    alt={pets[0].name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-headline-sm text-on-surface font-600">
                        {pets[0].name}
                      </h3>
                      <Badge variant="success" size="sm">
                        DITERIMA
                      </Badge>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      General Checkup
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-variant">
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      DATE & TIME
                    </p>
                    <p className="text-body-md text-on-surface font-600">
                      Today, 14:30
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      QUEUE NUMBER
                    </p>
                    <p className="text-body-md text-on-surface font-600">
                      A-04
                    </p>
                  </div>
                </div>

                <Link to={`/appointments/${pets[0].id}`} className="block">
                  <Button variant="tertiary" fullWidth>
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          </section>
        )}

        {/* Health Reminders */}
        <section>
          <h2 className="text-headline-md text-on-surface mb-4">
            Health Reminders
          </h2>
          <div className="space-y-3">
            <Card className="bg-error-container/10 border-error-container/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-3xl">
                  medical_information
                </span>
                <div className="flex-1">
                  <h3 className="text-body-md text-on-surface font-600">
                    Rabies Vaccination
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    Max • In 5 days
                  </p>
                </div>
                <span className="material-symbols-outlined text-error">
                  close
                </span>
              </div>
            </Card>

            <Card className="bg-primary-fixed/10 border-primary-fixed/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary fill-1 text-3xl">
                  medication
                </span>
                <div className="flex-1">
                  <h3 className="text-body-md text-on-surface font-600">
                    Morning Meds (Apoquel)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    Luna •
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary">
                  done
                </span>
              </div>
            </Card>
          </div>
        </section>

        {/* My Pets */}
        <section>
          <h2 className="text-headline-md text-on-surface mb-4">My Pets</h2>
          <div className="grid grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`}>
                <Card
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  className="text-center cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <Avatar
                    src={pet.avatar_url}
                    alt={pet.name}
                    size="xl"
                    initials={pet.name.substring(0, 2).toUpperCase()}
                  />
                  <h3 className="text-body-md text-on-surface font-600 mt-3">
                    {pet.name}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    {pet.species} •{" "}
                    {new Date(pet.birth_date).getFullYear() ===
                    new Date().getFullYear()
                      ? "Young"
                      : `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} yrs`}
                  </p>
                </Card>
              </Link>
            ))}
            <Link to="/add-pet">
              <Card className="flex items-center justify-center h-full cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-primary">
                      add
                    </span>
                  </div>
                  <p className="text-label-md text-primary">Add Pet</p>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};
