import React, { useMemo, useState } from 'react';
import BubbleBackground from './components/BubbleBackground.jsx';
import HomeView from './views/HomeView.jsx';
import ModeView from './views/ModeView.jsx';
import AtelierView from './views/AtelierView.jsx';
import GalleryView from './views/GalleryView.jsx';
import LibraryModal from './components/LibraryModal.jsx';
import { listSessions } from './store/useSessionStore.js';

export default function App() {
  const [view, setView] = useState('home');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const [sessionListVersion, setSessionListVersion] = useState(0);

  const sessions = useMemo(() => listSessions(), [sessionListVersion]);

  const openLibrary = () => setLibraryOpen(true);
  const closeLibrary = () => setLibraryOpen(false);
  const goHome = () => setView('home');
  const goGallery = () => setView('gallery');
  const goAtelier = () => setView('atelier');

  const handleSessionLoaded = (session) => {
    setPendingSession(session);
    setView('atelier');
    closeLibrary();
  };

  const refreshSessions = () => setSessionListVersion((v) => v + 1);

  return (
    <div className="app-shell">
      <BubbleBackground />
      <div className="view-layer">
        {view === 'home' && (
          <div className="app-view active">
            <HomeView onStart={() => setView('mode')} onOpenLibrary={openLibrary} onOpenGallery={goGallery} />
          </div>
        )}
        {view === 'mode' && (
          <div className="app-view active">
            <ModeView onBack={() => setView('home')} onSelect={() => setView('atelier')} />
          </div>
        )}
        {view === 'atelier' && (
          <div className="app-view active">
            <AtelierView
              onOpenLibrary={openLibrary}
              onSessionsChange={refreshSessions}
              sessionToLoad={pendingSession}
              onOpenGallery={goGallery}
            />
          </div>
        )}
        {view === 'gallery' && (
          <div className="app-view active">
            <GalleryView onNavigateHome={goHome} onNavigateAtelier={goAtelier} />
          </div>
        )}
      </div>

      <LibraryModal
        open={libraryOpen}
        sessions={sessions}
        onClose={closeLibrary}
        onLoad={handleSessionLoaded}
        onDelete={refreshSessions}
      />
    </div>
  );
}
