import React, { useMemo, useState } from 'react';
import BubbleBackground from './components/BubbleBackground.jsx';
import Header from './components/Header.jsx';
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
  const [atelierHeader, setAtelierHeader] = useState(null);

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
      <Header
        activeView={view}
        onNavigateHome={goHome}
        onNavigateAtelier={goAtelier}
        onNavigateGallery={goGallery}
        onOpenLibrary={openLibrary}
        sessionName={view === 'atelier' ? atelierHeader?.sessionName : null}
        onSaveSession={view === 'atelier' ? atelierHeader?.onSaveSession : undefined}
      />
      <div className="view-layer">
        {view === 'home' && (
          <div className="app-view active">
            <HomeView onStart={() => setView('atelier')} onOpenLibrary={openLibrary} onOpenGallery={goGallery} />
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
              onHeaderUpdate={setAtelierHeader}
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
