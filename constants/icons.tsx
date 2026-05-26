import {
  Shield01Icon,
  LockIcon,
  Key01Icon,
  SecurityCheckIcon,
  FingerPrintIcon,
  ScanEyeIcon,
  Radar01Icon,
  Bug01Icon,
  FirewallIcon,
  EncryptIcon,
  Blockchain01Icon,
  CodeIcon,
  BrowserIcon,
  GlobeIcon,
  CloudIcon,
  EyeIcon,
  AlertCircleIcon,
  AiBrain01Icon,
  NeuralNetworkIcon,
  BinaryCodeIcon,
  ApiIcon,
  IncognitoIcon,
  DashboardBrowsingIcon,
  LockPasswordIcon,
  ShieldBlockchainIcon,
  SecurityIcon,
  AccessIcon,
} from "@hugeicons/core-free-icons";

const ScatteredIcons = [
  // Left side — security & protection
  { type: "icon", icon: Shield01Icon, size: "w-8 h-8", position: "top-[10%] left-[5%]", rotation: -5, color: "text-blue-400/40" },
  { type: "icon", icon: LockIcon, size: "w-10 h-10", position: "top-[20%] left-[3%]", rotation: 8, color: "text-blue-400/25" },
  { type: "icon", icon: FingerPrintIcon, size: "w-7 h-7", position: "top-[35%] left-[2%]", rotation: -12, color: "text-blue-400/30" },
  { type: "icon", icon: FirewallIcon, size: "w-9 h-9", position: "top-[50%] left-[4%]", rotation: 15, color: "text-blue-400/35" },
  { type: "icon", icon: Key01Icon, size: "w-8 h-8", position: "top-[65%] left-[3%]", rotation: -8, color: "text-blue-400/25" },
  { type: "icon", icon: BrowserIcon, size: "w-9 h-9", position: "top-[80%] left-[5%]", rotation: 10, color: "text-blue-400/30" },

  // Right side — AI & monitoring
  { type: "icon", icon: AiBrain01Icon, size: "w-8 h-8", position: "top-[15%] right-[5%]", rotation: -15, color: "text-blue-400/35" },
  { type: "icon", icon: Radar01Icon, size: "w-7 h-7", position: "top-[30%] right-[3%]", rotation: 7, color: "text-blue-400/25" },
  { type: "icon", icon: EyeIcon, size: "w-6 h-6", position: "top-[45%] right-[4%]", rotation: 12, color: "text-blue-400/30" },
  { type: "icon", icon: NeuralNetworkIcon, size: "w-8 h-8", position: "top-[60%] right-[3%]", rotation: -7, color: "text-blue-400/35" },
  { type: "icon", icon: Bug01Icon, size: "w-7 h-7", position: "top-[75%] right-[5%]", rotation: 9, color: "text-blue-400/25" },
  { type: "password", size: "w-16 h-6", position: "top-[25%] right-[2%]", rotation: 3, color: "text-blue-400/30" },

  // Top — threat detection & scanning
  { type: "icon", icon: ScanEyeIcon, size: "w-9 h-9", position: "top-[2%] left-[25%]", rotation: 15, color: "text-blue-400/30" },
  { type: "icon", icon: IncognitoIcon, size: "w-8 h-8", position: "top-[1%] left-[45%]", rotation: -8, color: "text-blue-400/25" },
  { type: "icon", icon: GlobeIcon, size: "w-7 h-7", position: "top-[3%] left-[65%]", rotation: -9, color: "text-blue-400/35" },
  { type: "icon", icon: AlertCircleIcon, size: "w-6 h-6", position: "top-[2%] right-[25%]", rotation: 11, color: "text-blue-400/30" },

  // Bottom — data & infrastructure
  { type: "icon", icon: ApiIcon, size: "w-7 h-7", position: "bottom-[5%] left-[20%]", rotation: -7, color: "text-blue-400/35" },
  { type: "icon", icon: CloudIcon, size: "w-6 h-6", position: "bottom-[8%] left-[40%]", rotation: 13, color: "text-blue-400/25" },
  { type: "icon", icon: BinaryCodeIcon, size: "w-7 h-7", position: "bottom-[6%] left-[60%]", rotation: -10, color: "text-blue-400/30" },
  { type: "icon", icon: DashboardBrowsingIcon, size: "w-6 h-6", position: "bottom-[4%] right-[30%]", rotation: 5, color: "text-blue-400/35" },
  { type: "icon", icon: Blockchain01Icon, size: "w-7 h-7", position: "bottom-[7%] right-[15%]", rotation: -8, color: "text-blue-400/25" },

  // Boxed accent icons — scattered highlights
  { type: "icon", icon: EncryptIcon, size: "w-6 h-6", position: "top-[12%] left-[15%]", rotation: 5, color: "text-blue-400/50" },
  { type: "icon", icon: ShieldBlockchainIcon, size: "w-7 h-7", position: "top-[28%] right-[12%]", rotation: -8, color: "text-blue-400/50" },
  { type: "icon", icon: SecurityIcon, size: "w-6 h-6", position: "top-[40%] left-[12%]", rotation: 12, color: "text-blue-400/50" },
  { type: "icon", icon: LockPasswordIcon, size: "w-6 h-6", position: "top-[55%] right-[10%]", rotation: -6, color: "text-blue-400/50" },
  { type: "icon", icon: SecurityCheckIcon, size: "w-6 h-6", position: "bottom-[12%] left-[15%]", rotation: -4, color: "text-blue-400/50" },
  { type: "icon", icon: AccessIcon, size: "w-7 h-7", position: "bottom-[10%] right-[20%]", rotation: 8, color: "text-blue-400/50" },
  { type: "icon", icon: CodeIcon, size: "w-8 h-8", position: "top-[38%] right-[8%]", rotation: -10, color: "text-blue-400/30" },
];

export default ScatteredIcons;
