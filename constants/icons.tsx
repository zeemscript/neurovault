  import {
  Puzzle,
  Monitor,
  Cookie,
  Compass,
  User,
  Chrome,
  Play,
  Linkedin,
  Settings,
  Network,
  Globe,
  MessageSquare,
  FileText,
  UserPlus,
  Search,
  X,
  Sparkles,
} from "lucide-react";

 const ScatteredIcons = [
    // Icons positioned to the left of the card area
    { type: "icon", icon: Puzzle, size: "w-8 h-8", position: "top-[10%] left-[5%]", rotation: -5, color: "text-blue-400/40" },
    { type: "icon", icon: Monitor, size: "w-10 h-10", position: "top-[20%] left-[3%]", rotation: 8, color: "text-blue-400/30" },
    { type: "icon", icon: Cookie, size: "w-7 h-7", position: "top-[35%] left-[2%]", rotation: -12, color: "text-blue-400/35" },
    { type: "icon", icon: Compass, size: "w-9 h-9", position: "top-[50%] left-[4%]", rotation: 15, color: "text-blue-400/40" },
    { type: "icon", icon: User, size: "w-8 h-8", position: "top-[65%] left-[3%]", rotation: -8, color: "text-blue-400/30" },
    { type: "icon", icon: Chrome, size: "w-9 h-9", position: "top-[80%] left-[5%]", rotation: 10, color: "text-blue-400/35" },
    
    // Icons positioned to the right of the card area
    { type: "icon", icon: Play, size: "w-8 h-8", position: "top-[15%] right-[5%]", rotation: -15, color: "text-blue-400/40" },
    { type: "icon", icon: Linkedin, size: "w-7 h-7", position: "top-[30%] right-[3%]", rotation: 7, color: "text-blue-400/30" },
    { type: "icon", icon: Puzzle, size: "w-6 h-6", position: "top-[45%] right-[4%]", rotation: 12, color: "text-blue-400/35" },
    { type: "icon", icon: Monitor, size: "w-8 h-8", position: "top-[60%] right-[3%]", rotation: -7, color: "text-blue-400/40" },
    { type: "icon", icon: Cookie, size: "w-7 h-7", position: "top-[75%] right-[5%]", rotation: 9, color: "text-blue-400/30" },
    { type: "password", size: "w-16 h-6", position: "top-[25%] right-[2%]", rotation: 3, color: "text-blue-400/40" },
    
    // Icons above the card area
    { type: "icon", icon: Compass, size: "w-9 h-9", position: "top-[2%] left-[25%]", rotation: 15, color: "text-blue-400/35" },
    { type: "icon", icon: User, size: "w-8 h-8", position: "top-[1%] left-[45%]", rotation: -8, color: "text-blue-400/30" },
    { type: "icon", icon: Globe, size: "w-7 h-7", position: "top-[3%] left-[65%]", rotation: -9, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: MessageSquare, size: "w-6 h-6", position: "top-[2%] right-[25%]", rotation: 11, color: "text-blue-400/35", boxColor: "bg-blue-600/10" },
    
    // Icons below the card area
    { type: "icon", icon: FileText, size: "w-7 h-7", position: "bottom-[5%] left-[20%]", rotation: -7, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: UserPlus, size: "w-6 h-6", position: "bottom-[8%] left-[40%]", rotation: 13, color: "text-blue-400/30", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Search, size: "w-7 h-7", position: "bottom-[6%] left-[60%]", rotation: -10, color: "text-blue-400/35", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Settings, size: "w-6 h-6", position: "bottom-[4%] right-[30%]", rotation: 5, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Network, size: "w-7 h-7", position: "bottom-[7%] right-[15%]", rotation: -8, color: "text-blue-400/30", boxColor: "bg-blue-600/10" },
    
    // Blue rounded square icons scattered around
    { type: "icon", icon: Settings, size: "w-6 h-6", position: "top-[12%] left-[15%]", boxColor: "bg-blue-600/20", rotation: 5, color: "text-blue-400/60" },
    { type: "icon", icon: Network, size: "w-7 h-7", position: "top-[28%] right-[12%]", boxColor: "bg-blue-600/20", rotation: -8, color: "text-blue-400/60" },
    { type: "icon", icon: X, size: "w-6 h-6", position: "top-[40%] left-[12%]", boxColor: "bg-blue-600/20", rotation: 12, color: "text-blue-400/60" },
    { type: "letter", letter: "D", size: "w-6 h-6", position: "top-[55%] right-[10%]", boxColor: "bg-blue-600/20", rotation: -6, color: "text-blue-400/60" },
    { type: "letter", letter: "C", size: "w-6 h-6", position: "bottom-[12%] left-[15%]", boxColor: "bg-blue-600/20", rotation: -4, color: "text-blue-400/60" },
    { type: "letter", letter: "Q", size: "w-7 h-7", position: "bottom-[10%] right-[20%]", boxColor: "bg-blue-600/20", rotation: 8, color: "text-blue-400/60" },
    { type: "letter", letter: "M", size: "w-8 h-8", position: "top-[38%] right-[8%]", rotation: -10, color: "text-blue-400/40" },
  ];

    export default ScatteredIcons;