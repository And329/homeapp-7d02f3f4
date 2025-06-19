
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, PlusCircle, User, LogOut, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import MessageNotificationBadge from './MessageNotificationBadge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Homeapp.ae</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition-colors text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              to="/properties"
              className="text-gray-700 hover:text-primary transition-colors text-sm lg:text-base"
            >
              Properties
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-primary transition-colors text-sm lg:text-base"
            >
              Blog
            </Link>
            <Link
              to="/news"
              className="text-gray-700 hover:text-primary transition-colors text-sm lg:text-base"
            >
              News
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary transition-colors text-sm lg:text-base"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
            ) : user ? (
              <>
                <Link
                  to="/list-property"
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                >
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">List Property</span>
                  <span className="lg:hidden">List</span>
                </Link>
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className="relative"
                >
                  <MessageNotificationBadge onClick={() => navigate('/profile')} />
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm max-w-24 sm:max-w-none"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{userProfile?.full_name || 'Profile'}</span>
                </Link>
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-red-600 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/auth"
                  className="text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="bg-primary text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/properties"
                className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              <Link
                to="/blog"
                className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/news"
                className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
              ) : user ? (
                <>
                  <Link
                    to="/list-property"
                    className="flex items-center space-x-2 text-primary font-medium text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>List Property</span>
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Messages</span>
                    <MessageNotificationBadge />
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>{userProfile?.full_name || 'My Profile'}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors text-left text-sm sm:text-base"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <Link
                    to="/auth"
                    className="text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
