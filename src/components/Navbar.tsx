
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Menu, User, LogOut, Settings, Home, Building2, BookOpen, Newspaper, Contact, UserPlus, Plus, Info, Users, FileText } from 'lucide-react';
import MessageNotificationBadge from './MessageNotificationBadge';
import NotificationBadge from './NotificationBadge';
import NotificationsList from './NotificationsList';
import LanguageSwitcher from './LanguageSwitcher';
import UnitsToggle from './UnitsToggle';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: t('navbar.home'), icon: Home },
    { path: '/properties', label: t('navbar.properties'), icon: Building2 },
    { path: '/projects', label: 'Projects', icon: Building2 },
    { path: '/blog', label: t('navbar.blog'), icon: BookOpen },
    { path: '/news', label: t('navbar.news'), icon: Newspaper },
    { path: '/information', label: t('navbar.information'), icon: Info },
    { path: '/team', label: t('navbar.team'), icon: Users },
    { path: '/instructions', label: t('navbar.instructions'), icon: FileText },
    { path: '/contact', label: t('navbar.contact'), icon: Contact },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 gap-1 sm:gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-xl text-gray-900">HomeApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Language Switcher, Auth buttons/User menu */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
            {/* Language Switcher - Hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {user ? (
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Notifications */}
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <div>
                      <NotificationBadge />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] sm:w-[500px] p-0" align="end">
                    <NotificationsList />
                  </PopoverContent>
                </Popover>
                
                {/* Message Notifications */}
                <MessageNotificationBadge onClick={() => navigate('/messages')} />

                {/* List Property Button - Hidden on mobile */}
                <Button asChild variant="outline" size="sm" className="hidden sm:flex px-2 sm:px-3">
                  <Link to="/list-property" className="flex items-center space-x-1 sm:space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('navbar.listProperty')}</span>
                  </Link>
                </Button>


                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={profile?.profile_picture || ''} alt={profile?.full_name || ''} />
                        <AvatarFallback>
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {profile?.full_name && (
                          <p className="font-medium">{profile.full_name}</p>
                        )}
                        {user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {t('navbar.profile')}
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('navbar.admin')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm" className="px-1.5 sm:px-3 text-xs sm:text-sm h-7 sm:h-9">
                  <Link to="/auth">{t('navbar.login')}</Link>
                </Button>
                <Button asChild size="sm" className="px-1.5 sm:px-3 text-xs sm:text-sm h-7 sm:h-9">
                  <Link to="/auth" className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">{t('navbar.signup')}</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-1.5 h-7 sm:h-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {/* Language Switcher and Units Toggle in mobile menu */}
                    <div className="px-3 py-2 border-b space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Language / Язык:</span>
                        <LanguageSwitcher />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Units & Currency:</span>
                        <UnitsToggle />
                      </div>
                    </div>

                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isActive(item.path)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                     })}
                     
                     {!user && (
                       <>
                         <div className="border-t pt-4 mt-4">
                           <Link
                             to="/auth"
                             onClick={() => setIsOpen(false)}
                             className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                           >
                             <User className="h-5 w-5" />
                             <span>{t('navbar.login')}</span>
                           </Link>
                           <Link
                             to="/auth"
                             onClick={() => setIsOpen(false)}
                             className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                           >
                             <UserPlus className="h-5 w-5" />
                             <span>{t('navbar.signup')}</span>
                           </Link>
                         </div>
                       </>
                     )}
                     
                     {user && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <Link
                            to="/list-property"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="h-5 w-5" />
                            <span>{t('navbar.listProperty')}</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                          >
                            <User className="h-5 w-5" />
                            <span>{t('navbar.profile')}</span>
                          </Link>
                          {profile?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                            >
                              <Settings className="h-5 w-5" />
                              <span>{t('navbar.admin')}</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 w-full text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
