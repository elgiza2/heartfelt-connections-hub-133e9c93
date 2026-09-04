import {
  Code2,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Microscope,
  Presentation,
  Video as VideoIcon,
  X,
} from "lucide-react";

interface Props {
  chatMode: string;
  mediaModel?: unknown;
  setMediaModel?: (m: any) => void;
  slidesTemplate?: string;
  onOpenTemplatePicker?: () => void;
  onClear: () => void;
  /** Set when the docs agent is active — rendered with the same chip header. */
  isDocsAgent?: boolean;
  /** Set when the dev agent is active — rendered with the same chip header. */
  isDevAgent?: boolean;
}

/** Single source of truth for how every service chip looks/reads. */
const SERVICE_META: Record<
  string,
  { title: string; Icon: React.ElementType }
> = {
  images: { title: "Create image", Icon: ImageIcon },
  video: { title: "Create video", Icon: VideoIcon },
  slides: { title: "Create slides", Icon: Presentation },
  "slides-images": { title: "Create slides", Icon: Presentation },
  code: { title: "Code", Icon: Code2 },
  dev: { title: "Dev", Icon: Code2 },
  "deep-research": { title: "Deep research", Icon: Microscope },
  learning: { title: "Learning", Icon: GraduationCap },
  docs: { title: "Documents", Icon: FileText },
};

/**
 * Slim titled header that lives inside the composer while an image / video /
 * slides / agent mode is active. The model and template pickers themselves
 * are small icon buttons in the bottom control row (see
 * `ComposerServiceQuickButton`) — this panel is just the label + close.
 */
export default function ComposerServicePanel({
  chatMode,
  onClear,
  isDocsAgent,
  isDevAgent,
}: Props) {
  const key = isDocsAgent ? "docs" : isDevAgent ? "dev" : chatMode;
  const meta = SERVICE_META[key];
  if (!meta) return null;

  const title = meta.title;
  const TitleIcon = meta.Icon;

  return (
    <div className="pt-2 pb-1 flex items-center justify-between gap-2 px-0.5">
      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-foreground/60">
        <TitleIcon className="w-3.5 h-3.5" strokeWidth={2.4} />
        {title}
      </span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Close ${title}`}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2.4} />
      </button>
    </div>
  );
}
