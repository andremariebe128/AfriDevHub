import {
  ArrowBigUp, ArrowRight, Bold, Braces, CircleAlert, CircleCheck, Eye, EyeOff, Lightbulb, Link2, LogOut, ThumbsUp, X,
  MessageSquareReply, Award, Bell, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, CloudOff, Code, Command, Compass, Download,
  ExternalLink, FolderGit2, Globe, Handshake, Heart, House, Inbox, Languages, Leaf, MapPin, MessageCircle, Monitor, Moon, Plus, Rocket,
  Search, SearchX, Share2, Smartphone, SquarePen, Star, Sun, Target, Terminal, Trophy, User, Users, WifiOff, Zap, type LucideIcon,
} from 'lucide-react';

/** Jeu d'icônes unique (Lucide) : tout le front passe par ce fichier. */
type P = { className?: string };
const make = (Icon: LucideIcon, size: string, stroke = 2) =>
  function Ico({ className }: P) {
    return <Icon className={className ?? size} strokeWidth={stroke} aria-hidden="true" />;
  };

export const IHome = make(House, 'h-6 w-6');
export const ICompass = make(Compass, 'h-6 w-6');
export const IChat = make(MessageCircle, 'h-6 w-6');
export const IBell = make(Bell, 'h-6 w-6');
export const ISearch = make(Search, 'h-5 w-5');
export const IShare = make(Share2, 'h-5 w-5');
export const IPlus = make(Plus, 'h-7 w-7', 2.5);
export const IEdit = make(SquarePen, 'h-6 w-6');
export const IUp = make(ChevronUp, 'h-5 w-5');
export const IDown = make(ChevronDown, 'h-5 w-5');
export const ICheck = make(Check, 'h-4 w-4', 2.5);
export const ISolved = make(CheckCircle2, 'h-4 w-4');
export const IExternal = make(ExternalLink, 'h-4 w-4');
export const IDownload = make(Download, 'h-4 w-4');
export const IPin = make(MapPin, 'h-4 w-4');
export const ILang = make(Languages, 'h-4 w-4');
export const IGlobe = make(Globe, 'h-5 w-5');
export const IUser = make(User, 'h-4 w-4');
export const ILeaf = make(Leaf, 'h-4 w-4');
export const IZap = make(Zap, 'h-4 w-4');
export const IOffline = make(WifiOff, 'h-4 w-4');
export const IRocket = make(Rocket, 'h-6 w-6');
export const ITarget = make(Target, 'h-6 w-6');
export const ITrophy = make(Trophy, 'h-6 w-6');
export const IMentor = make(Handshake, 'h-5 w-5');

export const ISun = make(Sun, 'h-4 w-4');
export const IMoon = make(Moon, 'h-4 w-4');
export const IMonitor = make(Monitor, 'h-4 w-4');
export const IArrow = make(ArrowRight, 'h-4 w-4');
export const IChevron = make(ChevronRight, 'h-4 w-4');
export const IPhone = make(Smartphone, 'h-5 w-5');
export const IUsers = make(Users, 'h-5 w-5');
export const ICode = make(Code, 'h-5 w-5');
export const ITerminal = make(Terminal, 'h-4 w-4');
export const ICommand = make(Command, 'h-3 w-3');
export const IFolder = make(FolderGit2, 'h-5 w-5');
export const IVote = make(ArrowBigUp, 'h-5 w-5');
export const IInbox = make(Inbox, 'h-6 w-6');
export const INoResult = make(SearchX, 'h-6 w-6');
export const ICloudOff = make(CloudOff, 'h-5 w-5');

export const IBold = make(Bold, 'h-4 w-4');
export const IBraces = make(Braces, 'h-4 w-4');
export const ILink = make(Link2, 'h-4 w-4');
export const IEye = make(Eye, 'h-4 w-4');
export const IEyeOff = make(EyeOff, 'h-4 w-4');
export const ITip = make(Lightbulb, 'h-4 w-4');
export const IAlert = make(CircleAlert, 'h-4 w-4');
export const IOk = make(CircleCheck, 'h-4 w-4');
export const IX = make(X, 'h-4 w-4');
export const ILogout = make(LogOut, 'h-4 w-4');
export const IReply = make(MessageSquareReply, 'h-5 w-5');
export const IThumb = make(ThumbsUp, 'h-5 w-5');
export const IAward = make(Award, 'h-5 w-5');

export const IHeart = ({ className, on }: P & { on?: boolean }) => (
  <Heart className={className ?? 'h-5 w-5'} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
);
export const IStar = ({ className, on }: P & { on?: boolean }) => (
  <Star className={className ?? 'h-5 w-5'} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
);
