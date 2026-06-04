import { NavLink } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'pets', label: 'Pets', path: '/pets' },
  { icon: 'calendar_month', label: 'Bookings', path: '/appointments' },
  { icon: 'notifications', label: 'Reminder', path: '/reminders' },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-surface-variant">
      <div className="flex justify-around items-center max-w-md mx-auto sm:max-w-full sm:px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 flex-1 text-center transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-2xl ${isActive ? 'fill-1' : ''}`}
                >
                  {item.icon}
                </span>
                <span className="text-label-sm block">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
