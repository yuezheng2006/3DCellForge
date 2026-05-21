import { BookOpen, Box, ChevronDown, Grid3X3, Library, MonitorPlay, ScrollText, Settings } from 'lucide-react'

const HEADER_TEXT = {
  en: {
    title: '3D汽车展厅',
    subtitle: '3D探索、定制和展示汽车',
    Gallery: '展厅',
    Library: '车型库',
    Notebooks: '规格',
    Logs: '日志',
    Settings: '设置',
    Demo: '演示',
  },
  zh: {
    title: '3D汽车展厅',
    subtitle: '3D探索、定制和展示汽车',
    Gallery: '展厅',
    Library: '车型库',
    Notebooks: '规格',
    Logs: '日志',
    Settings: '设置',
    Demo: '演示',
  },
}

export function StudioHeader({ activePanel, setActivePanel, demoMode, language = 'en', onToggleDemoMode, onNotify }) {
  const text = HEADER_TEXT[language] || HEADER_TEXT.en

  function openPanel(panel) {
    const next = activePanel === panel ? null : panel
    setActivePanel(next)
    onNotify(next ? `${panel} opened` : `${panel} closed`)
  }

  return (
    <header className="studio-header">
      <div className="studio-brand">
        <div className="brand-mark">
          <Box size={30} />
        </div>
        <div>
          <strong>{text.title}</strong>
          <span>{text.subtitle}</span>
        </div>
      </div>
      <nav className="studio-nav">
        <button type="button" className={activePanel === 'Gallery' ? 'active' : ''} onClick={() => openPanel('Gallery')}>
          <Grid3X3 size={15} />
          {text.Gallery}
        </button>
        <button type="button" className={activePanel === 'Library' ? 'active' : ''} onClick={() => openPanel('Library')}>
          <Library size={15} />
          {text.Library}
        </button>
        <button type="button" className={activePanel === 'Notebooks' ? 'active' : ''} onClick={() => openPanel('Notebooks')}>
          <BookOpen size={15} />
          {text.Notebooks}
        </button>
        <button type="button" className={activePanel === 'Logs' ? 'active' : ''} onClick={() => openPanel('Logs')}>
          <ScrollText size={15} />
          {text.Logs}
        </button>
        <button type="button" className={activePanel === 'Settings' ? 'active' : ''} onClick={() => openPanel('Settings')}>
          <Settings size={15} />
          {text.Settings}
        </button>
        <button type="button" className={demoMode ? 'active' : ''} onClick={onToggleDemoMode}>
          <MonitorPlay size={15} />
          {text.Demo}
        </button>
      </nav>
      <button type="button" className={activePanel === 'Profile' ? 'profile-button active' : 'profile-button'} onClick={() => openPanel('Profile')}>
        <Box size={18} />
        <ChevronDown size={13} />
      </button>
    </header>
  )
}
