import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Menu, 
  X, 
  Award, 
  BookOpen, 
  Camera, 
  Video, 
  Lock, 
  Plus, 
  Trash2,
  Download,
  Terminal,
  Instagram,
  Ghost,
  Code2,
  Send,
  User,
  MessageSquare,
  MapPin,
  Quote,
  Scan
} from 'lucide-react';
import Hero3D from './components/Hero3D';
import Modal from './components/Modal';
import { getItems, getProfile, addItem, deleteItem } from './services/storageService';
import { Item, Category, ContentType, UserProfile } from './types';

// --- Typing Effect Component ---
const TypingEffect = ({ text, delay = 0, speed = 50 }: { text: string; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, started, speed]);

  return (
    <span>
      {displayedText}
      <span className="cursor-blink text-cyan-400">_</span>
    </span>
  );
};

// --- Navbar Component ---
const Navbar = ({ toggleAdmin, scrollTo, isAdmin }: { toggleAdmin: () => void, scrollTo: (id: string) => void, isAdmin: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'About', id: 'about' },
    { name: 'Academic', id: 'academic' },
    { name: 'Creative', id: 'creative' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#030014]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(79,70,229,0.2)] font-geek">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => scrollTo('hero')}>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:from-purple-300 group-hover:to-cyan-300 transition-all">
              HG.
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollTo(link.id)}
                  className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] tracking-widest"
                >
                  {link.name.toUpperCase()}
                </button>
              ))}
              <button
                onClick={toggleAdmin}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isAdmin ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'}`}
              >
                {isAdmin ? 'LOGOUT' : <Lock size={16} />}
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="md:hidden bg-[#030014] border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => { scrollTo(link.id); setIsOpen(false); }}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left tracking-widest"
              >
                {link.name.toUpperCase()}
              </button>
            ))}
             <button
                onClick={() => { toggleAdmin(); setIsOpen(false); }}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left tracking-widest"
              >
                {isAdmin ? 'LOGOUT' : 'ADMIN'}
              </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

// --- Tab Button Component ---
const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 relative tracking-wider ${
            active 
            ? 'text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-transparent' 
            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
        }`}
    >
        {label}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-white/20"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

// --- Main App Component ---
function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Tabs State
  const [activeAcademicTab, setActiveAcademicTab] = useState<ContentType>(ContentType.PROJECT);
  const [activeCreativeTab, setActiveCreativeTab] = useState<ContentType>(ContentType.CINEMATOGRAPHY);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // Admin Form State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>(Category.ACADEMIC);
  const [newItemType, setNewItemType] = useState<ContentType>(ContentType.PROJECT);
  const [newItemMedia, setNewItemMedia] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemTags, setNewItemTags] = useState('');

  // Parallax Effect
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 500]);
  const textY = useTransform(scrollY, [0, 1000], [0, 200]);

  const refreshData = useCallback(() => {
    setItems(getItems());
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === '123456') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Incorrect Password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      title: newItemTitle,
      description: newItemDesc,
      category: newItemCategory,
      type: newItemType,
      mediaUrl: newItemMedia,
      linkUrl: newItemLink,
      tags: newItemTags.split(',').map(t => t.trim()).filter(t => t),
    });
    // Reset form
    setNewItemTitle('');
    setNewItemDesc('');
    setNewItemMedia('');
    setNewItemLink('');
    setNewItemTags('');
    refreshData();
    alert('Item added successfully!');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
      refreshData();
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you ${contactForm.name}! Your message has been sent (simulated).`);
    setContactForm({ name: '', email: '', message: '' });
  };

  // Filter Items
  const filteredAcademicItems = items.filter(i => i.category === Category.ACADEMIC && i.type === activeAcademicTab);
  const filteredCreativeItems = items.filter(i => i.category === Category.CREATIVE && i.type === activeCreativeTab);

  const academicTabs = [
      { id: ContentType.PROJECT, label: 'PROJECTS' },
      { id: ContentType.CERTIFICATION, label: 'CERTIFICATIONS' },
      { id: ContentType.SKILL, label: 'SKILLS' },
      { id: ContentType.PROFICIENCY, label: 'PROFICIENCY' },
      { id: ContentType.MENTOR, label: 'MENTORS' },
      { id: ContentType.REVIEW, label: 'REVIEWS' },
  ];

  const creativeTabs = [
      { id: ContentType.CINEMATOGRAPHY, label: 'CINEMATOGRAPHY' },
      { id: ContentType.VIDEO_EDIT, label: 'VIDEO EDITS' },
      { id: ContentType.PHOTOGRAPHY, label: 'PHOTOGRAPHY' },
      { id: ContentType.TRIP, label: 'TRIPS' },
  ];

  const renderItemCard = (item: Item) => {
    const isAcademic = item.category === Category.ACADEMIC;
    
    return (
      <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ y: -8, boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.4)" }}
          className={`group relative bg-[#0f0c29]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${isAcademic ? 'font-academic border-l-4 border-l-purple-500' : 'font-creative border-b-4 border-b-cyan-500'}`}
          onClick={() => setSelectedItem(item)}
      >
          {item.type !== ContentType.REVIEW && (
              <div className="h-48 overflow-hidden relative">
                  <img 
                      src={item.mediaUrl || 'https://images.unsplash.com/photo-1531297461136-82lw8e1c4358'} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium px-4 py-2 border border-white/50 bg-black/30 backdrop-blur-md rounded-full font-geek">View</span>
                  </div>
              </div>
          )}
          <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                  {item.type === ContentType.REVIEW && <Quote className="text-purple-400 mb-2" size={24} />}
                  {isAdmin && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                          className="text-red-500 hover:text-red-400 ml-auto"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
              </div>
              <h3 className={`text-xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors ${isAcademic ? 'tracking-tight' : 'tracking-wide'}`}>
                 {isAcademic ? (
                    <div className="min-h-[1.75rem]">
                        <span className="text-purple-400 mr-2">{'>'}</span>
                        <TypingEffect text={item.title} speed={30} delay={200} />
                    </div>
                 ) : (
                    item.title
                 )}
              </h3>
              {item.type === ContentType.REVIEW && item.author && <p className="text-sm text-cyan-400 mb-2">- {item.author}</p>}
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed opacity-90">{item.description}</p>
          </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30 font-geek">
      <Navbar 
        toggleAdmin={() => isAdmin ? handleLogout() : setShowAdminLogin(true)} 
        scrollTo={scrollTo} 
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 w-full h-full z-0">
            <Hero3D />
        </motion.div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15),transparent_50%)] z-0 pointer-events-none"></div>
        
        <motion.div style={{ y: textY }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl font-light text-cyan-300 mb-4 tracking-[0.2em] uppercase glow-text font-geek">
              Hello, I am
            </h2>
            <h1 className="text-5xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] font-geek tracking-tighter">
              {profile.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed font-academic">
              {profile.title} at {profile.university}.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold">Bridging logic & creativity.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => scrollTo('academic')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full backdrop-blur-sm transition-all flex items-center gap-2 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] font-academic tracking-wide group"
              >
                <Terminal size={18} className="text-cyan-400 group-hover:animate-pulse" />
                ACADEMICS
              </button>
              <button 
                onClick={() => scrollTo('creative')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-creative tracking-wider"
              >
                <Camera size={18} />
                CREATIVE
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 relative z-10 bg-[#05051a]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* INTRIGUING PHOTO EFFECT START */}
            <div className="relative group w-full max-w-md mx-auto md:mx-0">
               {/* Animated Gradient Border */}
               <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-70 group-hover:opacity-100 blur-md transition duration-500 animate-pulse"></div>
               
               <div className="relative aspect-[3/4] bg-[#0f0c29] rounded-2xl overflow-hidden border border-white/10">
                   {/* Scanning Line */}
                   <motion.div 
                      className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                   />
                   
                   {/* The Photo */}
                   {/* NOTE: Please ensure 'hriday.jpg' is in the public folder */}
                   <img 
                     src={profile.avatarUrl} 
                     onError={(e) => {
                         // Only use fallback if explicit file fails, helpful for preview environments
                         e.currentTarget.src = 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800';
                         console.warn("Could not load hriday.jpg. Please ensure the file is uploaded to the public directory.");
                     }}
                     alt={profile.name} 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-110"
                   />
                   
                   {/* Tech Overlay Grid */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                   
                   {/* Corner Accents */}
                   <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-400 opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                   <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-400 opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                   
                   {/* Status Badge */}
                   <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white font-geek tracking-widest">SYSTEM ONLINE</span>
                   </div>
               </div>
            </div>
            {/* INTRIGUING PHOTO EFFECT END */}
            
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 flex items-center gap-3 font-geek tracking-tighter">
                <span className="text-purple-500">01.</span> About Me
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 font-academic">
                {profile.about}
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-gray-300 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                  <BookOpen className="text-cyan-400" size={24} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-geek tracking-wider">Degree</p>
                    <p className="font-medium font-academic">{profile.degree}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors">
                  <Award className="text-purple-400" size={24} />
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-geek tracking-wider">University</p>
                     <p className="font-medium font-academic">{profile.university}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academic Section */}
      <section id="academic" className="py-24 px-4 relative z-10 bg-[#030014]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-geek tracking-tighter">
              <span className="text-purple-500">02.</span> &lt;Academic_Works /&gt;
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
                {academicTabs.map(tab => (
                    <TabButton 
                        key={tab.id} 
                        active={activeAcademicTab === tab.id} 
                        onClick={() => setActiveAcademicTab(tab.id)} 
                        label={tab.label} 
                    />
                ))}
            </div>
          </div>
          
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-academic"
          >
             <AnimatePresence mode="popLayout">
                {filteredAcademicItems.length > 0 ? (
                    filteredAcademicItems.map(renderItemCard)
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-500 font-academic">
                        <p>{'>'} No content initialized in this sector.</p>
                    </div>
                )}
             </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Creative Section */}
      <section id="creative" className="py-24 px-4 relative z-10 bg-[#05051a]">
         <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-creative tracking-widest">
                <span className="text-cyan-500">03.</span> Creative Portfolio
            </h2>
             <div className="flex flex-wrap justify-center gap-2 mt-8">
                {creativeTabs.map(tab => (
                    <TabButton 
                        key={tab.id} 
                        active={activeCreativeTab === tab.id} 
                        onClick={() => setActiveCreativeTab(tab.id)} 
                        label={tab.label} 
                    />
                ))}
            </div>
          </div>

          <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
             <AnimatePresence mode="popLayout">
                {filteredCreativeItems.map(renderItemCard)}
             </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 relative z-10 bg-[#030014] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-geek tracking-tighter">
                    <span className="text-pink-500">04.</span> Contact Me
                </h2>
                <p className="text-gray-400 font-academic">Have a question or want to work together? Drop me a message!</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 bg-[#0f0c29]/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-[0_0_50px_rgba(100,100,255,0.1)]">
                <div className="space-y-8">
                    <div className="flex items-center gap-4 text-gray-300">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-geek tracking-wider">EMAIL</p>
                            <a href="mailto:hriday@example.com" className="hover:text-white transition-colors font-academic">hriday@example.com</a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 text-gray-300">
                        <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-geek tracking-wider">LOCATION</p>
                            <p className="font-academic">Sharda University, India</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4 font-academic">
                    <div>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Name" 
                                value={contactForm.name}
                                onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                required
                                className="w-full bg-[#030014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
                            />
                        </div>
                    </div>
                    <div>
                         <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email"
                                value={contactForm.email}
                                onChange={e => setContactForm({...contactForm, email: e.target.value})} 
                                required
                                className="w-full bg-[#030014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <textarea 
                                placeholder="Message" 
                                value={contactForm.message}
                                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                                required
                                rows={4}
                                className="w-full bg-[#030014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-3 rounded-lg hover:from-purple-500 hover:to-cyan-500 transition-all shadow-[0_5px_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 font-geek tracking-widest"
                    >
                        <Send size={18} /> INITIALIZE_SEND
                    </button>
                </form>
            </div>
        </div>
      </section>

      {/* Footer / Connect Section */}
      <footer className="py-12 bg-[#02000f] border-t border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
             <h3 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-geek tracking-wider">CONNECT_NODES</h3>
             <div className="flex flex-wrap justify-center gap-6 mb-12">
                <a 
                    href="https://www.instagram.com/_hridayy.12" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-white/5 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 group"
                >
                    <Instagram size={24} className="text-gray-300 group-hover:text-white" />
                </a>
                <a 
                    href="https://www.linkedin.com/in/hriday-gupta1119" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-white/5 hover:bg-[#0077b5] rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 group"
                >
                    <Linkedin size={24} className="text-gray-300 group-hover:text-white" />
                </a>
                <a 
                    href="https://github.com/hridaycode1119" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-white/5 hover:bg-[#181717] rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 group"
                >
                    <Github size={24} className="text-gray-300 group-hover:text-white" />
                </a>
                <a 
                    href="https://www.snapchat.com/@hirday.1119" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-white/5 hover:bg-[#FFFC00] rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 group"
                >
                    <Ghost size={24} className="text-gray-300 group-hover:text-black" />
                </a>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 text-sm text-gray-500 font-academic">
                <p>© {new Date().getFullYear()} Hriday Gupta. System All Systems Operational.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors">Privacy_Protocol</a>
                    <a href="#" className="hover:text-white transition-colors">ToS</a>
                </div>
             </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <Modal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} title="ROOT ACCESS">
        <div className="space-y-4">
            <p className="text-gray-400 font-academic">Please enter the administrative password to manage content.</p>
            <input 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="password"
                className="w-full bg-[#030014] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-academic"
            />
            <button 
                onClick={handleAdminLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity font-geek tracking-widest"
            >
                AUTHENTICATE
            </button>
        </div>
      </Modal>

      {/* Item Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
            <div className="space-y-6">
                <div className="rounded-xl overflow-hidden aspect-video relative bg-black/50">
                    {selectedItem.mediaUrl && (
                        <img src={selectedItem.mediaUrl} alt={selectedItem.title} className="w-full h-full object-contain" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2 font-geek">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {selectedItem.category} / {selectedItem.type.replace('_', ' ')}
                        </span>
                        {selectedItem.date && <span className="text-gray-500 text-sm">{selectedItem.date}</span>}
                    </div>
                    <h2 className={`text-3xl font-bold mb-4 ${selectedItem.category === Category.CREATIVE ? 'font-creative' : 'font-geek'}`}>{selectedItem.title}</h2>
                    <p className="text-gray-300 leading-relaxed mb-6 font-academic">
                        {selectedItem.description}
                    </p>
                    {selectedItem.tags && (
                        <div className="flex flex-wrap gap-2 mb-6 font-academic text-xs">
                            {selectedItem.tags.map(tag => (
                                <span key={tag} className="text-purple-300 bg-purple-900/30 px-2 py-1 rounded border border-purple-500/20">#{tag}</span>
                            ))}
                        </div>
                    )}
                    {selectedItem.linkUrl && (
                        <a 
                            href={selectedItem.linkUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-white bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] font-geek tracking-wide"
                        >
                            View Source <div className="text-xs">↗</div>
                        </a>
                    )}
                </div>
            </div>
        )}
      </Modal>

      {/* Admin Dashboard */}
      {isAdmin && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0f0c29] border-t border-white/20 p-6 z-50 transition-transform duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] max-h-[50vh] overflow-y-auto font-academic">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 font-geek">
                        <Lock className="text-cyan-400" size={20}/> ADMIN_CONSOLE
                    </h3>
                    <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">TERMINATE_SESSION</button>
                </div>
                
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        required
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    />
                    <select 
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as Category)}
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    >
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as ContentType)}
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    >
                        {Object.values(ContentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                     <input 
                        type="text" 
                        placeholder="Media URL" 
                        value={newItemMedia}
                        onChange={(e) => setNewItemMedia(e.target.value)}
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    />
                     <input 
                        type="text" 
                        placeholder="Link URL" 
                        value={newItemLink}
                        onChange={(e) => setNewItemLink(e.target.value)}
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    />
                     <input 
                        type="text" 
                        placeholder="Tags (comma separated)" 
                        value={newItemTags}
                        onChange={(e) => setNewItemTags(e.target.value)}
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none text-sm"
                    />
                    <textarea 
                        placeholder="Description" 
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        required
                        className="bg-[#030014] border border-white/20 rounded px-3 py-2 focus:border-cyan-500 outline-none md:col-span-2 text-sm"
                        rows={1}
                    />
                    <button 
                        type="submit" 
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded px-4 py-2 flex items-center justify-center gap-2 text-sm font-geek"
                    >
                        <Plus size={18} /> INSERT_ITEM
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
}

export default App;