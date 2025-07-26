import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Heart, History as HistoryIcon, Home, Crown, CreditCard, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const location = useLocation();
  const { user, isAuthenticated, isPremium, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t } = useTranslation();

  const isActive = (path) => location.pathname === path;

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // User is logged in, show dropdown is handled by DropdownMenu
      return;
    } else {
      setShowLoginModal(true);
    }
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  // Safe translation function
  const safeT = (key, fallback) => {
    try {
      return t(key) || fallback;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">ZP</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{safeT('app.name', 'ZenPress')}</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <LanguageSelector variant="compact" />
              
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link to="/" className="flex items-center space-x-1">
                  <Home size={16} />
                  <span className="hidden sm:inline">{safeT('navigation.home', 'Início')}</span>
                </Link>
              </Button>

              {/* Premium Plans Button */}
              <Button 
                variant={isActive('/payment') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link to="/payment" className="flex items-center space-x-1">
                  <Crown size={16} className="text-yellow-500" />
                  <span className="hidden sm:inline">{safeT('navigation.premium', 'Premium')}</span>
                </Link>
              </Button>

              {/* Consultation Button */}
              <Button 
                variant={isActive('/consultation') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link to="/consultation" className="flex items-center space-x-1">
                  <MessageCircle size={16} className="text-green-500" />
                  <span className="hidden sm:inline">{safeT('navigation.consultation', 'Consulta')}</span>
                </Link>
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    variant={isActive('/favorites') ? "default" : "ghost"} 
                    size="sm" 
                    asChild
                  >
                    <Link to="/favorites" className="flex items-center space-x-1">
                      <Heart size={16} />
                      <span className="hidden sm:inline">{safeT('navigation.favorites', 'Favoritos')}</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant={isActive('/history') ? "default" : "ghost"} 
                    size="sm" 
                    asChild
                  >
                    <Link to="/history" className="flex items-center space-x-1">
                      <HistoryIcon size={16} />
                      <span className="hidden sm:inline">{safeT('navigation.history', 'Histórico')}</span>
                    </Link>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        {isPremium && (
                          <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                          {isPremium && (
                            <Badge className="w-fit bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/payment" className="cursor-pointer">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Planos e Pagamentos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites" className="cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favoritos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/history" className="cursor-pointer">
                          <HistoryIcon className="mr-2 h-4 w-4" />
                          <span>Histórico</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={handleAuthAction} size="sm">
                  <User size={16} className="mr-1" />
                  <span className="hidden sm:inline">{t('navigation.login')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Navigation;